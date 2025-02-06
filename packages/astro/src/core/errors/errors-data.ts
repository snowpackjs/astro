// BEFORE ADDING AN ERROR: Please look at the README.md in this folder for general guidelines on writing error messages
// Additionally, this code, much like `types/public/config.ts`, is used to generate documentation, so make sure to pass
// your changes by our wonderful docs team before merging!

import type { ZodError } from 'zod';

export interface ErrorData {
	name: string;
	title: string;
	message?: string | ((...params: any) => string);
	hint?: string | ((...params: any) => string);
}

/**
 * @docs
 * @kind heading
 * @name Astro Errors
 */
// Astro Errors, most errors will go here!

/**
 * @docs
 * @description
 * Cannot use the module `astro:config` without enabling the experimental feature.
 */
export const CantUseAstroConfigModuleError = {
	name: 'CantUseAstroConfigModuleError',
	title: 'Cannot use the `astro:config` module without enabling the experimental feature.',
	message: (moduleName) =>
		`Cannot import the module "${moduleName}" because the experimental feature is disabled. Enable \`experimental.serializeManifest\` in your \`astro.config.mjs\` `,
} satisfies ErrorData;

/**
 * @docs
 * @message
 * Unknown compiler error.
 * @see
 * - [withastro/compiler issues list](https://astro.build/issues/compiler)
 * @description
 * Astro encountered an unknown error while compiling your files. In most cases, this is not your fault, but an issue in our compiler.
 *
 * If there isn't one already, please [create an issue](https://astro.build/issues/compiler).
 */
