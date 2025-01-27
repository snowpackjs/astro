import type { FSWatcher } from 'vite';

type WatchEventName = 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir';
type WatchEventCallback = (path: string) => void;

export type WrappedWatcher = FSWatcher & {
	removeAllTrackedListeners(): void;
};

// This lets us use the standard Vite FSWatcher, but also track all listeners added by the content loaders
// We do this so we can remove them all when we re-sync.
export function createWatcherWrapper(watcher: FSWatcher): WrappedWatcher {
	const listeners = new Map<WatchEventName, Set<WatchEventCallback>>();

	const handler: ProxyHandler<FSWatcher> = {
		get(target, prop, receiver) {
			// Intercept the 'on' method and track the listener
			if (prop === 'on') {
				return function (event: WatchEventName, callback: WatchEventCallback) {
					if (!listeners.has(event)) {
						listeners.set(event, new Set());
					}

					// Track the listener
					listeners.get(event)!.add(callback);

					// Call the original method
					return Reflect.get(target, prop, receiver).call(target, event, callback);
				};
			}

			// Intercept the 'off' method
			if (prop === 'off') {
				return function (event: WatchEventName, callback: WatchEventCallback) {
					// Remove from our tracking
					listeners.get(event)?.delete(callback);

					// Call the original method
					return Reflect.get(target, prop, receiver).call(target, event, callback);
				};
			}

			// Adds a function to remove all listeners added by us
			if (prop === 'removeAllTrackedListeners') {
				return function () {
					for (const [event, callbacks] of listeners.entries()) {
						for (const callback of callbacks) {
							target.off(event, callback);
						}
						callbacks.clear();
					}
					listeners.clear();
				};
			}

			// Return original method/property for everything else
			return Reflect.get(target, prop, receiver);
		},
	};

	return new Proxy(watcher, handler) as WrappedWatcher;
}
