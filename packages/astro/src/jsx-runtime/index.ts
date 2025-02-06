import { Fragment, Renderer, markHTMLString } from '../runtime/server/index.js';

const AstroJSX = 'astro:jsx';
const Empty = Symbol('empty');

export interface AstroVNode {
	[Renderer]: string;
	[AstroJSX]: boolean;
	type: string | ((...args: any) => any);
	props: Record<string | symbol, any>;
}

const toSlotName = (slotAttr: string) => slotAttr;

export function isVNode(vnode: any): vnode is AstroVNode {
	return vnode && typeof vnode === 'object' && vnode[AstroJSX];
}

export function transformSlots(vnode: AstroVNode) {
	if (typeof vnode.type === 'string') return vnode;
	// Handle single child with slot attribute
	const slots: Record<string, any> = {};
	if (isVNode(vnode.props.children)) {
		const child = vnode.props.children;
		if (!isVNode(child)) return;
		if (!('slot' in child.props)) return;
		const name = toSlotName(child.props.slot);
		slots[name] = [child];
		slots[name]['$$slot'] = true;
		delete child.props.slot;
		delete vnode.props.children;
	} else if (Array.isArray(vnode.props.children)) {
		// Handle many children with slot attributes
		vnode.props.children = vnode.props.children
			.map((child) => {
				if (!isVNode(child)) return child;
				if (!('slot' in child.props)) return child;
				const name = toSlotName(child.props.slot);
				if (Array.isArray(slots[name])) {
					slots[name].push(child);
				} else {
					slots[name] = [child];
					slots[name]['$$slot'] = true;
				}
				delete child.props.slot;
				return Empty;
			})
			.filter((v) => v !== Empty);
	}
	Object.assign(vnode.props, slots);
}

function markRawChildren(child: any): any {
	if (typeof child === 'string') return markHTMLString(child);
	if (Array.isArray(child)) return child.map((c) => markRawChildren(c));
	return child;
}

function transformSetDirectives(vnode: AstroVNode) {
	if (!('set:html' in vnode.props || 'set:text' in vnode.props)) return;
	if ('set:html' in vnode.props) {
		const children = markRawChildren(vnode.props['set:html']);
		delete vnode.props['set:html'];
		Object.assign(vnode.props, { children });
		return;
	}
	if ('set:text' in vnode.props) {
		const children = vnode.props['set:text'];
		delete vnode.props['set:text'];
		Object.assign(vnode.props, { children });
		return;
	}
}

function createVNode(type: any, props: Record<string, any>) {
	const vnode: AstroVNode = {
		[Renderer]: 'astro:jsx',
		[AstroJSX]: true,
		type,
		props: props ?? {},
	};
	transformSetDirectives(vnode);
	transformSlots(vnode);
	return vnode;
}

export { AstroJSX, Fragment, createVNode as jsx, createVNode as jsxDEV, createVNode as jsxs };
