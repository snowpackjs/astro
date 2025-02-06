/// <reference types="vite/types/import-meta.d.ts" />
/// <reference path="./types/content.d.ts" />
/// <reference path="./types/actions.d.ts" />
/// <reference path="./types/env.d.ts" />

interface ImportMetaEnv {
	/**
	 * The prefix for Astro-generated asset links if the build.assetsPrefix config option is set. This can be used to create asset links not handled by Astro.
	 */
	readonly ASSETS_PREFIX: string | Record<string, string>;
	/**
	 * This is set to the site option specified in your project’s Astro config file.
	 */
	readonly SITE: string;
}

interface ImportMeta {
	/**
	 * Astro and Vite expose environment variables through `import.meta.env`. For a complete list of the environment variables available, see the two references below.
	 *
	 * - [Astro reference](https://docs.astro.build/en/guides/environment-variables/#default-environment-variables)
	 * - [Vite reference](https://vite.dev/guide/env-and-mode.html#env-variables)
	 */
	readonly env: ImportMetaEnv;
}

declare module 'astro:assets' {
	// Exporting things one by one is a bit cumbersome, not sure if there's a better way - erika, 2023-02-03
	type AstroAssets = {
		// getImage's type here is different from the internal function since the Vite module implicitly pass the service config
		/**
		 * Get an optimized image and the necessary attributes to render it.
		 *
		 * **Example**
		 * ```astro
		 * ---
		 * import { getImage } from 'astro:assets';
		 * import originalImage from '../assets/image.png';
		 *
		 * const optimizedImage = await getImage({src: originalImage, width: 1280 });
		 * ---
		 * <img src={optimizedImage.src} {...optimizedImage.attributes} />
		 * ```
		 *
		 * This is functionally equivalent to using the `<Image />` component, as the component calls this function internally.
		 */
		getImage: (
			options: import('./dist/assets/types.js').UnresolvedImageTransform,
		) => Promise<import('./dist/assets/types.js').GetImageResult>;
		imageConfig: import('./dist/types/public/config.js').AstroConfig['image'] & {
			experimentalResponsiveImages: boolean;
		};
		getConfiguredImageService: typeof import('./dist/assets/index.js').getConfiguredImageService;
		inferRemoteSize: typeof import('./dist/assets/utils/index.js').inferRemoteSize;
		Image: typeof import('./components/Image.astro').default;
		Picture: typeof import('./components/Picture.astro').default;
	};

	type ImgAttributes = import('./dist/type-utils.js').WithRequired<
		Omit<import('./types').HTMLAttributes<'img'>, 'src' | 'width' | 'height'>,
		'alt'
	>;

	export type LocalImageProps = import('./dist/type-utils.js').Simplify<
		import('./dist/assets/types.js').LocalImageProps<ImgAttributes>
	>;
	export type RemoteImageProps = import('./dist/type-utils.js').Simplify<
		import('./dist/assets/types.js').RemoteImageProps<ImgAttributes>
	>;
	export const {
		getImage,
		getConfiguredImageService,
		imageConfig,
		Image,
		Picture,
		inferRemoteSize,
	}: AstroAssets;
}

type ImageMetadata = import('./dist/assets/types.js').ImageMetadata;

declare module '*.gif' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.jpeg' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.jpg' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.png' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.tiff' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.webp' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.avif' {
	const metadata: ImageMetadata;
	export default metadata;
}
declare module '*.svg' {
	type Props = {
		/**
		 * Accessible, short-text description
		 *
		 *  {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element/title|MDN Reference}
		 */
		title?: string;
		/**
		 * Shorthand for setting the `height` and `width` properties
		 */
		size?: number | string;
		/**
		 * Override the default rendering mode for SVGs
		 */
		mode?: import('./dist/assets/utils/svg.js').SvgRenderMode;
	} & astroHTML.JSX.SVGAttributes;

	const Component: ((_props: Props) => any) & ImageMetadata;
	export default Component;
}

declare module 'astro:transitions' {
	type TransitionModule = typeof import('./dist/virtual-modules/transitions.js');
	export const slide: TransitionModule['slide'];
	export const fade: TransitionModule['fade'];
	export const createAnimationScope: TransitionModule['createAnimationScope'];

	type ClientRouterModule = typeof import('./components/ClientRouter.astro');
	/**
	 * @deprecated The ViewTransitions component has been renamed to ClientRouter
	 */
	export const ViewTransitions: ClientRouterModule['default'];
	export const ClientRouter: ClientRouterModule['default'];
}

