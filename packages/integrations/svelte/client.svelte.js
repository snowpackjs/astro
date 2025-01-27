import { createRawSnippet, hydrate, mount, unmount } from 'svelte';

/** @type {WrakMap<any, ReturnType<typeof createComponent>} */
const existingApplications = new WeakMap();

export default (element) => {
	return async (Component, props, slotted, { client }) => {
		if (!element.hasAttribute('ssr')) return;

		let children = undefined;
		let _$$slots = undefined;
		let renderFns = {};

		for (const [key, value] of Object.entries(slotted)) {
			// Legacy slot support
			_$$slots ??= {};
			if (key === 'default') {
				_$$slots.default = true;
				children = createRawSnippet(() => ({
					render: () => `<astro-slot>${value}</astro-slot>`,
				}));
			} else {
				_$$slots[key] = createRawSnippet(() => ({
					render: () => `<astro-slot name="${key}">${value}</astro-slot>`,
				}));
			}
			// @render support for Svelte ^5.0
			if (key === 'default') {
				renderFns.children = createRawSnippet(() => ({
					render: () => `<astro-slot>${value}</astro-slot>`,
				}));
			} else {
				renderFns[key] = createRawSnippet(() => ({
					render: () => `<astro-slot name="${key}">${value}</astro-slot>`,
				}));
			}
		}

		const resolvedProps = {
			...props,
			children,
			$$slots: _$$slots,
			...renderFns,
		};
		if (existingApplications.has(element)) {
			existingApplications.get(element).setProps(resolvedProps);
		} else {
			const component = createComponent(Component, element, resolvedProps, client !== 'only');
			existingApplications.set(element, component);
			element.addEventListener('astro:unmount', () => component.destroy(), { once: true });
		}
	};
};

/**
 * @param {any} Component
 * @param {HTMLElement} target
 * @param {Record<string, any>} props
 * @param {boolean} shouldHydrate
 */
function createComponent(Component, target, props, shouldHydrate) {
	let propsState = $state(props);
	const bootstrap = shouldHydrate ? hydrate : mount;
	const component = bootstrap(Component, { target, props: propsState });
	return {
		setProps(newProps) {
			Object.assign(propsState, newProps);
			// Remove props in `propsState` but not in `newProps`
			for (const key in propsState) {
				if (!(key in newProps)) {
					delete propsState[key];
				}
			}
		},
		destroy() {
			unmount(component);
		},
	};
}
