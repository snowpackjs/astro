import type { z } from 'zod';
import type {
	ActionAccept,
	ActionClient,
	ActionReturnType,
} from '../../actions/runtime/virtual/server.js';
import type { SUPPORTED_MARKDOWN_FILE_EXTENSIONS } from '../../core/constants.js';
import type { AstroCookies } from '../../core/cookies/cookies.js';
import type { AstroSession } from '../../core/session.js';
import type { AstroComponentFactory } from '../../runtime/server/index.js';
import type { Params, RewritePayload } from './common.js';
import type { ValidRedirectStatus } from './config.js';
import type { AstroInstance, MDXInstance, MarkdownInstance } from './content.js';

/**
 * Astro global available in all contexts in .astro files
 *
 * [Astro reference](https://docs.astro.build/reference/api-reference/#astro-global)
 */
export interface AstroGlobal<
	Props extends Record<string, any> = Record<string, any>,
	Self = AstroComponentFactory,
	// eslint-disable-next-line @typescript-eslint/no-shadow
	Params extends Record<string, string | undefined> = Record<string, string | undefined>,
> extends AstroGlobalPartial,
		AstroSharedContext<Props, Params> {
	/**
	 * A full URL object of the request URL.
	 * Equivalent to: `new URL(Astro.request.url)`
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#url)
	 */
	url: AstroSharedContext['url'];
	/** Parameters passed to a dynamic page generated using [getStaticPaths](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
	 *
	 * Example usage:
	 * ```astro
	 * ---
	 * export async function getStaticPaths() {
	 *    return [
	 *     { params: { id: '1' } },
	 *   ];
	 * }
	 *
	 * const { id } = Astro.params;
	 * ---
	 * <h1>{id}</h1>
	 * ```
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroparams)
	 */
	params: AstroSharedContext<Props, Params>['params'];
	/** List of props passed to this component
	 *
	 * A common way to get specific props is through [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment), ex:
	 * ```typescript
	 * const { name } = Astro.props
	 * ```
	 *
	 * [Astro reference](https://docs.astro.build/en/basics/astro-components/#component-props)
	 */
	props: AstroSharedContext<Props, Params>['props'];
	/** Information about the current request. This is a standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object
	 *
	 * For example, to get a URL object of the current URL, you can use:
	 * ```typescript
	 * const url = new URL(Astro.request.url);
	 * ```
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astrorequest)
	 */
	request: Request;
	/** Information about the outgoing response. This is a standard [ResponseInit](https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#init) object
	 *
	 * For example, to change the status code you can set a different status on this object:
	 * ```typescript
	 * Astro.response.status = 404;
	 * ```
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroresponse)
	 */
	response: ResponseInit & {
		readonly headers: Headers;
	};
	/**
	 * Get an action result on the server when using a form POST.
	 * Expects the action function as a parameter.
	 * Returns a type-safe result with the action data when
	 * a matching POST request is received
	 * and `undefined` otherwise.
	 *
	 * Example usage:
	 *
	 * ```typescript
	 * import { actions } from 'astro:actions';
	 *
	 * const result = await Astro.getActionResult(actions.myAction);
	 * ```
	 */
	getActionResult: AstroSharedContext['getActionResult'];
	/**
	 * Call an Action directly from an Astro page or API endpoint.
	 * Expects the action function as the first parameter,
	 * and the type-safe action input as the second parameter.
	 * Returns a Promise with the action result.
	 *
	 * Example usage:
	 *
	 * ```typescript
	 * import { actions } from 'astro:actions';
	 *
	 * const result = await Astro.callAction(actions.getPost, { postId: 'test' });
	 * ```
	 */
	callAction: AstroSharedContext['callAction'];
	/** Redirect to another page
	 *
	 * Example usage:
	 * ```typescript
	 * if(!isLoggedIn) {
	 *   return Astro.redirect('/login');
	 * }
	 * ```
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroredirect)
	 */
	redirect: AstroSharedContext['redirect'];
	/**
	 * It rewrites to another page. As opposed to redirects, the URL won't change, and Astro will render the HTML emitted
	 * by the rewritten URL passed as argument.
	 *
	 * ## Example
	 *
	 * ```js
	 * if (pageIsNotEnabled) {
	 * 	return Astro.rewrite('/fallback-page')
	 * }
	 * ```
	 */
	rewrite: AstroSharedContext['rewrite'];

	/**
	 * The route currently rendered. It's stripped of the `srcDir` and the `pages` folder, and it doesn't contain the extension.
	 *
	 * ## Example
	 * - The value when rendering `src/pages/index.astro` will `index`.
	 * - The value when rendering `src/pages/blog/[slug].astro` will `blog/[slug]`.
	 * - The value when rendering `src/pages/[...path].astro` will `[...path]`.
	 */
	routePattern: string;
	/**
	 * The <Astro.self /> element allows a component to reference itself recursively.
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroself)
	 */
	self: Self;
	/** Utility functions for modifying an Astro component’s slotted children
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroslots)
	 */
	slots: Record<string, true | undefined> & {
		/**
		 * Check whether content for this slot name exists
		 *
		 * Example usage:
		 * ```typescript
		 *	if (Astro.slots.has('default')) {
		 *   // Do something...
		 *	}
		 * ```
		 *
		 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroslots)
		 */
		has(slotName: string): boolean;
		/**
		 * Asynchronously renders this slot and returns a string
		 *
		 * Example usage:
		 * ```astro
		 * ---
		 * let html: string = '';
		 * if (Astro.slots.has('default')) {
		 *   html = await Astro.slots.render('default')
		 * }
		 * ---
		 * <Fragment set:html={html} />
		 * ```
		 *
		 * A second parameter can be used to pass arguments to a slotted callback
		 *
		 * Example usage:
		 * ```astro
		 * ---
		 * html = await Astro.slots.render('default', ["Hello", "World"])
		 * ---
		 * ```
		 * Each item in the array will be passed as an argument that you can use like so:
		 * ```astro
		 * <Component>
		 *		{(hello, world) => <div>{hello}, {world}!</div>}
		 * </Component>
		 * ```
		 *
		 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroslots)
		 */
		render(slotName: string, args?: any[]): Promise<string>;
	};
}