declare module 'astro:transitions/client' {
	type TransitionRouterModule = typeof import('./dist/virtual-modules/transitions-router.js');
	export const navigate: TransitionRouterModule['navigate'];
	export const supportsViewTransitions: TransitionRouterModule['supportsViewTransitions'];
	export const getFallback: TransitionRouterModule['getFallback'];
	export const transitionEnabledOnThisPage: TransitionRouterModule['transitionEnabledOnThisPage'];

	export type Fallback = import('./dist/virtual-modules/transitions-types.js').Fallback;
	export type Direction = import('./dist/virtual-modules/transitions-types.ts').Direction;
	// biome-ignore format: bug
	export type NavigationTypeString = import('./dist/virtual-modules/transitions-types.js').NavigationTypeString;
	export type Options = import('./dist/virtual-modules/transitions-types.js').Options;

	type EventModule = typeof import('./dist/virtual-modules/transitions-events.js');
	export const TRANSITION_BEFORE_PREPARATION: EventModule['TRANSITION_BEFORE_PREPARATION'];
	export const TRANSITION_AFTER_PREPARATION: EventModule['TRANSITION_AFTER_PREPARATION'];
	export const TRANSITION_BEFORE_SWAP: EventModule['TRANSITION_BEFORE_SWAP'];
	export const TRANSITION_AFTER_SWAP: EventModule['TRANSITION_AFTER_SWAP'];
	export const TRANSITION_PAGE_LOAD: EventModule['TRANSITION_PAGE_LOAD'];
	// biome-ignore format: bug
	export type TransitionBeforePreparationEvent = import('./dist/virtual-modules/transitions-events.js').TransitionBeforePreparationEvent;
	// biome-ignore format: bug
	export type TransitionBeforeSwapEvent = import('./dist/virtual-modules/transitions-events.js').TransitionBeforeSwapEvent;
	export const isTransitionBeforePreparationEvent: EventModule['isTransitionBeforePreparationEvent'];
	export const isTransitionBeforeSwapEvent: EventModule['isTransitionBeforeSwapEvent'];
	// biome-ignore format: bug
	type TransitionSwapFunctionModule = typeof import('./dist/virtual-modules/transitions-swap-functions.js');
	export const swapFunctions: TransitionSwapFunctionModule['swapFunctions'];
}

declare module 'astro:prefetch' {
	export { prefetch, PrefetchOptions } from 'astro/virtual-modules/prefetch.js';
}

declare module 'astro:i18n' {
	export * from 'astro/virtual-modules/i18n.js';
}

declare module 'astro:container' {
	export * from 'astro/virtual-modules/container.js';
}

declare module 'astro:middleware' {
	export * from 'astro/virtual-modules/middleware.js';
}

declare module 'astro:config/server' {
	// biome-ignore format: bug
	type ServerConfigSerialized = import('./dist/types/public/manifest.js').ServerDeserializedManifest;
	const manifest: ServerConfigSerialized;
	export default manifest;
}

declare module 'astro:config/client' {
	// biome-ignore format: bug
	type ClientConfigSerialized = import('./dist/types/public/manifest.js').ClientDeserializedManifest;
	const manifest: ClientConfigSerialized;
	export default manifest;
}

declare module 'astro:components' {
	export * from 'astro/components';
}

declare module 'astro:schema' {
	export * from 'astro/zod';
}

type MD = import('./dist/types/public/content.js').MarkdownInstance<Record<string, any>>;

interface ExportedMarkdownModuleEntities {
	frontmatter: MD['frontmatter'];
	file: MD['file'];
	url: MD['url'];
	getHeadings: MD['getHeadings'];
	Content: MD['Content'];
	rawContent: MD['rawContent'];
	compiledContent: MD['compiledContent'];
	load: MD['default'];
}

declare module '*.md' {
	const { load }: ExportedMarkdownModuleEntities;
	export const {
		frontmatter,
		file,
		url,
		getHeadings,
		Content,
		rawContent,
		compiledContent,
	}: ExportedMarkdownModuleEntities;
	export default load;
}

declare module '*.markdown' {
	const { load }: ExportedMarkdownModuleEntities;
	export const {
		frontmatter,
		file,
		url,
		getHeadings,
		Content,
		rawContent,
		compiledContent,
	}: ExportedMarkdownModuleEntities;
	export default load;
}

declare module '*.mkdn' {
	const { load }: ExportedMarkdownModuleEntities;
	export const {
		frontmatter,
		file,
		url,
		getHeadings,
		Content,
		rawContent,
		compiledContent,
	}: ExportedMarkdownModuleEntities;
	export default load;
}

declare module '*.mkd' {
	const { load }: ExportedMarkdownModuleEntities;
	export const {
		frontmatter,
		file,
		url,
		getHeadings,
		Content,
		rawContent,
		compiledContent,
	}: ExportedMarkdownModuleEntities;
	export default load;
}

