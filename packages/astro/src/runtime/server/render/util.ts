import type { RenderDestination, RenderDestinationChunk, RenderFunction } from './common.js';

import { clsx } from 'clsx';
import type { SSRElement } from '../../../types/public/internal.js';
import { HTMLString, markHTMLString } from '../escape.js';

export const voidElementNames =
	/^(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i;
const htmlBooleanAttributes =
	/^(?:allowfullscreen|async|autofocus|autoplay|checked|controls|default|defer|disabled|disablepictureinpicture|disableremoteplayback|formnovalidate|hidden|inert|loop|nomodule|novalidate|open|playsinline|readonly|required|reversed|scoped|seamless|selected|itemscope)$/i;

const AMPERSAND_REGEX = /&/g;
const DOUBLE_QUOTE_REGEX = /"/g;

const STATIC_DIRECTIVES = new Set(['set:html', 'set:text']);

// converts (most) arbitrary strings to valid JS identifiers
const toIdent = (k: string) =>
	k.trim().replace(/(?!^)\b\w|\s+|\W+/g, (match, index) => {
		if (/\W/.test(match)) return '';
		return index === 0 ? match : match.toUpperCase();
	});

export const toAttributeString = (value: any, shouldEscape = true) =>
	shouldEscape
		? String(value).replace(AMPERSAND_REGEX, '&#38;').replace(DOUBLE_QUOTE_REGEX, '&#34;')
		: value;

const kebab = (k: string) =>
	k.toLowerCase() === k ? k : k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

export const toStyleString = (obj: Record<string, any>) =>
	Object.entries(obj)
		.filter(([_, v]) => (typeof v === 'string' && v.trim()) || typeof v === 'number')
		.map(([k, v]) => {
			if (k[0] !== '-' && k[1] !== '-') return `${kebab(k)}:${v}`;
			return `${k}:${v}`;
		})
		.join(';');

// Adds variables to an inline script.
export function defineScriptVars(vars: Record<any, any>) {
	let output = '';
	for (const [key, value] of Object.entries(vars)) {
		// Use const instead of let as let global unsupported with Safari
		// https://stackoverflow.com/questions/29194024/cant-use-let-keyword-in-safari-javascript
		output += `const ${toIdent(key)} = ${JSON.stringify(value)?.replace(
			/<\/script>/g,
			'\\x3C/script>',
		)};\n`;
	}
	return markHTMLString(output);
}

export function formatList(values: string[]): string {
	if (values.length === 1) {
		return values[0];
	}
	return `${values.slice(0, -1).join(', ')} or ${values[values.length - 1]}`;
}

// A helper used to turn expressions into attribute key/value
export function addAttribute(value: any, key: string, shouldEscape = true) {
	if (value == null) {
		return '';
	}

	// compiler directives cannot be applied dynamically, log a warning and ignore.
	if (STATIC_DIRECTIVES.has(key)) {
		console.warn(`[astro] The "${key}" directive cannot be applied dynamically at runtime. It will not be rendered as an attribute.

Make sure to use the static attribute syntax (\`${key}={value}\`) instead of the dynamic spread syntax (\`{...{ "${key}": value }}\`).`);
		return '';
	}

	// support "class" from an expression passed into an element (#782)
	if (key === 'class:list') {
		const listValue = toAttributeString(clsx(value), shouldEscape);
		if (listValue === '') {
			return '';
		}
		return markHTMLString(` ${key.slice(0, -5)}="${listValue}"`);
	}

	// support object styles for better JSX compat
	if (key === 'style' && !(value instanceof HTMLString)) {
		if (Array.isArray(value) && value.length === 2) {
			return markHTMLString(
				` ${key}="${toAttributeString(`${toStyleString(value[0])};${value[1]}`, shouldEscape)}"`,
			);
		}
		if (typeof value === 'object') {
			return markHTMLString(` ${key}="${toAttributeString(toStyleString(value), shouldEscape)}"`);
		}
	}

	// support `className` for better JSX compat
	if (key === 'className') {
		return markHTMLString(` class="${toAttributeString(value, shouldEscape)}"`);
	}

	// Prevents URLs in attributes from being escaped in static builds
	if (typeof value === 'string' && value.includes('&') && isHttpUrl(value)) {
		return markHTMLString(` ${key}="${toAttributeString(value, false)}"`);
	}

	// Boolean values only need the key
	if (htmlBooleanAttributes.test(key)) {
		return markHTMLString(value ? ` ${key}` : '');
	}

	// Other attributes with an empty string value can omit rendering the value
	if (value === '') {
		return markHTMLString(` ${key}`);
	}

	return markHTMLString(` ${key}="${toAttributeString(value, shouldEscape)}"`);
}

// Adds support for `<Component {...value} />
export function internalSpreadAttributes(values: Record<any, any>, shouldEscape = true) {
	let output = '';
	for (const [key, value] of Object.entries(values)) {
		output += addAttribute(value, key, shouldEscape);
	}
	return markHTMLString(output);
}

export function renderElement(
	name: string,
	{ props: _props, children = '' }: SSRElement,
	shouldEscape = true,
) {
	// Do not print `hoist`, `lang`, `is:global`
	const { lang: _, 'data-astro-id': astroId, 'define:vars': defineVars, ...props } = _props;
	if (defineVars) {
		if (name === 'style') {
			delete props['is:global'];
			delete props['is:scoped'];
		}
		if (name === 'script') {
			delete props.hoist;
			children = defineScriptVars(defineVars) + '\n' + children;
		}
	}
	if ((children == null || children == '') && voidElementNames.test(name)) {
		return `<${name}${internalSpreadAttributes(props, shouldEscape)}>`;
	}
	return `<${name}${internalSpreadAttributes(props, shouldEscape)}>${children}</${name}>`;
}

const noop = () => {};

/**
 * Renders into a buffer until `renderToFinalDestination` is called (which
 * flushes the buffer)
 */
class BufferedRenderer implements RenderDestination {
	private chunks: RenderDestinationChunk[] = [];
	private renderPromise: Promise<void> | void;
	private destination?: RenderDestination;

	public constructor(bufferRenderFunction: RenderFunction) {
		this.renderPromise = bufferRenderFunction(this);
		// Catch here in case it throws before `renderToFinalDestination` is called,
		// to prevent an unhandled rejection.
		Promise.resolve(this.renderPromise).catch(noop);
	}

	public write(chunk: RenderDestinationChunk): void {
		if (this.destination) {
			this.destination.write(chunk);
		} else {
			this.chunks.push(chunk);
		}
	}

	public async renderToFinalDestination(destination: RenderDestination) {
		// Write the buffered chunks to the real destination
		for (const chunk of this.chunks) {
			destination.write(chunk);
		}

		// NOTE: We don't empty `this.chunks` after it's written as benchmarks show
		// that it causes poorer performance, likely due to forced memory re-allocation,
		// instead of letting the garbage collector handle it automatically.
		// (Unsure how this affects on limited memory machines)

		// Re-assign the real destination so `instance.render` will continue and write to the new destination
		this.destination = destination;

		// Wait for render to finish entirely
		await this.renderPromise;
	}
}

/**
 * Executes the `bufferRenderFunction` to prerender it into a buffer destination, and return a promise
 * with an object containing the `renderToFinalDestination` function to flush the buffer to the final
 * destination.
 *
 * @example
 * ```ts
 * // Render components in parallel ahead of time
 * const finalRenders = [ComponentA, ComponentB].map((comp) => {
 *   return renderToBufferDestination(async (bufferDestination) => {
 *     await renderComponentToDestination(bufferDestination);
 *   });
 * });
 * // Render array of components serially
 * for (const finalRender of finalRenders) {
 *   await finalRender.renderToFinalDestination(finalDestination);
 * }
 * ```
 */
export function renderToBufferDestination(bufferRenderFunction: RenderFunction): {
	renderToFinalDestination: RenderFunction;
} {
	const renderer = new BufferedRenderer(bufferRenderFunction);
	return renderer;
}

export const isNode =
	typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]';
// @ts-expect-error: Deno is not part of the types.
export const isDeno = typeof Deno !== 'undefined';

// We can get rid of this when Promise.withResolvers() is ready
export type PromiseWithResolvers<T> = {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason?: any) => void;
};

// This is an implementation of Promise.withResolvers(), which we can't yet rely on.
// We can remove this once the native function is available in Node.js
export function promiseWithResolvers<T = any>(): PromiseWithResolvers<T> {
	let resolve: any, reject: any;
	const promise = new Promise<T>((_resolve, _reject) => {
		resolve = _resolve;
		reject = _reject;
	});
	return {
		promise,
		resolve,
		reject,
	};
}

const VALID_PROTOCOLS = ['http:', 'https:'];
function isHttpUrl(url: string) {
	try {
		const parsedUrl = new URL(url);
		return VALID_PROTOCOLS.includes(parsedUrl.protocol);
	} catch {
		return false;
	}
}