/** Union type of supported markdown file extensions */
type MarkdownFileExtension = (typeof SUPPORTED_MARKDOWN_FILE_EXTENSIONS)[number];

export interface AstroGlobalPartial {
	/**
	 * Fetch local files into your static site setup
	 *
	 * Example usage:
	 * ```typescript
	 * const posts = await Astro.glob('../pages/post/*.md');
	 * ```
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astroglob)
	 * @deprecated Astro.glob is deprecated and will be removed in the next major version of Astro. Use `import.meta.glob` instead: https://vitejs.dev/guide/features.html#glob-import
	 */
	glob(globStr: `${any}.astro`): Promise<AstroInstance[]>;
	glob<T extends Record<string, any>>(
		globStr: `${any}${MarkdownFileExtension}`,
	): Promise<MarkdownInstance<T>[]>;
	glob<T extends Record<string, any>>(globStr: `${any}.mdx`): Promise<MDXInstance<T>[]>;
	glob<T extends Record<string, any>>(globStr: string): Promise<T[]>;
	/**
	 * Returns a [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) object built from the [site](https://docs.astro.build/en/reference/configuration-reference/#site) config option
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astrosite)
	 */
	site: URL | undefined;
	/**
	 * Returns a string with the current version of Astro.
	 *
	 * Useful for using `<meta name="generator" content={Astro.generator} />` or crediting Astro in a site footer.
	 *
	 * [HTML Specification for `generator`](https://html.spec.whatwg.org/multipage/semantics.html#meta-generator)
	 *
	 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#astrogenerator)
	 */
	generator: string;
}

// Shared types between `Astro` global and API context object
interface AstroSharedContext<
	Props extends Record<string, any> = Record<string, any>,
	RouteParams extends Record<string, string | undefined> = Record<string, string | undefined>,