declare module '*.mdwn' {
	const { load }: ExportedMarkdownModuleEntities;
	export const {
		frontmatter,
		file,
		url,
		getHeadings,
		Content,
		rawContent,
		compiledContent,
	}: ExportedMarkdownModuleEntities;
	export default load;
}

declare module '*.mdown' {
	const { load }: ExportedMarkdownModuleEntities;
	export const {
		frontmatter,
		file,
		url,
		getHeadings,
		Content,
		rawContent,
		compiledContent,
	}: ExportedMarkdownModuleEntities;
	export default load;
}

declare module '*.mdx' {
	type MDX = import('./dist/types/public/content.js').MDXInstance<Record<string, any>>;

	export const frontmatter: MDX['frontmatter'];
	export const file: MDX['file'];
	export const url: MDX['url'];
	export const getHeadings: MDX['getHeadings'];
	export const Content: MDX['Content'];
	export const components: MDX['components'];

	const load: MDX['default'];
	export default load;
}

declare module 'astro:ssr-manifest' {
	export const manifest: import('./dist/types/public/internal.js').SSRManifest;
}

// Everything below are Vite's types (apart from image types, which are in `client.d.ts`)

// CSS modules
type CSSModuleClasses = { readonly [key: string]: string };

declare module '*.module.css' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.scss' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.sass' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.less' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.styl' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.stylus' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.pcss' {
	const classes: CSSModuleClasses;
	export default classes;
}
declare module '*.module.sss' {
	const classes: CSSModuleClasses;
	export default classes;
}

// CSS
declare module '*.css' {
	const css: string;
	export default css;
}
declare module '*.scss' {
	const css: string;
	export default css;
}
declare module '*.sass' {
	const css: string;
	export default css;
}
declare module '*.less' {
	const css: string;
	export default css;
}
declare module '*.styl' {
	const css: string;
	export default css;
}
declare module '*.stylus' {
	const css: string;
	export default css;
}
declare module '*.pcss' {
	const css: string;
	export default css;
}
declare module '*.sss' {
	const css: string;
	export default css;
}

// Built-in asset types
// see `src/node/constants.ts`

// images
declare module '*.jfif' {
	const src: string;
	export default src;
}
declare module '*.pjpeg' {
	const src: string;
	export default src;
}
declare module '*.pjp' {
	const src: string;
	export default src;
}
declare module '*.ico' {
	const src: string;
	export default src;
}

// media
declare module '*.mp4' {
	const src: string;
	export default src;
}
declare module '*.webm' {
	const src: string;
	export default src;
}
declare module '*.ogg' {
	const src: string;
	export default src;
}
declare module '*.mp3' {
	const src: string;
	export default src;
}
declare module '*.wav' {
	const src: string;
	export default src;
}
declare module '*.flac' {
	const src: string;
	export default src;
}
declare module '*.aac' {
	const src: string;
	export default src;
}

declare module '*.opus' {
	const src: string;
	export default src;
}

// fonts
declare module '*.woff' {
	const src: string;
	export default src;
}
declare module '*.woff2' {
	const src: string;
	export default src;
}
declare module '*.eot' {
	const src: string;
	export default src;
}
declare module '*.ttf' {
	const src: string;
	export default src;
}
declare module '*.otf' {
	const src: string;
	export default src;
}

// other
declare module '*.webmanifest' {
	const src: string;
	export default src;
}
declare module '*.pdf' {
	const src: string;
	export default src;
}
declare module '*.txt' {
	const src: string;
	export default src;
}

// wasm?init
declare module '*.wasm?init' {
	const initWasm: (options: WebAssembly.Imports) => Promise<WebAssembly.Instance>;
	export default initWasm;
}

// web worker
declare module '*?worker' {
	const workerConstructor: {
		new (): Worker;
	};
	export default workerConstructor;
}

declare module '*?worker&inline' {
	const workerConstructor: {
		new (): Worker;
	};
	export default workerConstructor;
}

declare module '*?worker&url' {
	const src: string;
	export default src;
}

declare module '*?sharedworker' {
	const sharedWorkerConstructor: {
		new (): SharedWorker;
	};
	export default sharedWorkerConstructor;
}

declare module '*?sharedworker&inline' {
	const sharedWorkerConstructor: {
		new (): SharedWorker;
	};
	export default sharedWorkerConstructor;
}

declare module '*?sharedworker&url' {
	const src: string;
	export default src;
}

declare module '*?raw' {
	const src: string;
	export default src;
}

declare module '*?url' {
	const src: string;
	export default src;
}

declare module '*?inline' {
	const src: string;
	export default src;
}

declare module '*?url&inline' {
	const src: string;
	export default src;
}

declare module '*?url&no-inline' {
	const src: string;
	export default src;
}
