import type { RenderInstruction } from './instruction.js';

import type { SSRResult } from '../../../types/public/internal.js';
import type { HTMLBytes, HTMLString } from '../escape.js';
import { markHTMLString } from '../escape.js';
import {
	type PrescriptType,
	determineIfNeedsHydrationScript,
	determinesIfNeedsDirectiveScript,
	getPrescripts,
} from '../scripts.js';
import { renderAllHeadContent } from './head.js';
import { isRenderInstruction } from './instruction.js';
import { type SlotString, isSlotString } from './slot.js';

/**
 * Possible chunk types to be written to the destination, and it'll
 * handle stringifying them at the end.
 *
 * NOTE: Try to reduce adding new types here. If possible, serialize
 * the custom types to a string in `renderChild` in `any.ts`.
 */
export type RenderDestinationChunk =
	| string
	| HTMLBytes
	| HTMLString
	| SlotString
	| ArrayBufferView
	| RenderInstruction
	| Response;

export interface RenderDestination {
	/**
	 * Any rendering logic should call this to construct the HTML output.
	 * See the `chunk` parameter for possible writable values.
	 */
	write(chunk: RenderDestinationChunk): void;
}

export interface RenderInstance {
	render: RenderFunction;
}

export type RenderFunction = (destination: RenderDestination) => Promise<void> | void;

export const Fragment = Symbol.for('astro:fragment');
export const Renderer = Symbol.for('astro:renderer');

export const encoder = new TextEncoder();
export const decoder = new TextDecoder();

// Rendering produces either marked strings of HTML or instructions for hydration.
// These directive instructions bubble all the way up to renderPage so that we
// can ensure they are added only once, and as soon as possible.
function stringifyChunk(
	result: SSRResult,
	chunk: string | HTMLString | SlotString | RenderInstruction,
): string {
	if (isRenderInstruction(chunk)) {
		const instruction = chunk;
		switch (instruction.type) {
			case 'directive': {
				const { hydration } = instruction;
				let needsHydrationScript = hydration && determineIfNeedsHydrationScript(result);
				let needsDirectiveScript =
					hydration && determinesIfNeedsDirectiveScript(result, hydration.directive);

				let prescriptType: PrescriptType = needsHydrationScript
					? 'both'
					: needsDirectiveScript
						? 'directive'
						: null;
				if (prescriptType) {
					let prescripts = getPrescripts(result, prescriptType, hydration.directive);
					return markHTMLString(prescripts);
				} else {
					return '';
				}
			}
			case 'head': {
				if (result._metadata.hasRenderedHead || result.partial) {
					return '';
				}
				return renderAllHeadContent(result);
			}
			case 'maybe-head': {
				if (result._metadata.hasRenderedHead || result._metadata.headInTree || result.partial) {
					return '';
				}
				return renderAllHeadContent(result);
			}
			case 'renderer-hydration-script': {
				const { rendererSpecificHydrationScripts } = result._metadata;
				const { rendererName } = instruction;

				if (!rendererSpecificHydrationScripts.has(rendererName)) {
					rendererSpecificHydrationScripts.add(rendererName);
					return instruction.render();
				}
				return '';
			}
			default: {
				throw new Error(`Unknown chunk type: ${(chunk as any).type}`);
			}
		}
	} else if (chunk instanceof Response) {
		return '';
	} else if (isSlotString(chunk as string)) {
		let out = '';
		const c = chunk as SlotString;
		if (c.instructions) {
			for (const instr of c.instructions) {
				out += stringifyChunk(result, instr);
			}
		}
		out += chunk.toString();
		return out;
	}

	return chunk.toString();
}

export function chunkToString(result: SSRResult, chunk: Exclude<RenderDestinationChunk, Response>) {
	if (ArrayBuffer.isView(chunk)) {
		return decoder.decode(chunk);
	} else {
		return stringifyChunk(result, chunk);
	}
}

export function chunkToByteArray(
	result: SSRResult,
	chunk: Exclude<RenderDestinationChunk, Response>,
): Uint8Array {
	if (ArrayBuffer.isView(chunk)) {
		return chunk as Uint8Array;
	} else {
		// `stringifyChunk` might return a HTMLString, call `.toString()` to really ensure it's a string
		const stringified = stringifyChunk(result, chunk);
		return encoder.encode(stringified.toString());
	}
}

export function isRenderInstance(obj: unknown): obj is RenderInstance {
	return !!obj && typeof obj === 'object' && 'render' in obj && typeof obj.render === 'function';
}
