/// <reference path="./client.d.ts" />

// Caution! The types here are only available inside Astro files (injected automatically by our language server)
// As such, if the typings you're trying to add should be available inside ex: React components, they should instead
// be inside `client.d.ts`

type Astro = import('./dist/types/public/context.js').AstroGlobal;

// We have to duplicate the description here because editors won't show the JSDoc comment from the imported type
// However, they will for its properties, ex: Astro.request will show the AstroGlobal.request description
/**
 * Astro global available in all contexts in .astro files
 *
 * [Astro documentation](https://docs.astro.build/en/reference/api-reference/#astro-global)
 */
declare const Astro: Readonly<Astro>;

declare const Fragment: any;

declare module '*.html' {
	const Component: (opts?: { slots?: Record<string, string> }) => string;
	export default Component;
}