> {
	/**
	 * The address (usually IP address) of the user.
	 *
	 * Throws an error if used within a static site, or within a prerendered page.
	 */
	clientAddress: string;
	/**
	 * Utility for getting and setting the values of cookies.
	 */
	cookies: AstroCookies;
	/**
	 * Utility for handling sessions.
	 */
	session?: AstroSession;
	/**
	 * Information about the current request. This is a standard [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) object
	 */
	request: Request;
	/**
	 * A full URL object of the request URL.
	 */
	url: URL;
	/**
	 * The origin pathname of the request URL.
	 * Useful to track the original URL before rewrites were applied.
	 */
	originPathname: string;
	/**
	 * Get action result on the server when using a form POST.
	 */
	getActionResult: <
		TAccept extends ActionAccept,
		TInputSchema extends z.ZodType,
		TAction extends ActionClient<unknown, TAccept, TInputSchema>,
	>(
		action: TAction,
	) => ActionReturnType<TAction> | undefined;
	/**
	 * Call action handler from the server.
	 */
	callAction: <
		TAccept extends ActionAccept,
		TInputSchema extends z.ZodType,
		TOutput,
		TAction extends
			| ActionClient<TOutput, TAccept, TInputSchema>
			| ActionClient<TOutput, TAccept, TInputSchema>['orThrow'],
	>(
		action: TAction,
		input: Parameters<TAction>[0],
	) => Promise<ActionReturnType<TAction>>;
	/**
	 * Route parameters for this request if this is a dynamic route.
	 */
	params: RouteParams;
	/**
	 * List of props returned for this path by `getStaticPaths` (**Static Only**).
	 */
	props: Props;
	/**
	 * Redirect to another page (**SSR Only**).
	 */
	redirect(path: string, status?: ValidRedirectStatus): Response;

	/**
	 * It rewrites to another page. As opposed to redirects, the URL won't change, and Astro will render the HTML emitted
	 * by the rerouted URL passed as argument.
	 *
	 * ## Example
	 *
	 * ```js
	 * if (pageIsNotEnabled) {
	 * 	return Astro.rewrite('/fallback-page')
	 * }
	 * ```
	 */
	rewrite(rewritePayload: RewritePayload): Promise<Response>;

	/**
	 * Object accessed via Astro middleware
	 */
	locals: App.Locals;

	/**
	 * The current locale that is computed from the `Accept-Language` header of the browser (**SSR Only**).
	 */
	preferredLocale: string | undefined;

	/**
	 * The list of locales computed from the `Accept-Language` header of the browser, sorted by quality value (**SSR Only**).
	 */

	preferredLocaleList: string[] | undefined;

	/**
	 * The current locale computed from the URL of the request. It matches the locales in `i18n.locales`, and returns `undefined` otherwise.
	 */
	currentLocale: string | undefined;

	/**
	 * Whether the current route is prerendered or not.
	 */
	isPrerendered: boolean;
}

/**
 * The `APIContext` is the object made available to endpoints and middleware.
 * It is a subset of the `Astro` global object available in pages.
 *
 * [Reference](https://docs.astro.build/en/reference/api-reference/#endpoint-context)
 */
export interface APIContext<
	Props extends Record<string, any> = Record<string, any>,
	APIParams extends Record<string, string | undefined> = Record<string, string | undefined>,
