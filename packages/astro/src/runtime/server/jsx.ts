import { AstroJSX, type AstroVNode, isVNode } from '../../jsx-runtime/index.js';
import type { SSRResult } from '../../types/public/internal.js';
import {
	HTMLString,
	escapeHTML,
	markHTMLString,
	renderToString,
	spreadAttributes,
	voidElementNames,
} from './index.js';
import { renderComponentToString } from './render/component.js';

const ClientOnlyPlaceholder = 'astro-client-only';

// If the `vnode.type` is a function, we could render it as JSX or as framework components.
// Inside `renderJSXNode`, we first try to render as framework components, and if `renderJSXNode`
// is called again while rendering the component, it's likely that the `astro:jsx` is invoking
// `renderJSXNode` again (loop). In this case, we try to render as JSX instead.
//
// This Symbol is assigned to `vnode.props` to track if it had tried to render as framework components.
// It mutates `vnode.props` to be able to scope to the current render call.
const hasTriedRenderComponentSymbol = Symbol('hasTriedRenderComponent');

export async function renderJSX(result: SSRResult, vnode: any): Promise<any> {
	// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
	switch (true) {
		case vnode instanceof HTMLString:
			if (vnode.toString().trim() === '') {
				return '';
			}
			return vnode;
		case typeof vnode === 'string':
			return markHTMLString(escapeHTML(vnode));
		case typeof vnode === 'function':
			return vnode;
		case !vnode && vnode !== 0:
			return '';
		case Array.isArray(vnode):
			return markHTMLString(
				(await Promise.all(vnode.map((v: any) => renderJSX(result, v)))).join(''),
			);
	}

	return renderJSXVNode(result, vnode);
}

async function renderJSXVNode(result: SSRResult, vnode: AstroVNode): Promise<any> {
	if (isVNode(vnode)) {
		// eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
		switch (true) {
			case !vnode.type: {
				throw new Error(`Unable to render ${result.pathname} because it contains an undefined Component!
Did you forget to import the component or is it possible there is a typo?`);
			}
			case (vnode.type as any) === Symbol.for('astro:fragment'):
				return renderJSX(result, vnode.props.children);
			case (vnode.type as any).isAstroComponentFactory: {
				let props: Record<string, any> = {};
				let slots: Record<string, any> = {};
				for (const [key, value] of Object.entries(vnode.props ?? {})) {
					if (key === 'children' || (value && typeof value === 'object' && value['$$slot'])) {
						slots[key === 'children' ? 'default' : key] = () => renderJSX(result, value);
					} else {
						props[key] = value;
					}
				}
				const str = await renderToString(result, vnode.type as any, props, slots);
				if (str instanceof Response) {
					throw str;
				}
				const html = markHTMLString(str);
				return html;
			}
			case !vnode.type && (vnode.type as any) !== 0:
				return '';
			case typeof vnode.type === 'string' && vnode.type !== ClientOnlyPlaceholder:
				return markHTMLString(await renderElement(result, vnode.type as string, vnode.props ?? {}));
		}

		if (vnode.type) {
			if (typeof vnode.type === 'function' && vnode.props['server:root']) {
				const output = await vnode.type(vnode.props ?? {});
				return await renderJSX(result, output);
			}
			if (typeof vnode.type === 'function') {
				if (vnode.props[hasTriedRenderComponentSymbol]) {
					// omitting compiler-internals from user components
					delete vnode.props[hasTriedRenderComponentSymbol];
					const output = await vnode.type(vnode.props ?? {});
					if (output?.[AstroJSX] || !output) {
						return await renderJSXVNode(result, output);
					} else {
						return;
					}
				} else {
					vnode.props[hasTriedRenderComponentSymbol] = true;
				}
			}

			const { children = null, ...props } = vnode.props ?? {};
			const _slots: Record<string, any> = {
				default: [],
			};
			function extractSlots(child: any): any {
				if (Array.isArray(child)) {
					return child.map((c) => extractSlots(c));
				}
				if (!isVNode(child)) {
					_slots.default.push(child);
					return;
				}
				if ('slot' in child.props) {
					_slots[child.props.slot] = [...(_slots[child.props.slot] ?? []), child];
					delete child.props.slot;
					return;
				}
				_slots.default.push(child);
			}
			extractSlots(children);
			for (const [key, value] of Object.entries(props)) {
				if (value?.['$$slot']) {
					_slots[key] = value;
					delete props[key];
				}
			}
			const slotPromises = [];
			const slots: Record<string, any> = {};
			for (const [key, value] of Object.entries(_slots)) {
				slotPromises.push(
					renderJSX(result, value).then((output) => {
						if (output.toString().trim().length === 0) return;
						slots[key] = () => output;
					}),
				);
			}
			await Promise.all(slotPromises);

			let output: string;
			if (vnode.type === ClientOnlyPlaceholder && vnode.props['client:only']) {
				output = await renderComponentToString(
					result,
					vnode.props['client:display-name'] ?? '',
					null,
					props,
					slots,
				);
			} else {
				output = await renderComponentToString(
					result,
					typeof vnode.type === 'function' ? vnode.type.name : vnode.type,
					vnode.type,
					props,
					slots,
				);
			}
			return markHTMLString(output);
		}
	}
	// numbers, plain objects, etc
	return markHTMLString(`${vnode}`);
}

async function renderElement(
	result: any,
	tag: string,
	{ children, ...props }: Record<string, any>,
) {
	return markHTMLString(
		`<${tag}${spreadAttributes(props)}${markHTMLString(
			(children == null || children == '') && voidElementNames.test(tag)
				? `/>`
				: `>${
						children == null ? '' : await renderJSX(result, prerenderElementChildren(tag, children))
					}</${tag}>`,
		)}`,
	);
}

/**
 * Pre-render the children with the given `tag` information
 */
function prerenderElementChildren(tag: string, children: any) {
	// For content within <style> and <script> tags that are plain strings, e.g. injected
	// by remark/rehype plugins, or if a user explicitly does `<script>{'...'}</script>`,
	// we mark it as an HTML string to prevent the content from being HTML-escaped.
	if (typeof children === 'string' && (tag === 'style' || tag === 'script')) {
		return markHTMLString(children);
	} else {
		return children;
	}
}
