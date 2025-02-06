import { AstroError, AstroErrorData } from '../../core/errors/index.js';
import type { PropagationHint } from '../../types/public/internal.js';
import type { AstroComponentFactory } from './render/index.js';

function validateArgs(args: unknown[]): args is Parameters<AstroComponentFactory> {
	if (args.length !== 3) return false;
	if (!args[0] || typeof args[0] !== 'object') return false;
	return true;
}
function baseCreateComponent(
	cb: AstroComponentFactory,
	moduleId?: string,
	propagation?: PropagationHint,
): AstroComponentFactory {
	const name = moduleId?.split('/').pop()?.replace('.astro', '') ?? '';
	const fn = (...args: Parameters<AstroComponentFactory>) => {
		if (!validateArgs(args)) {
			throw new AstroError({
				...AstroErrorData.InvalidComponentArgs,
				message: AstroErrorData.InvalidComponentArgs.message(name),
			});
		}
		return cb(...args);
	};
	Object.defineProperty(fn, 'name', { value: name, writable: false });
	// Add a flag to this callback to mark it as an Astro component
	fn.isAstroComponentFactory = true;
	fn.moduleId = moduleId;
	fn.propagation = propagation;
	return fn;
}

interface CreateComponentOptions {
	factory: AstroComponentFactory;
	moduleId?: string;
	propagation?: PropagationHint;
}

function createComponentWithOptions(opts: CreateComponentOptions) {
	const cb = baseCreateComponent(opts.factory, opts.moduleId, opts.propagation);
	return cb;
}
// Used in creating the component. aka the main export.
export function createComponent(
	arg1: AstroComponentFactory | CreateComponentOptions,
	moduleId?: string,
	propagation?: PropagationHint,
) {
	if (typeof arg1 === 'function') {
		return baseCreateComponent(arg1, moduleId, propagation);
	} else {
		return createComponentWithOptions(arg1);
	}
}
