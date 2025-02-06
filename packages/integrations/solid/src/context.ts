import type { RendererContext } from './types.js';

type Context = {
	id: string;
	c: number;
};

const contexts = new WeakMap<RendererContext['result'], Context>();

export function getContext(result: RendererContext['result']): Context {
	if (contexts.has(result)) {
		return contexts.get(result)!;
	}
	let ctx: Context = {
		c: 0,
		get id() {
			return 's' + this.c.toString();
		},
	};
	contexts.set(result, ctx);
	return ctx;
}

export function incrementId(ctx: Context): string {
	let id = ctx.id;
	ctx.c++;
	return id;
}
