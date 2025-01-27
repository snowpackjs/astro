declare module 'astro:actions' {
	export * from 'astro/actions/runtime/virtual/server.js';

	export function getActionPath(
		action: import('astro/actions/runtime/virtual/server.js').ActionClient<any, any, any>,
	): string;
}