> extends AstroSharedContext<Props, Params> {
	/**
	 * The site provided in the astro config, parsed as an instance of `URL`, without base.
	 * `undefined` if the site is not provided in the config.
	 */
	site: URL | undefined;
	/**
	 * A human-readable string representing the Astro version used to create the project.
	 * For example, `"Astro v1.1.1"`.
	 */
	generator: string;
	/**
	 * The url of the current request, parsed as an instance of `URL`.
	 *
	 * Equivalent to:
	 * ```ts
	 * new URL(context.request.url)
	 * ```
	 */
	url: AstroSharedContext['url'];
	/**
	 * Parameters matching the page’s dynamic route pattern.
	 * In static builds, this will be the `params` generated by `getStaticPaths`.
	 * In SSR builds, this can be any path segments matching the dynamic route pattern.
	 *
	 * Example usage:
	 * ```ts
	 * import type { APIContext } from "astro"
	 *
	 * export function getStaticPaths() {
	 *   return [
	 *     { params: { id: '0' }, props: { name: 'Sarah' } },
	 *     { params: { id: '1' }, props: { name: 'Chris' } },
	 *     { params: { id: '2' }, props: { name: 'Fuzzy' } },
	 *   ];
	 * }
	 *
	 * export async function GET({ params }: APIContext) {
	 *   return new Response(`Hello user ${params.id}!`)
	 * }
	 * ```
	 *
	 * [Reference](https://docs.astro.build/en/reference/api-reference/#contextparams)
	 */
	params: AstroSharedContext<Props, APIParams>['params'];
	/**
	 * List of props passed from `getStaticPaths`. Only available to static builds.
	 *
	 * Example usage:
	 * ```ts
	 * import type { APIContext } from "astro"
	 *
	 * export function getStaticPaths() {
	 *   return [
	 *     { params: { id: '0' }, props: { name: 'Sarah' } },
	 *     { params: { id: '1' }, props: { name: 'Chris' } },
	 *     { params: { id: '2' }, props: { name: 'Fuzzy' } },
	 *   ];
	 * }
	 *
	 * export function GET({ props }: APIContext): Response {
	 *   return new Response(`Hello ${props.name}!`);
	 * }
	 * ```
	 *
	 * [Reference](https://docs.astro.build/en/reference/api-reference/#contextprops)
	 */
	props: AstroSharedContext<Props, APIParams>['props'];
	/**
	 * Create a response that redirects to another page.
	 *
	 * Example usage:
	 * ```ts
	 * // src/pages/secret.ts
	 * export function GET({ redirect }) {
	 *   return redirect('/login');
	 * }
	 * ```
	 *
	 * [Reference](https://docs.astro.build/en/guides/api-reference/#contextredirect)
	 */
	redirect: AstroSharedContext['redirect'];

	/**
	 * It reroutes to another page. As opposed to redirects, the URL won't change, and Astro will render the HTML emitted
	 * by the rerouted URL passed as argument.
	 *
	 * ## Example
	 *
	 * ```ts
	 * // src/pages/secret.ts
	 * export function GET(ctx) {
	 *   return ctx.rewrite(new URL("../"), ctx.url);
	 * }
	 * ```
	 */
	rewrite: AstroSharedContext['rewrite'];

	/**
	 * An object that middlewares can use to store extra information related to the request.
	 *
	 * It will be made available to pages as `Astro.locals`, and to endpoints as `context.locals`.
	 *
	 * Example usage:
	 *
	 * ```ts
	 * // src/middleware.ts
	 * import { defineMiddleware } from "astro:middleware";
	 *
	 * export const onRequest = defineMiddleware((context, next) => {
	 *   context.locals.greeting = "Hello!";
	 *   return next();
	 * });
	 * ```
	 * Inside a `.astro` file:
	 * ```astro
	 * ---
	 * // src/pages/index.astro
	 * const greeting = Astro.locals.greeting;
	 * ---
	 * <h1>{greeting}</h1>
	 * ```
	 *
	 * [Reference](https://docs.astro.build/en/reference/api-reference/#contextlocals)
	 */
	locals: App.Locals;

	/**
	 * Available only when `i18n` configured and in SSR.
	 *
	 * It represents the preferred locale of the user. It's computed by checking the supported locales in `i18n.locales`
	 * and locales supported by the users's browser via the header `Accept-Language`
	 *
	 * For example, given `i18n.locales` equals to `['fr', 'de']`, and the `Accept-Language` value equals to `en, de;q=0.2, fr;q=0.6`, the
	 * `Astro.preferredLanguage` will be `fr` because `en` is not supported, its [quality value] is the highest.
	 *
	 * [quality value]: https://developer.mozilla.org/en-US/docs/Glossary/Quality_values
	 */
	preferredLocale: string | undefined;

	/**
	 * Available only when `i18n` configured and in SSR.
	 *
	 * It represents the list of the preferred locales that are supported by the application. The list is sorted via [quality value].
	 *
	 * For example, given `i18n.locales` equals to `['fr', 'pt', 'de']`, and the `Accept-Language` value equals to `en, de;q=0.2, fr;q=0.6`, the
	 * `Astro.preferredLocaleList` will be equal to `['fs', 'de']` because `en` isn't supported, and `pt` isn't part of the locales contained in the
	 * header.
	 *
	 * When the `Accept-Header` is `*`, the original `i18n.locales` are returned. The value `*` means no preferences, so Astro returns all the supported locales.
	 *
	 * [quality value]: https://developer.mozilla.org/en-US/docs/Glossary/Quality_values
	 */
	preferredLocaleList: string[] | undefined;

	/**
	 * The current locale computed from the URL of the request. It matches the locales in `i18n.locales`, and returns `undefined` otherwise.
	 */
	currentLocale: string | undefined;

	/**
	 * The route currently rendered. It's stripped of the `srcDir` and the `pages` folder, and it doesn't contain the extension.
	 *
	 * ## Example
	 * - The value when rendering `src/pages/index.astro` will `index`.
	 * - The value when rendering `src/pages/blog/[slug].astro` will `blog/[slug]`.
	 * - The value when rendering `src/pages/[...path].astro` will `[...path]`.
	 */
	routePattern: string;
}
