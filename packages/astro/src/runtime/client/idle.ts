import type { ClientDirective } from '../../types/public/integrations.js';

const idleDirective: ClientDirective = (load, options) => {
	const cb = async () => {
		const hydrate = await load();
		await hydrate();
	};

	const rawOptions =
		typeof options.value === 'object' ? (options.value as IdleRequestOptions) : undefined;

	const idleOptions: IdleRequestOptions = {
		timeout: rawOptions?.timeout,
	};

	if ('requestIdleCallback' in window) {
		(window as any).requestIdleCallback(cb, idleOptions);
	} else {
		setTimeout(cb, idleOptions.timeout || 200);
	}
};

export default idleDirective;
