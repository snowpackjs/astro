import { type ComponentSlots, renderSlotToString } from '../../runtime/server/index.js';
import { renderJSX } from '../../runtime/server/jsx.js';
import { chunkToString } from '../../runtime/server/render/index.js';
import { isRenderInstruction } from '../../runtime/server/render/instruction.js';
import type { SSRResult } from '../../types/public/internal.js';
import { AstroError, AstroErrorData } from '../errors/index.js';
import type { Logger } from '../logger/core.js';

function getFunctionExpression(slot: any) {
	if (!slot) return;
	const expressions = slot?.expressions?.filter((e: unknown) => isRenderInstruction(e) === false);
	if (expressions?.length !== 1) return;
	return expressions[0] as (...args: any[]) => any;
}

export class Slots {
	#result: SSRResult;
	#slots: ComponentSlots | null;
	#logger: Logger;

	constructor(result: SSRResult, slots: ComponentSlots | null, logger: Logger) {
		this.#result = result;
		this.#slots = slots;
		this.#logger = logger;

		if (slots) {
			for (const key of Object.keys(slots)) {
				if ((this as any)[key] !== undefined) {
					throw new AstroError({
						...AstroErrorData.ReservedSlotName,
						message: AstroErrorData.ReservedSlotName.message(key),
					});
				}
				Object.defineProperty(this, key, {
					get() {
						return true;
					},
					enumerable: true,
				});
			}
		}
	}

	public has(name: string) {
		if (!this.#slots) return false;
		return Boolean(this.#slots[name]);
	}

	public async render(name: string, args: any[] = []) {
		if (!this.#slots || !this.has(name)) return;

		const result = this.#result;
		if (!Array.isArray(args)) {
			this.#logger.warn(
				null,
				`Expected second parameter to be an array, received a ${typeof args}. If you're trying to pass an array as a single argument and getting unexpected results, make sure you're passing your array as a item of an array. Ex: Astro.slots.render('default', [["Hello", "World"]])`,
			);
		} else if (args.length > 0) {
			const slotValue = this.#slots[name];
			const component = typeof slotValue === 'function' ? await slotValue(result) : await slotValue;

			// Astro
			const expression = getFunctionExpression(component);
			if (expression) {
				const slot = async () =>
					typeof expression === 'function' ? expression(...args) : expression;
				return await renderSlotToString(result, slot).then((res) => {
					return res;
				});
			}
			// JSX
			if (typeof component === 'function') {
				return await renderJSX(result, (component as any)(...args)).then((res) =>
					res != null ? String(res) : res,
				);
			}
		}

		const content = await renderSlotToString(result, this.#slots[name]);
		const outHTML = chunkToString(result, content);

		return outHTML;
	}
}
