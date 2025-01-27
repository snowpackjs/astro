import type { OmitIndexSignature, Simplify } from '../../type-utils.js';
import type { APIContext } from './context.js';

/**
 * getStaticPaths() options
 *
 * [Astro Reference](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
 */
export interface GetStaticPathsOptions {
	paginate: PaginateFunction;
}

export type GetStaticPathsItem = {
	params: { [K in keyof Params]: Params[K] | number };
	props?: Props;
};
export type GetStaticPathsResult = GetStaticPathsItem[];
export type GetStaticPathsResultKeyed = GetStaticPathsResult & {
	keyed: Map<string, GetStaticPathsItem>;
};

/**
 * Return an array of pages to generate for a [dynamic route](https://docs.astro.build/en/guides/routing/#dynamic-routes). (**SSG Only**)
 *
 * [Astro Reference](https://docs.astro.build/en/reference/api-reference/#getstaticpaths)
 */
export type GetStaticPaths = (
	options: GetStaticPathsOptions,
) => Promise<GetStaticPathsResult> | GetStaticPathsResult;

/**
 * paginate() Options
 *
 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#paginate)
 */
export interface PaginateOptions<PaginateProps extends Props, PaginateParams extends Params> {
	/** the number of items per-page (default: `10`) */
	pageSize?: number;
	/** key: value object of page params (ex: `{ tag: 'javascript' }`) */
	params?: PaginateParams;
	/** object of props to forward to `page` result */
	props?: PaginateProps;
}

/**
 * Represents a single page of data in a paginated collection
 *
 * [Astro reference](https://docs.astro.build/en/reference/api-reference/#the-pagination-page-prop)
 */
export interface Page<T = any> {
	/** result */
	data: T[];
	/** metadata */
	/** the count of the first item on the page, starting from 0 */
	start: number;
	/** the count of the last item on the page, starting from 0 */
	end: number;
	/** total number of results */
	total: number;
	/** the current page number, starting from 1 */
	currentPage: number;
	/** number of items per page (default: 10) */
	size: number;
	/** number of last page */
	lastPage: number;
	url: {
		/** url of the current page */
		current: string;
		/** url of the previous page (if there is one) */
		prev: string | undefined;
		/** url of the next page (if there is one) */
		next: string | undefined;
		/** url of the first page (if the current page is not the first page) */
		first: string | undefined;
		/** url of the last page (if the current page is not the last page) */
		last: string | undefined;
	};
}

export type PaginateFunction = <
	PaginateData,
	AdditionalPaginateProps extends Props,
	AdditionalPaginateParams extends Params,
>(
	data: PaginateData[],
	args?: PaginateOptions<AdditionalPaginateProps, AdditionalPaginateParams>,
) => {
	params: Simplify<
		{
			page: string | undefined;
		} & OmitIndexSignature<AdditionalPaginateParams>
	>;
	props: Simplify<
		{
			page: Page<PaginateData>;
		} & OmitIndexSignature<AdditionalPaginateProps>
	>;
}[];

export type APIRoute<
	APIProps extends Record<string, any> = Record<string, any>,
	APIParams extends Record<string, string | undefined> = Record<string, string | undefined>,
> = (context: APIContext<APIProps, APIParams>) => Response | Promise<Response>;

export type RewritePayload = string | URL | Request;

export type MiddlewareNext = (rewritePayload?: RewritePayload) => Promise<Response>;
export type MiddlewareHandler = (
	context: APIContext,
	next: MiddlewareNext,
) => Promise<Response> | Response | Promise<void> | void;

// NOTE: when updating this file with other functions,
// remember to update `plugin-page.ts` too, to add that function as a no-op function.
export type AstroMiddlewareInstance = {
	onRequest?: MiddlewareHandler;
};

/**
 * Infers the shape of the `params` property returned by `getStaticPaths()`.
 *
 * @example
 * ```ts
 * import type { GetStaticPaths } from 'astro';
 *
 * export const getStaticPaths = (() => {
 *   return results.map((entry) => ({
 *     params: { slug: entry.slug },
 *   }));
 * }) satisfies GetStaticPaths;
 *
 * type Params = InferGetStaticParamsType<typeof getStaticPaths>;
 * //   ^? { slug: string; }
 *
 * const { slug } = Astro.params as Params;
 * ```
 */
export type InferGetStaticParamsType<T> = T extends (
	opts?: GetStaticPathsOptions,
) => infer R | Promise<infer R>
	? R extends Array<infer U>
		? U extends { params: infer P }
			? P
			: never
		: never
	: never;

/**
 * Infers the shape of the `props` property returned by `getStaticPaths()`.
 *
 * @example
 * ```ts
 * import type { GetStaticPaths } from 'astro';
 *
 * export const getStaticPaths = (() => {
 *   return results.map((entry) => ({
 *     params: { slug: entry.slug },
 *     props: {
 *       propA: true,
 *       propB: 42
 *     },
 *   }));
 * }) satisfies GetStaticPaths;
 *
 * type Props = InferGetStaticPropsType<typeof getStaticPaths>;
 * //   ^? { propA: boolean; propB: number; }
 *
 * const { propA, propB } = Astro.props;
 * ```
 */
export type InferGetStaticPropsType<T> = T extends (
	opts: GetStaticPathsOptions,
) => infer R | Promise<infer R>
	? R extends Array<infer U>
		? U extends { props: infer P }
			? P
			: never
		: never
	: never;

export type Params = Record<string, string | undefined>;
export type Props = Record<string, unknown>;
