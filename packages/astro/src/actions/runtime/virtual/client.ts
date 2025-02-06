export * from './shared.js';

export function defineAction() {
	throw new Error('[astro:action] `defineAction()` unexpectedly used on the client.');
}

export function getActionContext() {
	throw new Error('[astro:action] `getActionContext()` unexpectedly used on the client.');
}