export const UnknownCompilerError = {
	name: 'UnknownCompilerError',
	title: 'Unknown compiler error.',
	hint: 'This is almost always a problem with the Astro compiler, not your code. Please open an issue at https://astro.build/issues/compiler.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Official integrations](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)
 * - [Astro.clientAddress](https://docs.astro.build/en/reference/api-reference/#clientaddress)
 * @description
 * The adapter you're using unfortunately does not support `Astro.clientAddress`.
 */
export const ClientAddressNotAvailable = {
	name: 'ClientAddressNotAvailable',
	title: '`Astro.clientAddress` is not available in current adapter.',
	message: (adapterName: string) =>
		`\`Astro.clientAddress\` is not available in the \`${adapterName}\` adapter. File an issue with the adapter to add support.`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
 * - [Astro.clientAddress](https://docs.astro.build/en/reference/api-reference/#clientaddress)
 * @description
 * The `Astro.clientAddress` property cannot be used inside prerendered routes.
 */
export const PrerenderClientAddressNotAvailable = {
	name: 'PrerenderClientAddressNotAvailable',
	title: '`Astro.clientAddress` cannot be used inside prerendered routes.',
	message: `\`Astro.clientAddress\` cannot be used inside prerendered routes`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Enabling SSR in Your Project](https://docs.astro.build/en/guides/on-demand-rendering/)
 * - [Astro.clientAddress](https://docs.astro.build/en/reference/api-reference/#clientaddress)
 * @description
 * The `Astro.clientAddress` property is only available when [Server-side rendering](https://docs.astro.build/en/guides/on-demand-rendering/) is enabled.
 *
 * To get the user's IP address in static mode, different APIs such as [Ipify](https://www.ipify.org/) can be used in a [Client-side script](https://docs.astro.build/en/guides/client-side-scripts/) or it may be possible to get the user's IP using a serverless function hosted on your hosting provider.
 */
export const StaticClientAddressNotAvailable = {
	name: 'StaticClientAddressNotAvailable',
	title: '`Astro.clientAddress` is not available in prerendered pages.',
	message: '`Astro.clientAddress` is only available on pages that are server-rendered.',
	hint: 'See https://docs.astro.build/en/guides/on-demand-rendering/ for more information on how to enable SSR.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [getStaticPaths()](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * @description
 * A [dynamic route](https://docs.astro.build/en/guides/routing/#dynamic-routes) was matched, but no corresponding path was found for the requested parameters. This is often caused by a typo in either the generated or the requested path.
 */
export const NoMatchingStaticPathFound = {
	name: 'NoMatchingStaticPathFound',
	title: 'No static path found for requested path.',
	message: (pathName: string) =>
		`A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`${pathName}\`.`,
	hint: (possibleRoutes: string[]) =>
		`Possible dynamic routes being matched: ${possibleRoutes.join(', ')}.`,
} satisfies ErrorData;
/**
 * @docs
 * @message Route returned a `RETURNED_VALUE`. Only a Response can be returned from Astro files.
 * @see
 * - [Response](https://docs.astro.build/en/guides/on-demand-rendering/#response)
 * @description
 * Only instances of [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned inside Astro files.
 * ```astro title="pages/login.astro"
 * ---
 * return new Response(null, {
 *  status: 404,
 *  statusText: 'Not found'
 * });
 *
 * // Alternatively, for redirects, Astro.redirect also returns an instance of Response
 * return Astro.redirect('/login');
 * ---
 * ```
 *
 */
export const OnlyResponseCanBeReturned = {
	name: 'OnlyResponseCanBeReturned',
	title: 'Invalid type returned by Astro page.',
	message: (route: string | undefined, returnedValue: string) =>
		`Route \`${
			route ? route : ''
		}\` returned a \`${returnedValue}\`. Only a [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) can be returned from Astro files.`,
	hint: 'See https://docs.astro.build/en/guides/on-demand-rendering/#response for more information.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [`client:media`](https://docs.astro.build/en/reference/directives-reference/#clientmedia)
 * @description
 * A [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries) parameter is required when using the `client:media` directive.
 *
 * ```astro
 * <Counter client:media="(max-width: 640px)" />
 * ```
 */
export const MissingMediaQueryDirective = {
	name: 'MissingMediaQueryDirective',
	title: 'Missing value for `client:media` directive.',
	message:
		'Media query not provided for `client:media` directive. A media query similar to `client:media="(max-width: 600px)"` must be provided',
} satisfies ErrorData;
/**
 * @docs
 * @message Unable to render `COMPONENT_NAME`. There are `RENDERER_COUNT` renderer(s) configured in your `astro.config.mjs` file, but none were able to server-side render `COMPONENT_NAME`.
 * @see
 * - [Frameworks components](https://docs.astro.build/en/guides/framework-components/)
 * - [UI Frameworks](https://docs.astro.build/en/guides/integrations-guide/#official-integrations)
 * @description
 * None of the installed integrations were able to render the component you imported. Make sure to install the appropriate integration for the type of component you are trying to include in your page.
 *
 * For JSX / TSX files, [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/), [@astrojs/preact](https://docs.astro.build/en/guides/integrations-guide/preact/) or [@astrojs/solid-js](https://docs.astro.build/en/guides/integrations-guide/solid-js/) can be used. For Vue and Svelte files, the [@astrojs/vue](https://docs.astro.build/en/guides/integrations-guide/vue/) and [@astrojs/svelte](https://docs.astro.build/en/guides/integrations-guide/svelte/) integrations can be used respectively
 */
export const NoMatchingRenderer = {
	name: 'NoMatchingRenderer',
	title: 'No matching renderer found.',
	message: (
		componentName: string,
		componentExtension: string | undefined,
		plural: boolean,
		validRenderersCount: number,
	) =>
		`Unable to render \`${componentName}\`.

${
	validRenderersCount > 0
		? `There ${plural ? 'are' : 'is'} ${validRenderersCount} renderer${plural ? 's' : ''} configured in your \`astro.config.mjs\` file,
but ${plural ? 'none were' : 'it was not'} able to server-side render \`${componentName}\`.`
		: `No valid renderer was found ${
				componentExtension
					? `for the \`.${componentExtension}\` file extension.`
					: `for this file extension.`
			}`
}`,
	hint: (probableRenderers: string) =>
		`Did you mean to enable the ${probableRenderers} integration?\n\nSee https://docs.astro.build/en/guides/framework-components/ for more information on how to install and configure integrations.`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [addRenderer option](https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option)
 * - [Hydrating framework components](https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components)
 * @description
 * Astro tried to hydrate a component on the client, but the renderer used does not provide a client entrypoint to use to hydrate.
 *
 */
export const NoClientEntrypoint = {
	name: 'NoClientEntrypoint',
	title: 'No client entrypoint specified in renderer.',
	message: (componentName: string, clientDirective: string, rendererName: string) =>
		`\`${componentName}\` component has a \`client:${clientDirective}\` directive, but no client entrypoint was provided by \`${rendererName}\`.`,
	hint: 'See https://docs.astro.build/en/reference/integrations-reference/#addrenderer-option for more information on how to configure your renderer.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [`client:only`](https://docs.astro.build/en/reference/directives-reference/#clientonly)
 * @description
 *
 * `client:only` components are not run on the server, as such Astro does not know (and cannot guess) which renderer to use and require a hint. Like such:
 *
 * ```astro
 *	<SomeReactComponent client:only="react" />
 * ```
 */
export const NoClientOnlyHint = {
	name: 'NoClientOnlyHint',
	title: 'Missing hint on client:only directive.',
	message: (componentName: string) =>
		`Unable to render \`${componentName}\`. When using the \`client:only\` hydration strategy, Astro needs a hint to use the correct renderer.`,
	hint: (probableRenderers: string) =>
		`Did you mean to pass \`client:only="${probableRenderers}"\`? See https://docs.astro.build/en/reference/directives-reference/#clientonly for more information on client:only`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
 * @description
 * The `params` property in `getStaticPaths`'s return value (an array of objects) should also be an object.
 *
 * ```astro title="pages/blog/[id].astro"
 * ---
 * export async function getStaticPaths() {
 *	return [
 *		{ params: { slug: "blog" } },
 * 		{ params: { slug: "about" } }
 * 	];
 *}
 *---
 * ```
 */
export const InvalidGetStaticPathParam = {
	name: 'InvalidGetStaticPathParam',
	title: 'Invalid value returned by a `getStaticPaths` path.',
	message: (paramType) =>
		`Invalid params given to \`getStaticPaths\` path. Expected an \`object\`, got \`${paramType}\``,
	hint: 'See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * @description
 * `getStaticPaths`'s return value must be an array of objects. In most cases, this error happens because an array of array was returned. Using [`.flatMap()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) or a [`.flat()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) call may be useful.
 *
 * ```ts title="pages/blog/[id].astro"
 * export async function getStaticPaths() {
 *	return [ // <-- Array
 *		{ params: { slug: "blog" } }, // <-- Object
 * 		{ params: { slug: "about" } }
 * 	];
 *}
 * ```
 */
export const InvalidGetStaticPathsEntry = {
	name: 'InvalidGetStaticPathsEntry',
	title: "Invalid entry inside getStaticPath's return value",
	message: (entryType) =>
		`Invalid entry returned by getStaticPaths. Expected an object, got \`${entryType}\``,
	hint: "If you're using a `.map` call, you might be looking for `.flatMap()` instead. See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.",
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
 * @description
 * `getStaticPaths`'s return value must be an array of objects.
 *
 * ```ts title="pages/blog/[id].astro"
 * export async function getStaticPaths() {
 *	return [ // <-- Array
 *		{ params: { slug: "blog" } },
 * 		{ params: { slug: "about" } }
 * 	];
 *}
 * ```
 */
export const InvalidGetStaticPathsReturn = {
	name: 'InvalidGetStaticPathsReturn',
	title: 'Invalid value returned by getStaticPaths.',
	message: (returnType) =>
		`Invalid type returned by \`getStaticPaths\`. Expected an \`array\`, got \`${returnType}\``,
	hint: 'See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
 * @description
 * Every route specified by `getStaticPaths` require a `params` property specifying the path parameters needed to match the route.
 *
 * For instance, the following code:
 * ```astro title="pages/blog/[id].astro"
 * ---
 * export async function getStaticPaths() {
 * 	return [
 * 		{ params: { id: '1' } }
 * 	];
 * }
 * ---
 * ```
 * Will create the following route: `site.com/blog/1`.
 */
export const GetStaticPathsExpectedParams = {
	name: 'GetStaticPathsExpectedParams',
	title: 'Missing params property on `getStaticPaths` route.',
	message: 'Missing or empty required `params` property on `getStaticPaths` route.',
	hint: 'See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
 * @description
 * Since `params` are encoded into the URL, only certain types are supported as values.
 *
 * ```astro title="/route/[id].astro"
 * ---
 * export async function getStaticPaths() {
 * 	return [
 * 		{ params: { id: '1' } } // Works
 * 		{ params: { id: 2 } } // Works
 * 		{ params: { id: false } } // Does not work
 * 	];
 * }
 * ---
 * ```
 *
 * In routes using [rest parameters](https://docs.astro.build/en/guides/routing/#rest-parameters), `undefined` can be used to represent a path with no parameters passed in the URL:
 *
 * ```astro title="/route/[...id].astro"
 * ---
 * export async function getStaticPaths() {
 * 	return [
 * 		{ params: { id: 1 } } // /route/1
 * 		{ params: { id: 2 } } // /route/2
 * 		{ params: { id: undefined } } // /route/
 * 	];
 * }
 * ---
 * ```
 */
export const GetStaticPathsInvalidRouteParam = {
	name: 'GetStaticPathsInvalidRouteParam',
	title: 'Invalid value for `getStaticPaths` route parameter.',
	message: (key: string, value: any, valueType: any) =>
		`Invalid getStaticPaths route parameter for \`${key}\`. Expected undefined, a string or a number, received \`${valueType}\` (\`${value}\`)`,
	hint: 'See https://docs.astro.build/en/reference/routing-reference/#getstaticpaths for more information on getStaticPaths.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Dynamic Routes](https://docs.astro.build/en/guides/routing/#dynamic-routes)
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * - [Server-side Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
 * @description
 * In [Static Mode](https://docs.astro.build/en/guides/routing/#static-ssg-mode), all routes must be determined at build time. As such, dynamic routes must `export` a `getStaticPaths` function returning the different paths to generate.
 */
export const GetStaticPathsRequired = {
	name: 'GetStaticPathsRequired',
	title: '`getStaticPaths()` function required for dynamic routes.',
	message:
		'`getStaticPaths()` function is required for dynamic routes. Make sure that you `export` a `getStaticPaths` function from your dynamic route.',
	hint: `See https://docs.astro.build/en/guides/routing/#dynamic-routes for more information on dynamic routes.

	If you meant for this route to be server-rendered, set \`export const prerender = false;\` in the page.`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Named slots](https://docs.astro.build/en/basics/astro-components/#named-slots)
 * @description
 * Certain words cannot be used for slot names due to being already used internally.
 */
export const ReservedSlotName = {
	name: 'ReservedSlotName',
	title: 'Invalid slot name.',
	message: (slotName: string) =>
		`Unable to create a slot named \`${slotName}\`. \`${slotName}\` is a reserved slot name. Please update the name of this slot.`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Server-side Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
 * @description
 * To use server-side rendering, an adapter needs to be installed so Astro knows how to generate the proper output for your targeted deployment platform.
 */
export const NoAdapterInstalled = {
	name: 'NoAdapterInstalled',
	title: 'Cannot use Server-side Rendering without an adapter.',
	message: `Cannot use server-rendered pages without an adapter. Please install and configure the appropriate server adapter for your final deployment.`,
	hint: 'See https://docs.astro.build/en/guides/on-demand-rendering/ for more information.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Server-side Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
 * @description
 * The currently configured adapter does not support server-side rendering, which is required for the current project setup.
 *
 * Depending on your adapter, there may be a different entrypoint to use for server-side rendering. For example, the `@astrojs/vercel` adapter has a `@astrojs/vercel/static` entrypoint for static rendering, and a `@astrojs/vercel/serverless` entrypoint for server-side rendering.
 *
 */
export const AdapterSupportOutputMismatch = {
	name: 'AdapterSupportOutputMismatch',
	title: 'Adapter does not support server output.',
	message: (adapterName: string) =>
		`The \`${adapterName}\` adapter is configured to output a static website, but the project contains server-rendered pages. Please install and configure the appropriate server adapter for your final deployment.`,
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [On-demand Rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
 * @description
 * To use server islands, the same constraints exist as for sever-side rendering, so an adapter is needed.
 */
export const NoAdapterInstalledServerIslands = {
	name: 'NoAdapterInstalledServerIslands',
	title: 'Cannot use Server Islands without an adapter.',
	message: `Cannot use server islands without an adapter. Please install and configure the appropriate server adapter for your final deployment.`,
	hint: 'See https://docs.astro.build/en/guides/on-demand-rendering/ for more information.',
} satisfies ErrorData;
/**
 * @docs
 * @description
 * No import statement was found for one of the components. If there is an import statement, make sure you are using the same identifier in both the imports and the component usage.
 */
export const NoMatchingImport = {
	name: 'NoMatchingImport',
	title: 'No import found for component.',
	message: (componentName: string) =>
		`Could not render \`${componentName}\`. No matching import has been found for \`${componentName}\`.`,
	hint: 'Please make sure the component is properly imported.',
} satisfies ErrorData;
/**
 * @docs
 * @message
 * **Example error messages:**<br/>
 * InvalidPrerenderExport: A `prerender` export has been detected, but its value cannot be statically analyzed.
 * @description
 * The `prerender` feature only supports a subset of valid JavaScript — be sure to use exactly `export const prerender = true` so that our compiler can detect this directive at build time. Variables, `let`, and `var` declarations are not supported.
 */
export const InvalidPrerenderExport = {
	name: 'InvalidPrerenderExport',
	title: 'Invalid prerender export.',
	message(prefix: string, suffix: string, isHydridOutput: boolean) {
		const defaultExpectedValue = isHydridOutput ? 'false' : 'true';
		let msg = `A \`prerender\` export has been detected, but its value cannot be statically analyzed.`;
		if (prefix !== 'const') msg += `\nExpected \`const\` declaration but got \`${prefix}\`.`;
		if (suffix !== 'true')
			msg += `\nExpected \`${defaultExpectedValue}\` value but got \`${suffix}\`.`;
		return msg;
	},
	hint: 'Mutable values declared at runtime are not supported. Please make sure to use exactly `export const prerender = true`.',
} satisfies ErrorData;
/**
 * @docs
 * @message
 * **Example error messages:**<br/>
 * InvalidComponentArgs: Invalid arguments passed to `<MyAstroComponent>` component.
 * @description
 * Astro components cannot be rendered manually via a function call, such as `Component()` or `{items.map(Component)}`. Prefer the component syntax `<Component />` or `{items.map(item => <Component {...item} />)}`.
 */
export const InvalidComponentArgs = {
	name: 'InvalidComponentArgs',
	title: 'Invalid component arguments.',
	message: (name: string) => `Invalid arguments passed to${name ? ` <${name}>` : ''} component.`,
	hint: 'Astro components cannot be rendered directly via function call, such as `Component()` or `{items.map(Component)}`.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Pagination](https://docs.astro.build/en/guides/routing/#pagination)
 * @description
 * The page number parameter was not found in your filepath.
 */
export const PageNumberParamNotFound = {
	name: 'PageNumberParamNotFound',
	title: 'Page number param not found.',
	message: (paramName: string) =>
		`[paginate()] page number param \`${paramName}\` not found in your filepath.`,
	hint: 'Rename your file to `[page].astro` or `[...page].astro`.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * - [Image component](https://docs.astro.build/en/reference/modules/astro-assets/#image-)
 * - [Image component#alt](https://docs.astro.build/en/reference/modules/astro-assets/#alt-required)
 * @description
 * The `alt` property allows you to provide descriptive alt text to users of screen readers and other assistive technologies. In order to ensure your images are accessible, the `Image` component requires that an `alt` be specified.
 *
 * If the image is merely decorative (i.e. doesn’t contribute to the understanding of the page), set `alt=""` so that screen readers know to ignore the image.
 */
export const ImageMissingAlt = {
	name: 'ImageMissingAlt',
	title: 'Image missing required "alt" property.',
	message:
		'Image missing "alt" property. "alt" text is required to describe important images on the page.',
	hint: 'Use an empty string ("") for decorative images.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Image Service API](https://docs.astro.build/en/reference/image-service-reference/)
 * @description
 * There was an error while loading the configured image service. This can be caused by various factors, such as your image service not properly exporting a compatible object in its default export, or an incorrect path.
 *
 * If you believe that your service is properly configured and this error is wrong, please [open an issue](https://astro.build/issues/).
 */
export const InvalidImageService = {
	name: 'InvalidImageService',
	title: 'Error while loading image service.',
	message:
		'There was an error loading the configured image service. Please see the stack trace for more information.',
} satisfies ErrorData;
/**
 * @docs
 * @message
 * Missing width and height attributes for `IMAGE_URL`. When using remote images, both dimensions are required in order to avoid cumulative layout shift (CLS).
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * - [Image component#width-and-height-required](https://docs.astro.build/en/reference/modules/astro-assets/#width-and-height-required-for-images-in-public)
 * @description
 * For remote images, `width` and `height` cannot automatically be inferred from the original file. To avoid cumulative layout shift (CLS), either specify these two properties, or set [`inferSize`](https://docs.astro.build/en/reference/modules/astro-assets/#infersize) to `true` to fetch a remote image's original dimensions.
 *
 * If your image is inside your `src` folder, you probably meant to import it instead. See [the Imports guide for more information](https://docs.astro.build/en/guides/imports/#other-assets).
 */
export const MissingImageDimension = {
	name: 'MissingImageDimension',
	title: 'Missing image dimensions',
	message: (missingDimension: 'width' | 'height' | 'both', imageURL: string) =>
		`Missing ${
			missingDimension === 'both' ? 'width and height attributes' : `${missingDimension} attribute`
		} for ${imageURL}. When using remote images, both dimensions are required in order to avoid CLS.`,
	hint: 'If your image is inside your `src` folder, you probably meant to import it instead. See [the Imports guide for more information](https://docs.astro.build/en/guides/imports/#other-assets). You can also use `inferSize={true}` for remote images to get the original dimensions.',
} satisfies ErrorData;
/**
 * @docs
 * @message
 * Failed to get the dimensions for `IMAGE_URL`.
 * @description
 * Determining the remote image's dimensions failed. This is typically caused by an incorrect URL or attempting to infer the size of an image in the public folder which is not possible.
 */
export const FailedToFetchRemoteImageDimensions = {
	name: 'FailedToFetchRemoteImageDimensions',
	title: 'Failed to retrieve remote image dimensions',
	message: (imageURL: string) => `Failed to get the dimensions for ${imageURL}.`,
	hint: 'Verify your remote image URL is accurate, and that you are not using `inferSize` with a file located in your `public/` folder.',
} satisfies ErrorData;
/**
 * @docs
 * @description
 * The built-in image services do not currently support optimizing all image formats.
 *
 * For unsupported formats such as GIFs, you may be able to use an `img` tag directly:
 * ```astro
 * ---
 * import rocket from '../assets/images/rocket.gif';
 * ---
 *
 * <img src={rocket.src} width={rocket.width} height={rocket.height} alt="A rocketship in space." />
 * ```
 */
export const UnsupportedImageFormat = {
	name: 'UnsupportedImageFormat',
	title: 'Unsupported image format',
	message: (format: string, imagePath: string, supportedFormats: readonly string[]) =>
		`Received unsupported format \`${format}\` from \`${imagePath}\`. Currently only ${supportedFormats.join(
			', ',
		)} are supported by our image services.`,
	hint: "Using an `img` tag directly instead of the `Image` component might be what you're looking for.",
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * Astro does not currently supporting converting between vector (such as SVGs) and raster (such as PNGs and JPEGs) images.
 */
export const UnsupportedImageConversion = {
	name: 'UnsupportedImageConversion',
	title: 'Unsupported image conversion',
	message:
		'Converting between vector (such as SVGs) and raster (such as PNGs and JPEGs) images is not currently supported.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [`getStaticPaths()`](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
 * - [`params`](https://docs.astro.build/en/reference/api-reference/#params)
 * @description
 * The endpoint is prerendered with an `undefined` param so the generated path will collide with another route.
 *
 * If you cannot prevent passing `undefined`, then an additional extension can be added to the endpoint file name to generate the file with a different name. For example, renaming `pages/api/[slug].ts` to `pages/api/[slug].json.ts`.
 */
export const PrerenderDynamicEndpointPathCollide = {
	name: 'PrerenderDynamicEndpointPathCollide',
	title: 'Prerendered dynamic endpoint has path collision.',
	message: (pathname: string) =>
		`Could not render \`${pathname}\` with an \`undefined\` param as the generated path will collide during prerendering. Prevent passing \`undefined\` as \`params\` for the endpoint's \`getStaticPaths()\` function, or add an additional extension to the endpoint's filename.`,
	hint: (filename: string) =>
		`Rename \`${filename}\` to \`${filename.replace(/\.(?:js|ts)/, (m) => `.json` + m)}\``,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * An image's `src` property is not valid. The Image component requires the `src` attribute to be either an image that has been ESM imported or a string. This is also true for the first parameter of `getImage()`.
 *
 * ```astro
 * ---
 * import { Image } from "astro:assets";
 * import myImage from "../assets/my_image.png";
 * ---
 *
 * <Image src={myImage} alt="..." />
 * <Image src="https://example.com/logo.png" width={300} height={300} alt="..." />
 * ```
 *
 * In most cases, this error happens when the value passed to `src` is undefined.
 */
export const ExpectedImage = {
	name: 'ExpectedImage',
	title: 'Expected src to be an image.',
	message: (src: string, typeofOptions: string, fullOptions: string) =>
		`Expected \`src\` property for \`getImage\` or \`<Image />\` to be either an ESM imported image or a string with the path of a remote image. Received \`${src}\` (type: \`${typeofOptions}\`).\n\nFull serialized options received: \`${fullOptions}\`.`,
	hint: "This error can often happen because of a wrong path. Make sure the path to your image is correct. If you're passing an async function, make sure to call and await it.",
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * `getImage()`'s first parameter should be an object with the different properties to apply to your image.
 *
 * ```ts
 * import { getImage } from "astro:assets";
 * import myImage from "../assets/my_image.png";
 *
 * const optimizedImage = await getImage({src: myImage, width: 300, height: 300});
 * ```
 *
 * In most cases, this error happens because parameters were passed directly instead of inside an object.
 */
export const ExpectedImageOptions = {
	name: 'ExpectedImageOptions',
	title: 'Expected image options.',
	message: (options: string) =>
		`Expected getImage() parameter to be an object. Received \`${options}\`.`,
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * An ESM-imported image cannot be passed directly to `getImage()`. Instead, pass an object with the image in the `src` property.
 *
 * ```diff
 * import { getImage } from "astro:assets";
 * import myImage from "../assets/my_image.png";
 * - const optimizedImage = await getImage( myImage );
 * + const optimizedImage = await getImage({ src: myImage });
 * ```
 */

export const ExpectedNotESMImage = {
	name: 'ExpectedNotESMImage',
	title: 'Expected image options, not an ESM-imported image.',
	message:
		'An ESM-imported image cannot be passed directly to `getImage()`. Instead, pass an object with the image in the `src` property.',
	hint: 'Try changing `getImage(myImage)` to `getImage({ src: myImage })`',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * Only one of `densities` or `widths` can be specified. Those attributes are used to construct a `srcset` attribute, which cannot have both `x` and `w` descriptors.
 */
export const IncompatibleDescriptorOptions = {
	name: 'IncompatibleDescriptorOptions',
	title: 'Cannot set both `densities` and `widths`',
	message:
		"Only one of `densities` or `widths` can be specified. In most cases, you'll probably want to use only `widths` if you require specific widths.",
	hint: 'Those attributes are used to construct a `srcset` attribute, which cannot have both `x` and `w` descriptors.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * Astro could not find an image you imported. Often, this is simply caused by a typo in the path.
 *
 * Images in Markdown are relative to the current file. To refer to an image that is located in the same folder as the `.md` file, the path should start with `./`
 */
export const ImageNotFound = {
	name: 'ImageNotFound',
	title: 'Image not found.',
	message: (imagePath: string) => `Could not find requested image \`${imagePath}\`. Does it exist?`,
	hint: 'This is often caused by a typo in the image path. Please make sure the file exists, and is spelled correctly.',
} satisfies ErrorData;

/**
 * @docs
 * @message Could not process image metadata for `IMAGE_PATH`.
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * Astro could not process the metadata of an image you imported. This is often caused by a corrupted or malformed image and re-exporting the image from your image editor may fix this issue.
 */
export const NoImageMetadata = {
	name: 'NoImageMetadata',
	title: 'Could not process image metadata.',
	message: (imagePath: string | undefined) =>
		`Could not process image metadata${imagePath ? ` for \`${imagePath}\`` : ''}.`,
	hint: 'This is often caused by a corrupted or malformed image. Re-exporting the image from your image editor may fix this issue.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * Astro could not transform one of your images. Often, this is caused by a corrupted or malformed image. Re-exporting the image from your image editor may fix this issue.
 *
 * Depending on the image service you are using, the stack trace may contain more information on the specific error encountered.
 */
export const CouldNotTransformImage = {
	name: 'CouldNotTransformImage',
	title: 'Could not transform image.',
	message: (imagePath: string) =>
		`Could not transform image \`${imagePath}\`. See the stack trace for more information.`,
	hint: 'This is often caused by a corrupted or malformed image. Re-exporting the image from your image editor may fix this issue.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Making changes to the response, such as setting headers, cookies, and the status code cannot be done outside of page components.
 */
export const ResponseSentError = {
	name: 'ResponseSentError',
	title: 'Unable to set response.',
	message: 'The response has already been sent to the browser and cannot be altered.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Thrown when the middleware does not return any data or call the `next` function.
 *
 * For example:
 * ```ts
 * import {defineMiddleware} from "astro:middleware";
 * export const onRequest = defineMiddleware((context, _) => {
 * 	// doesn't return anything or call `next`
 * 	context.locals.someData = false;
 * });
 * ```
 */
export const MiddlewareNoDataOrNextCalled = {
	name: 'MiddlewareNoDataOrNextCalled',
	title: "The middleware didn't return a `Response`.",
	message:
		'Make sure your middleware returns a `Response` object, either directly or by returning the `Response` from calling the `next` function.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Thrown in development mode when middleware returns something that is not a `Response` object.
 *
 * For example:
 * ```ts
 * import {defineMiddleware} from "astro:middleware";
 * export const onRequest = defineMiddleware(() => {
 *   return "string"
 * });
 * ```
 */
export const MiddlewareNotAResponse = {
	name: 'MiddlewareNotAResponse',
	title: 'The middleware returned something that is not a `Response` object.',
	message: 'Any data returned from middleware must be a valid `Response` object.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Thrown when an endpoint does not return anything or returns an object that is not a `Response` object.
 *
 * An endpoint must return either a `Response`, or a `Promise` that resolves with a `Response`. For example:
 * ```ts
 * import type { APIContext } from 'astro';
 *
 * export async function GET({ request, url, cookies }: APIContext): Promise<Response> {
 *     return Response.json({
 *         success: true,
 *         result: 'Data from Astro Endpoint!'
 *     })
 * }
 * ```
 */
export const EndpointDidNotReturnAResponse = {
	name: 'EndpointDidNotReturnAResponse',
	title: 'The endpoint did not return a `Response`.',
	message:
		'An endpoint must return either a `Response`, or a `Promise` that resolves with a `Response`.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 *
 * Thrown when `locals` is overwritten with something that is not an object
 *
 * For example:
 * ```ts
 * import {defineMiddleware} from "astro:middleware";
 * export const onRequest = defineMiddleware((context, next) => {
 *   context.locals = 1541;
 *   return next();
 * });
 * ```
 */
export const LocalsNotAnObject = {
	name: 'LocalsNotAnObject',
	title: 'Value assigned to `locals` is not accepted.',
	message:
		'`locals` can only be assigned to an object. Other values like numbers, strings, etc. are not accepted.',
	hint: 'If you tried to remove some information from the `locals` object, try to use `delete` or set the property to `undefined`.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Thrown when a value is being set as the `locals` field on the Astro global or context.
 */
export const LocalsReassigned = {
	name: 'LocalsReassigned',
	title: '`locals` must not be reassigned.',
	message: '`locals` can not be assigned directly.',
	hint: 'Set a `locals` property instead.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Thrown when a value is being set as the `headers` field on the `ResponseInit` object available as `Astro.response`.
 */
export const AstroResponseHeadersReassigned = {
	name: 'AstroResponseHeadersReassigned',
	title: '`Astro.response.headers` must not be reassigned.',
	message:
		'Individual headers can be added to and removed from `Astro.response.headers`, but it must not be replaced with another instance of `Headers` altogether.',
	hint: 'Consider using `Astro.response.headers.add()`, and `Astro.response.headers.delete()`.',
} satisfies ErrorData;

/**
 * @docs
 * @message Error when initializing session storage with driver `DRIVER`. `ERROR`
 * @see
 * 	- [experimental.session](https://docs.astro.build/en/reference/experimental-flags/sessions/)
 * @description
 * Thrown when the session storage could not be initialized.
 */
export const SessionStorageInitError = {
	name: 'SessionStorageInitError',
	title: 'Session storage could not be initialized.',
	message: (error: string, driver?: string) =>
		`Error when initializing session storage${driver ? ` with driver \`${driver}\`` : ''}. \`${error ?? ''}\``,
	hint: 'For more information, see https://docs.astro.build/en/reference/experimental-flags/sessions/',
} satisfies ErrorData;

/**
 * @docs
 * @message Error when saving session data with driver `DRIVER`. `ERROR`
 * @see
 * 	- [experimental.session](https://docs.astro.build/en/reference/experimental-flags/sessions/)
 * @description
 * Thrown when the session data could not be saved.
 */
export const SessionStorageSaveError = {
	name: 'SessionStorageSaveError',
	title: 'Session data could not be saved.',
	message: (error: string, driver?: string) =>
		`Error when saving session data${driver ? ` with driver \`${driver}\`` : ''}. \`${error ?? ''}\``,
	hint: 'For more information, see https://docs.astro.build/en/reference/experimental-flags/sessions/',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Thrown in development mode when middleware throws an error while attempting to loading it.
 *
 * For example:
 * ```ts
 * import {defineMiddleware} from "astro:middleware";
 * throw new Error("Error thrown while loading the middleware.")
 * export const onRequest = defineMiddleware(() => {
 *   return "string"
 * });
 * ```
 */
export const MiddlewareCantBeLoaded = {
	name: 'MiddlewareCantBeLoaded',
	title: "Can't load the middleware.",
	message: 'An unknown error was thrown while loading your middleware.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Images](https://docs.astro.build/en/guides/images/)
 * @description
 * When using the default image services, `Image`'s and `getImage`'s `src` parameter must be either an imported image or an URL, it cannot be a string of a filepath.
 *
 * For local images from content collections, you can use the [image() schema helper](https://docs.astro.build/en/guides/images/#images-in-content-collections) to resolve the images.
 *
 * ```astro
 * ---
 * import { Image } from "astro:assets";
 * import myImage from "../my_image.png";
 * ---
 *
 * <!-- GOOD: `src` is the full imported image. -->
 * <Image src={myImage} alt="Cool image" />
 *
 * <!-- GOOD: `src` is a URL. -->
 * <Image src="https://example.com/my_image.png" alt="Cool image" />
 *
 * <!-- BAD: `src` is an image's `src` path instead of the full image object. -->
 * <Image src={myImage.src} alt="Cool image" />
 *
 * <!-- BAD: `src` is a string filepath. -->
 * <Image src="../my_image.png" alt="Cool image" />
 * ```
 */
export const LocalImageUsedWrongly = {
	name: 'LocalImageUsedWrongly',
	title: 'Local images must be imported.',
	message: (imageFilePath: string) =>
		`\`Image\`'s and \`getImage\`'s \`src\` parameter must be an imported image or an URL, it cannot be a string filepath. Received \`${imageFilePath}\`.`,
	hint: 'If you want to use an image from your `src` folder, you need to either import it or if the image is coming from a content collection, use the [image() schema helper](https://docs.astro.build/en/guides/images/#images-in-content-collections). See https://docs.astro.build/en/guides/images/#src-required for more information on the `src` property.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Astro.glob](https://docs.astro.build/en/reference/api-reference/#astroglob)
 * @description
 * `Astro.glob()` can only be used in `.astro` files. You can use [`import.meta.glob()`](https://vite.dev/guide/features.html#glob-import) instead to achieve the same result.
 */
export const AstroGlobUsedOutside = {
	name: 'AstroGlobUsedOutside',
	title: 'Astro.glob() used outside of an Astro file.',
	message: (globStr: string) =>
		`\`Astro.glob(${globStr})\` can only be used in \`.astro\` files. \`import.meta.glob(${globStr})\` can be used instead to achieve a similar result.`,
	hint: "See Vite's documentation on `import.meta.glob` for more information: https://vite.dev/guide/features.html#glob-import",
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Astro.glob](https://docs.astro.build/en/reference/api-reference/#astroglob)
 * @description
 * `Astro.glob()` did not return any matching files. There might be a typo in the glob pattern.
 */
export const AstroGlobNoMatch = {
	name: 'AstroGlobNoMatch',
	title: 'Astro.glob() did not match any files.',
	message: (globStr: string) => `\`Astro.glob(${globStr})\` did not return any matching files.`,
	hint: 'Check the pattern for typos.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Astro.redirect](https://docs.astro.build/en/reference/api-reference/#redirect)
 * @description
 * A redirect must be given a location with the `Location` header.
 */
export const RedirectWithNoLocation = {
	name: 'RedirectWithNoLocation',
	title: 'A redirect must be given a location with the `Location` header.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Astro.redirect](https://docs.astro.build/en/reference/api-reference/#redirect)
 * @description
 * An external redirect must start with http or https, and must be a valid URL.
 */
export const UnsupportedExternalRedirect = {
	name: 'UnsupportedExternalRedirect',
	title: 'Unsupported or malformed URL.',
	message: 'An external redirect must start with http or https, and must be a valid URL.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Dynamic routes](https://docs.astro.build/en/guides/routing/#dynamic-routes)
 * @description
 * A dynamic route param is invalid. This is often caused by an `undefined` parameter or a missing [rest parameter](https://docs.astro.build/en/guides/routing/#rest-parameters).
 */
export const InvalidDynamicRoute = {
	name: 'InvalidDynamicRoute',
	title: 'Invalid dynamic route.',
	message: (route: string, invalidParam: string, received: string) =>
		`The ${invalidParam} param for route ${route} is invalid. Received **${received}**.`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Default Image Service](https://docs.astro.build/en/guides/images/#default-image-service)
 * - [Image Services API](https://docs.astro.build/en/reference/image-service-reference/)
 * @description
 * Sharp is the default image service used for `astro:assets`. When using a [strict package manager](https://pnpm.io/pnpm-vs-npm#npms-flat-tree) like pnpm, Sharp must be installed manually into your project in order to use image processing.
 *
 * If you are not using `astro:assets` for image processing, and do not wish to install Sharp, you can configure the following passthrough image service that does no processing:
 *
 * ```js
 * import { defineConfig, passthroughImageService } from "astro/config";
 * export default defineConfig({
 *  image: {
 *    service: passthroughImageService(),
 *  },
 * });
 * ```
 */
export const MissingSharp = {
	name: 'MissingSharp',
	title: 'Could not find Sharp.',
	message:
		'Could not find Sharp. Please install Sharp (`sharp`) manually into your project or migrate to another image service.',
	hint: "See Sharp's installation instructions for more information: https://sharp.pixelplumbing.com/install. If you are not relying on `astro:assets` to optimize, transform, or process any images, you can configure a passthrough image service instead of installing Sharp. See https://docs.astro.build/en/reference/errors/missing-sharp for more information.\n\nSee https://docs.astro.build/en/guides/images/#default-image-service for more information on how to migrate to another image service.",
};
// No headings here, that way Vite errors are merged with Astro ones in the docs, which makes more sense to users.
// Vite Errors - 4xxx
/**
 * @docs
 * @see
 * - [Vite troubleshooting guide](https://vite.dev/guide/troubleshooting.html)
 * @description
 * Vite encountered an unknown error while rendering your project. We unfortunately do not know what happened (or we would tell you!)
 *
 * If you can reliably cause this error to happen, we'd appreciate if you could [open an issue](https://astro.build/issues/)
 */
export const UnknownViteError = {
	name: 'UnknownViteError',
	title: 'Unknown Vite Error.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Type Imports](https://docs.astro.build/en/guides/typescript/#type-imports)
 * @description
 * Astro could not import the requested file. Oftentimes, this is caused by the import path being wrong (either because the file does not exist, or there is a typo in the path)
 *
 * This message can also appear when a type is imported without specifying that it is a [type import](https://docs.astro.build/en/guides/typescript/#type-imports).
 */
export const FailedToLoadModuleSSR = {
	name: 'FailedToLoadModuleSSR',
	title: 'Could not import file.',
	message: (importName: string) => `Could not import \`${importName}\`.`,
	hint: 'This is often caused by a typo in the import path. Please make sure the file exists.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Glob Patterns](https://docs.astro.build/en/guides/imports/#glob-patterns)
 * @description
 * Astro encountered an invalid glob pattern. This is often caused by the glob pattern not being a valid file path.
 */
export const InvalidGlob = {
	name: 'InvalidGlob',
	title: 'Invalid glob pattern.',
	message: (globPattern: string) =>
		`Invalid glob pattern: \`${globPattern}\`. Glob patterns must start with './', '../' or '/'.`,
	hint: 'See https://docs.astro.build/en/guides/imports/#glob-patterns for more information on supported glob patterns.',
} satisfies ErrorData;
/**
 * @docs
 * @description
 * Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error.
 */
export const FailedToFindPageMapSSR = {
	name: 'FailedToFindPageMapSSR',
	title: "Astro couldn't find the correct page to render",
	message:
		"Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error. Please file an issue.",
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro can't find the requested locale. All supported locales must be configured in [i18n.locales](/en/reference/configuration-reference/#i18nlocales) and have corresponding directories within `src/pages/`.
 */
export const MissingLocale = {
	name: 'MissingLocaleError',
	title: 'The provided locale does not exist.',
	message: (locale: string) =>
		`The locale/path \`${locale}\` does not exist in the configured \`i18n.locales\`.`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro could not find the index URL of your website. An index page is required so that Astro can create a redirect from the main index page to the localized index page of the default locale when using [`i18n.routing.prefixDefaultLocale`](https://docs.astro.build/en/reference/configuration-reference/#i18nroutingprefixdefaultlocale).
 * @see
 * - [Internationalization](https://docs.astro.build/en/guides/internationalization/#routing)
 * - [`i18n.routing` Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/#i18nrouting)
 */
export const MissingIndexForInternationalization = {
	name: 'MissingIndexForInternationalizationError',
	title: 'Index page not found.',
	message: (defaultLocale: string) =>
		`Could not find index page. A root index page is required in order to create a redirect to the index URL of the default locale. (\`/${defaultLocale}\`)`,
	hint: (src: string) => `Create an index page (\`index.astro, index.md, etc.\`) in \`${src}\`.`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Some internationalization functions are only available when Astro's own i18n routing is disabled by the configuration setting `i18n.routing: "manual"`.
 *
 * @see
 * - [`i18n` routing](https://docs.astro.build/en/guides/internationalization/#routing)
 */
export const IncorrectStrategyForI18n = {
	name: 'IncorrectStrategyForI18n',
	title: "You can't use the current function with the current strategy",
	message: (functionName: string) =>
		`The function \`${functionName}\` can only be used when the \`i18n.routing.strategy\` is set to \`"manual"\`.`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Static pages aren't yet supported with i18n domains. If you wish to enable this feature, you have to disable prerendering.
 */
export const NoPrerenderedRoutesWithDomains = {
	name: 'NoPrerenderedRoutesWithDomains',
	title: "Prerendered routes aren't supported when internationalization domains are enabled.",
	message: (component: string) =>
		`Static pages aren't yet supported with multiple domains. To enable this feature, you must disable prerendering for the page ${component}`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro throws an error if the user enables manual routing, but it doesn't have a middleware file.
 */
export const MissingMiddlewareForInternationalization = {
	name: 'MissingMiddlewareForInternationalization',
	title: 'Enabled manual internationalization routing without having a middleware.',
	message:
		"Your configuration setting `i18n.routing: 'manual'` requires you to provide your own i18n `middleware` file.",
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro could not find an associated file with content while trying to render the route. This is an Astro error and not a user error. If restarting the dev server does not fix the problem, please file an issue.
 */
export const CantRenderPage = {
	name: 'CantRenderPage',
	title: "Astro can't render the route.",
	message:
		'Astro cannot find any content to render for this route. There is no file or redirect associated with this route.',
	hint: 'If you expect to find a route here, this may be an Astro bug. Please file an issue/restart the dev server',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro could not find any code to handle a rejected `Promise`. Make sure all your promises have an `await` or `.catch()` handler.
 */
export const UnhandledRejection = {
	name: 'UnhandledRejection',
	title: 'Unhandled rejection',
	message: (stack: string) =>
		`Astro detected an unhandled rejection. Here's the stack trace:\n${stack}`,
	hint: 'Make sure your promises all have an `await` or a `.catch()` handler.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * The `astro:i18n` module can not be used without enabling i18n in your Astro config. To enable i18n, add a default locale and a list of supported locales to your Astro config:
 * ```js
 * import { defineConfig } from 'astro'
 * export default defineConfig({
 *  i18n: {
 * 	 locales: ['en', 'fr'],
 * 	 defaultLocale: 'en',
 * 	},
 * })
 * ```
 *
 * For more information on internationalization support in Astro, see our [Internationalization guide](https://docs.astro.build/en/guides/internationalization/).
 * @see
 * - [Internationalization](https://docs.astro.build/en/guides/internationalization/)
 * - [`i18n` Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/#i18n)
 */
export const i18nNotEnabled = {
	name: 'i18nNotEnabled',
	title: 'i18n Not Enabled',
	message: 'The `astro:i18n` module can not be used without enabling i18n in your Astro config.',
	hint: 'See https://docs.astro.build/en/guides/internationalization for a guide on setting up i18n.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * An i18n utility tried to use the locale from a URL path that does not contain one. You can prevent this error by using pathHasLocale to check URLs for a locale first before using i18n utilities.
 *
 */
export const i18nNoLocaleFoundInPath = {
	name: 'i18nNoLocaleFoundInPath',
	title: "The path doesn't contain any locale",
	message:
		"You tried to use an i18n utility on a path that doesn't contain any locale. You can use `pathHasLocale` first to determine if the path has a locale.",
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro couldn't find a route matching the one provided by the user
 */
export const RouteNotFound = {
	name: 'RouteNotFound',
	title: 'Route not found.',
	message: `Astro could not find a route that matches the one you requested.`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Some environment variables do not match the data type and/or properties defined in `env.schema`.
 * @message
 * The following environment variables defined in `env.schema` are invalid.
 */
export const EnvInvalidVariables = {
	name: 'EnvInvalidVariables',
	title: 'Invalid Environment Variables',
	message: (errors: Array<string>) =>
		`The following environment variables defined in \`env.schema\` are invalid:\n\n${errors.map((err) => `- ${err}`).join('\n')}\n`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * This module is only available server-side.
 */
export const ServerOnlyModule = {
	name: 'ServerOnlyModule',
	title: 'Module is only available server-side',
	message: (name: string) => `The "${name}" module is only available server-side.`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * `Astro.rewrite()` cannot be used if the request body has already been read. If you need to read the body, first clone the request. For example:
 *
 * ```js
 * const data = await Astro.request.clone().formData();
 *
 * Astro.rewrite("/target")
 * ```
 *
 * @see
 * - [Request.clone()](https://developer.mozilla.org/en-US/docs/Web/API/Request/clone)
 * - [Astro.rewrite](https://docs.astro.build/en/reference/api-reference/#rewrite)
 */

export const RewriteWithBodyUsed = {
	name: 'RewriteWithBodyUsed',
	title: 'Cannot use Astro.rewrite after the request body has been read',
	message:
		'Astro.rewrite() cannot be used if the request body has already been read. If you need to read the body, first clone the request.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * `Astro.rewrite()` can't be used to rewrite an on-demand route with a static route when using the `"server"` output.
 *
 */
export const ForbiddenRewrite = {
	name: 'ForbiddenRewrite',
	title: 'Forbidden rewrite to a static route.',
	message: (from: string, to: string, component: string) =>
		`You tried to rewrite the on-demand route '${from}' with the static route '${to}', when using the 'server' output. \n\nThe static route '${to}' is rendered by the component
'${component}', which is marked as prerendered. This is a forbidden operation because during the build the component '${component}' is compiled to an
HTML file, which can't be retrieved at runtime by Astro.`,
	hint: (component: string) =>
		`Add \`export const prerender = false\` to the component '${component}', or use a Astro.redirect().`,
} satisfies ErrorData;

/**
 * @docs
 * @description
 * An unknown error occurred while reading or writing files to disk. It can be caused by many things, eg. missing permissions or a file not existing we attempt to read.
 */
export const UnknownFilesystemError = {
	name: 'UnknownFilesystemError',
	title: 'An unknown error occurred while reading or writing files to disk.',
	hint: 'It can be caused by many things, eg. missing permissions or a file not existing we attempt to read. Check the error cause for more details.',
} satisfies ErrorData;

/**
 * @docs
 * @kind heading
 * @name CSS Errors
 */
// CSS Errors
/**
 * @docs
 * @see
 * 	- [Styles and CSS](https://docs.astro.build/en/guides/styling/)
 * @description
 * Astro encountered an unknown error while parsing your CSS. Oftentimes, this is caused by a syntax error and the error message should contain more information.
 */
export const UnknownCSSError = {
	name: 'UnknownCSSError',
	title: 'Unknown CSS Error.',
} satisfies ErrorData;
/**
 * @docs
 * @message
 * **Example error messages:**<br/>
 * CSSSyntaxError: Missed semicolon<br/>
 * CSSSyntaxError: Unclosed string<br/>
 * @description
 * Astro encountered an error while parsing your CSS, due to a syntax error. This is often caused by a missing semicolon.
 */
export const CSSSyntaxError = {
	name: 'CSSSyntaxError',
	title: 'CSS Syntax Error.',
} satisfies ErrorData;
/**
 * @docs
 * @kind heading
 * @name Markdown Errors
 */
// Markdown Errors
/**
 * @docs
 * @description
 * Astro encountered an unknown error while parsing your Markdown. Oftentimes, this is caused by a syntax error and the error message should contain more information.
 */
export const UnknownMarkdownError = {
	name: 'UnknownMarkdownError',
	title: 'Unknown Markdown Error.',
} satisfies ErrorData;
/**
 * @docs
 * @message
 * **Example error messages:**<br/>
 * can not read an implicit mapping pair; a colon is missed<br/>
 * unexpected end of the stream within a double quoted scalar<br/>
 * can not read a block mapping entry; a multiline key may not be an implicit key
 * @description
 * Astro encountered an error while parsing the frontmatter of your Markdown file.
 * This is often caused by a mistake in the syntax, such as a missing colon or a missing end quote.
 */
export const MarkdownFrontmatterParseError = {
	name: 'MarkdownFrontmatterParseError',
	title: 'Failed to parse Markdown frontmatter.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Modifying frontmatter programmatically](https://docs.astro.build/en/guides/markdown-content/#modifying-frontmatter-programmatically)
 * @description
 * A remark or rehype plugin attempted to inject invalid frontmatter. This occurs when "astro.frontmatter" is set to `null`, `undefined`, or an invalid JSON object.
 */
export const InvalidFrontmatterInjectionError = {
	name: 'InvalidFrontmatterInjectionError',
	title: 'Invalid frontmatter injection.',
	message:
		'A remark or rehype plugin attempted to inject invalid frontmatter. Ensure "astro.frontmatter" is set to a valid JSON object that is not `null` or `undefined`.',
	hint: 'See the frontmatter injection docs https://docs.astro.build/en/guides/markdown-content/#modifying-frontmatter-programmatically for more information.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [MDX installation and usage](https://docs.astro.build/en/guides/integrations-guide/mdx/)
 * @description
 * Unable to find the official `@astrojs/mdx` integration. This error is raised when using MDX files without an MDX integration installed.
 */
export const MdxIntegrationMissingError = {
	name: 'MdxIntegrationMissingError',
	title: 'MDX integration missing.',
	message: (file: string) =>
		`Unable to render ${file}. Ensure that the \`@astrojs/mdx\` integration is installed.`,
	hint: 'See the MDX integration docs for installation and usage instructions: https://docs.astro.build/en/guides/integrations-guide/mdx/',
} satisfies ErrorData;
// Config Errors - 7xxx
/**
 * @docs
 * @see
 * - [Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/)
 * @description
 * Astro encountered an unknown error loading your Astro configuration file.
 * This is often caused by a syntax error in your config and the message should offer more information.
 *
 * If you can reliably cause this error to happen, we'd appreciate if you could [open an issue](https://astro.build/issues/)
 */
export const UnknownConfigError = {
	name: 'UnknownConfigError',
	title: 'Unknown configuration error.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [--config](https://docs.astro.build/en/reference/cli-reference/#--config-path)
 * @description
 * The specified configuration file using `--config` could not be found. Make sure that it exists or that the path is correct
 */
export const ConfigNotFound = {
	name: 'ConfigNotFound',
	title: 'Specified configuration file not found.',
	message: (configFile: string) =>
		`Unable to resolve \`--config "${configFile}"\`. Does the file exist?`,
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Configuration reference](https://docs.astro.build/en/reference/configuration-reference/)
 * @description
 * Astro detected a legacy configuration option in your configuration file.
 */
export const ConfigLegacyKey = {
	name: 'ConfigLegacyKey',
	title: 'Legacy configuration detected.',
	message: (legacyConfigKey: string) => `Legacy configuration detected: \`${legacyConfigKey}\`.`,
	hint: 'Please update your configuration to the new format.\nSee https://astro.build/config for more information.',
} satisfies ErrorData;
/**
 * @docs
 * @kind heading
 * @name CLI Errors
 */
// CLI Errors
/**
 * @docs
 * @description
 * Astro encountered an unknown error while starting one of its CLI commands. The error message should contain more information.
 *
 * If you can reliably cause this error to happen, we'd appreciate if you could [open an issue](https://astro.build/issues/)
 */
export const UnknownCLIError = {
	name: 'UnknownCLIError',
	title: 'Unknown CLI Error.',
} satisfies ErrorData;
/**
 * @docs
 * @description
 * `astro sync` command failed to generate content collection types.
 * @see
 * - [Content collections documentation](https://docs.astro.build/en/guides/content-collections/)
 */
export const GenerateContentTypesError = {
	name: 'GenerateContentTypesError',
	title: 'Failed to generate content types.',
	message: (errorMessage: string) =>
		`\`astro sync\` command failed to generate content collection types: ${errorMessage}`,
	hint: (fileName?: string) =>
		`This error is often caused by a syntax error inside your content, or your content configuration file. Check your ${fileName ?? 'content config'} file for typos.`,
} satisfies ErrorData;
/**
 * @docs
 * @kind heading
 * @name Content Collection Errors
 */
// Content Collection Errors
/**
 * @docs
 * @description
 * Astro encountered an unknown error loading your content collections.
 * This can be caused by certain errors inside your `src/content.config.ts` file or some internal errors.
 *
 * If you can reliably cause this error to happen, we'd appreciate if you could [open an issue](https://astro.build/issues/)
 */
export const UnknownContentCollectionError = {
	name: 'UnknownContentCollectionError',
	title: 'Unknown Content Collection Error.',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * Astro tried to render a content collection entry that was undefined. This can happen if you try to render an entry that does not exist.
 */
export const RenderUndefinedEntryError = {
	name: 'RenderUndefinedEntryError',
	title: 'Attempted to render an undefined content collection entry.',
	hint: 'Check if the entry is undefined before passing it to `render()`',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * The `getDataEntryById` and `getEntryBySlug` functions are deprecated and cannot be used with content layer collections. Use the `getEntry` function instead.
 */
export const GetEntryDeprecationError = {
	name: 'GetEntryDeprecationError',
	title: 'Invalid use of `getDataEntryById` or `getEntryBySlug` function.',
	message: (collection: string, method: string) =>
		`The \`${method}\` function is deprecated and cannot be used to query the "${collection}" collection. Use \`getEntry\` instead.`,
	hint: 'Use the `getEntry` or `getCollection` functions to query content layer collections.',
} satisfies ErrorData;

/**
 * @docs
 * @message
 * **Example error message:**<br/>
 * **blog** → **post.md** frontmatter does not match collection schema.<br/>
 * "title" is required.<br/>
 * "date" must be a valid date.
 * @description
 * A Markdown or MDX entry does not match its collection schema.
 * Make sure that all required fields are present, and that all fields are of the correct type.
 * You can check against the collection schema in your `src/content.config.*` file.
 * See the [Content collections documentation](https://docs.astro.build/en/guides/content-collections/) for more information.
 */
export const InvalidContentEntryFrontmatterError = {
	name: 'InvalidContentEntryFrontmatterError',
	title: 'Content entry frontmatter does not match schema.',
	message(collection: string, entryId: string, error: ZodError) {
		return [
			`**${String(collection)} → ${String(
				entryId,
			)}** frontmatter does not match collection schema.`,
			...error.errors.map((zodError) => zodError.message),
		].join('\n');
	},
	hint: 'See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.',
} satisfies ErrorData;

/**
 * @docs
 * @message
 * **Example error message:**<br/>
 * **blog** → **post** frontmatter does not match collection schema.<br/>
 * "title" is required.<br/>
 * "date" must be a valid date.
 * @description
 * A content entry does not match its collection schema.
 * Make sure that all required fields are present, and that all fields are of the correct type.
 * You can check against the collection schema in your `src/content.config.*` file.
 * See the [Content collections documentation](https://docs.astro.build/en/guides/content-collections/) for more information.
 */
export const InvalidContentEntryDataError = {
	name: 'InvalidContentEntryDataError',
	title: 'Content entry data does not match schema.',
	message(collection: string, entryId: string, error: ZodError) {
		return [
			`**${String(collection)} → ${String(entryId)}** data does not match collection schema.`,
			...error.errors.map((zodError) => zodError.message),
		].join('\n');
	},
	hint: 'See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.',
} satisfies ErrorData;

/**
 * @docs
 * @message
 * **Example error message:**<br/>
 * The content loader for the collection **blog** returned an entry with an invalid `id`:<br/>
 * &#123;<br/>
 *   "id": 1,<br/>
 *   "title": "Hello, World!"<br/>
 * &#125;
 * @description
 * A content loader returned an invalid `id`.
 * Make sure that the `id` of the entry is a string.
 * See the [Content collections documentation](https://docs.astro.build/en/guides/content-collections/) for more information.
 */
export const ContentLoaderReturnsInvalidId = {
	name: 'ContentLoaderReturnsInvalidId',
	title: 'Content loader returned an entry with an invalid `id`.',
	message(collection: string, entry: any) {
		return [
			`The content loader for the collection **${String(collection)}** returned an entry with an invalid \`id\`:`,
			JSON.stringify(entry, null, 2),
		].join('\n');
	},
	hint: 'Make sure that the `id` of the entry is a string. See https://docs.astro.build/en/guides/content-collections/ for more information on content loaders.',
} satisfies ErrorData;

/**
 * @docs
 * @message
 * **Example error message:**<br/>
 * **blog** → **post** data does not match collection schema.<br/>
 * "title" is required.<br/>
 * "date" must be a valid date.
 * @description
 * A content entry does not match its collection schema.
 * Make sure that all required fields are present, and that all fields are of the correct type.
 * You can check against the collection schema in your `src/content.config.*` file.
 * See the [Content collections documentation](https://docs.astro.build/en/guides/content-collections/) for more information.
 */
export const ContentEntryDataError = {
	name: 'ContentEntryDataError',
	title: 'Content entry data does not match schema.',
	message(collection: string, entryId: string, error: ZodError) {
		return [
			`**${String(collection)} → ${String(entryId)}** data does not match collection schema.`,
			...error.errors.map((zodError) => zodError.message),
		].join('\n');
	},
	hint: 'See https://docs.astro.build/en/guides/content-collections/ for more information on content schemas.',
} satisfies ErrorData;

/**
 * @docs
 * @message
 * **Example error message:**<br/>
 * The loader for **blog** returned invalid data.<br/>
 * Object is missing required property "id".
 * @description
 * The loader for a content collection returned invalid data.
 * Inline loaders must return an array of objects with unique ID fields or a plain object with IDs as keys and entries as values.
 */
export const ContentLoaderInvalidDataError = {
	name: 'ContentLoaderInvalidDataError',
	title: 'Content entry is missing an ID',
	message(collection: string, extra: string) {
		return `**${String(collection)}** entry is missing an ID.\n${extra}`;
	},
	hint: 'See https://docs.astro.build/en/guides/content-collections/ for more information on content loaders.',
} satisfies ErrorData;

/**
 * @docs
 * @message `COLLECTION_NAME` → `ENTRY_ID` has an invalid slug. `slug` must be a string.
 * @see
 * - [The reserved entry `slug` field](https://docs.astro.build/en/guides/content-collections/)
 * @description
 * A collection entry has an invalid `slug`. This field is reserved for generating entry slugs, and must be a string when present.
 */
export const InvalidContentEntrySlugError = {
	name: 'InvalidContentEntrySlugError',
	title: 'Invalid content entry slug.',
	message(collection: string, entryId: string) {
		return `${String(collection)} → ${String(
			entryId,
		)} has an invalid slug. \`slug\` must be a string.`;
	},
	hint: 'See https://docs.astro.build/en/guides/content-collections/ for more on the `slug` field.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Legacy content collections](https://docs.astro.build/en/guides/upgrade-to/v5/#updating-existing-collections)
 * @description
 * A legacy content collection schema should not contain the `slug` field. This is reserved by Astro for generating entry slugs. Remove `slug` from your schema. You can still use custom slugs in your frontmatter.
 */
export const ContentSchemaContainsSlugError = {
	name: 'ContentSchemaContainsSlugError',
	title: 'Content Schema should not contain `slug`.',
	message: (collectionName: string) =>
		`A content collection schema should not contain \`slug\` since it is reserved for slug generation. Remove this from your ${collectionName} collection schema.`,
	hint: 'See https://docs.astro.build/en/guides/content-collections/ for more on the `slug` field.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Legacy content collections](https://docs.astro.build/en/guides/upgrade-to/v5/#updating-existing-collections)
 * @description
 * A legacy content collection cannot contain a mix of content and data entries. You must store entries in separate collections by type.
 */
export const MixedContentDataCollectionError = {
	name: 'MixedContentDataCollectionError',
	title: 'Content and data cannot be in same collection.',
	message: (collectionName: string) =>
		`**${collectionName}** contains a mix of content and data entries. All entries must be of the same type.`,
	hint: 'Store data entries in a new collection separate from your content collection.',
} satisfies ErrorData;
/**
 * @docs
 * @see
 * - [Legacy content collections](https://docs.astro.build/en/guides/upgrade-to/v5/#updating-existing-collections)
 * @description
 * Legacy content collections must contain entries of the type configured. Collections are `type: 'content'` by default. Try adding `type: 'data'` to your collection config for data collections.
 */
export const ContentCollectionTypeMismatchError = {
	name: 'ContentCollectionTypeMismatchError',
	title: 'Collection contains entries of a different type.',
	message: (collection: string, expectedType: string, actualType: string) =>
		`${collection} contains ${expectedType} entries, but is configured as a ${actualType} collection.`,
} satisfies ErrorData;
/**
 * @docs
 * @message `COLLECTION_ENTRY_NAME` failed to parse.
 * @description
 * Collection entries of `type: 'data'` must return an object with valid JSON (for `.json` entries) or YAML (for `.yaml` entries).
 */
export const DataCollectionEntryParseError = {
	name: 'DataCollectionEntryParseError',
	title: 'Data collection entry failed to parse.',
	message(entryId: string, errorMessage: string) {
		return `**${entryId}** failed to parse: ${errorMessage}`;
	},
	hint: 'Ensure your data entry is an object with valid JSON (for `.json` entries) or YAML (for `.yaml` entries).',
} satisfies ErrorData;
/**
 * @docs
 * @message `COLLECTION_NAME` contains multiple entries with the same slug: `SLUG`. Slugs must be unique.
 * @description
 * Content collection entries must have unique slugs. Duplicates are often caused by the `slug` frontmatter property.
 */
export const DuplicateContentEntrySlugError = {
	name: 'DuplicateContentEntrySlugError',
	title: 'Duplicate content entry slug.',
	message(collection: string, slug: string, preExisting: string, alsoFound: string) {
		return (
			`**${collection}** contains multiple entries with the same slug: \`${slug}\`. ` +
			`Slugs must be unique.\n\n` +
			`Entries: \n` +
			`- ${preExisting}\n` +
			`- ${alsoFound}`
		);
	},
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [devalue library](https://github.com/rich-harris/devalue)
 * @description
 * `transform()` functions in your content config must return valid JSON, or data types compatible with the devalue library (including Dates, Maps, and Sets).
 */
export const UnsupportedConfigTransformError = {
	name: 'UnsupportedConfigTransformError',
	title: 'Unsupported transform in content config.',
	message: (parseError: string) =>
		`\`transform()\` functions in your content config must return valid JSON, or data types compatible with the devalue library (including Dates, Maps, and Sets).\nFull error: ${parseError}`,
	hint: 'See the devalue library for all supported types: https://github.com/rich-harris/devalue',
} satisfies ErrorData;

/**
 * @docs
 * @kind heading
 * @name Action Errors
 */
// Action Errors
/**
 * @docs
 * @see
 * - [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
 * @description
 * Your project must have a server output to create backend functions with Actions.
 */
export const ActionsWithoutServerOutputError = {
	name: 'ActionsWithoutServerOutputError',
	title: 'Actions must be used with server output.',
	message:
		'A server is required to create callable backend functions. To deploy routes to a server, add an adapter to your Astro config and configure your route for on-demand rendering',
	hint: 'Add an adapter and enable on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [Actions handler reference](https://docs.astro.build/en/reference/modules/astro-actions/#handler-property)
 * @description
 * Action handler returned invalid data. Handlers should return serializable data types, and cannot return a Response object.
 */
export const ActionsReturnedInvalidDataError = {
	name: 'ActionsReturnedInvalidDataError',
	title: 'Action handler returned invalid data.',
	message: (error: string) =>
		`Action handler returned invalid data. Handlers should return serializable data types like objects, arrays, strings, and numbers. Parse error: ${error}`,
	hint: 'See the devalue library for all supported types: https://github.com/rich-harris/devalue',
} satisfies ErrorData;

/**
 * @docs
 * @description
 * The server received a request for an action but could not find a match with the same name.
 */
export const ActionNotFoundError = {
	name: 'ActionNotFoundError',
	title: 'Action not found.',
	message: (actionName: string) =>
		`The server received a request for an action named \`${actionName}\` but could not find a match. If you renamed an action, check that you've updated your \`actions/index\` file and your calling code to match.`,
	hint: 'You can run `astro check` to detect type errors caused by mismatched action names.',
} satisfies ErrorData;

/**
 * @docs
 * @see
 * - [`Astro.callAction()` reference](https://docs.astro.build/en/reference/api-reference/#callaction)
 * @description
 * Action called from a server page or endpoint without using `Astro.callAction()`.
 */
export const ActionCalledFromServerError = {
	name: 'ActionCalledFromServerError',
	title: 'Action unexpected called from the server.',
	message:
		'Action called from a server page or endpoint without using `Astro.callAction()`. This wrapper must be used to call actions from server code.',
	hint: 'See the `Astro.callAction()` reference for usage examples: https://docs.astro.build/en/reference/api-reference/#callaction',
} satisfies ErrorData;

// Generic catch-all - Only use this in extreme cases, like if there was a cosmic ray bit flip.
export const UnknownError = { name: 'UnknownError', title: 'Unknown Error.' } satisfies ErrorData;

/*
 * Adding an error? Follow these steps:
 * 1. Determine in which category it belongs (Astro, Vite, CSS, Content Collections etc.)
 * 2. Add it at the bottom of the corresponding category above (see the @kind heading tags to see where they start), following the shape of the other errors.
 * 4. If your message is dynamic, make sure the function shape is the following: `message: (something: type) => "my message"`, no `{}`, no `return` etc.
 * 		- It has to be the simple shape, or the docs generator will not be able to parse it correctly.
 * 		- If your message is fully dynamic (ex: lots of conditional logic), make `message` a proper function, like such: `message(parameters) { logic }`.
 * 			Make sure to add a `@message` tag with a static example of the error message, the docs won't be able to parse it otherwise.
 *  	- If your message is static, you can just use a string, `message: "my message"`.
 * 5. Make sure to add a JSdoc comment with the `@docs` tag so that it shows up in the docs, otherwise the error overlay will point to a 404!
 * For more information, see the README in this folder!
 */
