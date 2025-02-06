import type { HydrationMetadata } from '../hydration.js';

const RenderInstructionSymbol = Symbol.for('astro:render');

export type RenderDirectiveInstruction = {
	type: 'directive';
	hydration: HydrationMetadata;
};

export type RenderHeadInstruction = {
	type: 'head';
};

/**
 * Render a renderer-specific hydration script before the first component of that
 * framework
 */
export type RendererHydrationScriptInstruction = {
	type: 'renderer-hydration-script';
	rendererName: string;
	render: () => string;
};

export type MaybeRenderHeadInstruction = {
	type: 'maybe-head';
};

export type RenderInstruction =
	| RenderDirectiveInstruction
	| RenderHeadInstruction
	| MaybeRenderHeadInstruction
	| RendererHydrationScriptInstruction;

export function createRenderInstruction(
	instruction: RenderDirectiveInstruction,
): RenderDirectiveInstruction;
export function createRenderInstruction(
	instruction: RendererHydrationScriptInstruction,
): RendererHydrationScriptInstruction;
export function createRenderInstruction(instruction: RenderHeadInstruction): RenderHeadInstruction;
export function createRenderInstruction(
	instruction: MaybeRenderHeadInstruction,
): MaybeRenderHeadInstruction;
export function createRenderInstruction(instruction: { type: string }): RenderInstruction {
	return Object.defineProperty(instruction as RenderInstruction, RenderInstructionSymbol, {
		value: true,
	});
}

export function isRenderInstruction(chunk: any): chunk is RenderInstruction {
	return chunk && typeof chunk === 'object' && chunk[RenderInstructionSymbol];
}
