/**
 * The MIT License (MIT)
 * Copyright (c) 2018 Andy Wermke
 * https://github.com/andywer/typed-emitter/blob/9a139b6fa0ec6b0db6141b5b756b784e4f7ef4e4/LICENSE
 */

export type EventMap = {
	[key: string]: (...args: any[]) => void;
};

/**
 * Type-safe event emitter.
 *
 * Use it like this:
 *
 * ```typescript
 * type MyEvents = {
 *   error: (error: Error) => void;
 *   message: (from: string, content: string) => void;
 * }
 *
 * const myEmitter = new EventEmitter() as TypedEmitter<MyEvents>;
 *
 * myEmitter.emit("error", "x")  // <- Will catch this type error;
 * ```
 */
export interface TypedEventEmitter<Events extends EventMap> {
	addListener<E extends keyof Events>(event: E, listener: Events[E]): this;
	on<E extends keyof Events>(event: E, listener: Events[E]): this;
	once<E extends keyof Events>(event: E, listener: Events[E]): this;
	prependListener<E extends keyof Events>(event: E, listener: Events[E]): this;
	prependOnceListener<E extends keyof Events>(event: E, listener: Events[E]): this;

	off<E extends keyof Events>(event: E, listener: Events[E]): this;
	removeAllListeners<E extends keyof Events>(event?: E): this;
	removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;

	emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean;
	// The sloppy `eventNames()` return type is to mitigate type incompatibilities - see #5
	eventNames(): (keyof Events | string | symbol)[];
	rawListeners<E extends keyof Events>(event: E): Events[E][];
	listeners<E extends keyof Events>(event: E): Events[E][];
	listenerCount<E extends keyof Events>(event: E): number;

	getMaxListeners(): number;
	setMaxListeners(maxListeners: number): this;
}
