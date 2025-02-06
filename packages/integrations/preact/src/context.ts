import type { PropNameToSignalMap, RendererContext, SignalLike } from './types.js';

export type Context = {
	id: string;
	c: number;
	signals: Map<SignalLike, string>;
	propsToSignals: Map<Record<string, any>, PropNameToSignalMap>;
};

const contexts = new WeakMap<RendererContext['result'], Context>();

export function getContext(result: RendererContext['result']): Context {
	if (contexts.has(result)) {
		return contexts.get(result)!;
	}
	let ctx = {
		c: 0,
		get id() {
			return 'p' + this.c.toString();
		},
		signals: new Map(),
		propsToSignals: new Map(),
	};
	contexts.set(result, ctx);
	return ctx;
}

export function incrementId(ctx: Context): string {
	let id = ctx.id;
	ctx.c++;
	return id;
}
