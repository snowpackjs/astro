import type { OmitPreservingIndexSignature, Simplify, WithRequired } from '../type-utils.js';
import type { VALID_INPUT_FORMATS, VALID_OUTPUT_FORMATS } from './consts.js';
import type { ImageService } from './services/service.js';

export type ImageQualityPreset = 'low' | 'mid' | 'high' | 'max' | (string & {});
export type ImageQuality = ImageQualityPreset | number;
export type ImageInputFormat = (typeof VALID_INPUT_FORMATS)[number];
export type ImageOutputFormat = (typeof VALID_OUTPUT_FORMATS)[number] | (string & {});
export type ImageLayout = 'responsive' | 'fixed' | 'full-width' | 'none';
export type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | (string & {});

export type AssetsGlobalStaticImagesList = Map<
	string,
	{
		originalSrcPath: string | undefined;
		transforms: Map<string, { finalPath: string; transform: ImageTransform }>;
	}
>;

declare global {
	// eslint-disable-next-line no-var
	var astroAsset: {
		imageService?: ImageService;
		addStaticImage?:
			| ((options: ImageTransform, hashProperties: string[], fsPath: string | undefined) => string)
			| undefined;
		staticImages?: AssetsGlobalStaticImagesList;
		referencedImages?: Set<string>;
	};
}

const isESMImport = Symbol('#isESM');

export type OmitBrand<T> = Omit<T, typeof isESMImport>;

/**
 * Type returned by ESM imports of images
 */
export type ImageMetadata = {
	src: string;
	width: number;
	height: number;
	format: ImageInputFormat;
	orientation?: number;
	/** @internal */
	fsPath: string;
	[isESMImport]?: true;
};

export function isImageMetadata(src: any): src is ImageMetadata {
	// For ESM-imported images the fsPath property is set but not enumerable
	return src.fsPath && !('fsPath' in src);
}

/**
 * A yet to be completed with an url `SrcSetValue`. Other hooks will only see a resolved value, where the URL of the image has been added.
 */
export type UnresolvedSrcSetValue = {
	transform: ImageTransform;
	descriptor?: string;
	attributes?: Record<string, any>;
};

export type SrcSetValue = UnresolvedSrcSetValue & {
	url: string;
};

/**
 * A yet to be resolved image transform. Used by `getImage`
 */
export type UnresolvedImageTransform = Simplify<
	OmitPreservingIndexSignature<ImageTransform, 'src'> & {
		src: ImageMetadata | string | Promise<{ default: ImageMetadata }>;
		inferSize?: boolean;
	}
> & {
	[isESMImport]?: never;
};

/**
 * Options accepted by the image transformation service.
 */
export type ImageTransform = {
	src: ImageMetadata | string;
	width?: number | undefined;
	widths?: number[] | undefined;
	densities?: (number | `${number}x`)[] | undefined;
	height?: number | undefined;
	quality?: ImageQuality | undefined;
	format?: ImageOutputFormat | undefined;
	fit?: ImageFit | undefined;
	position?: string | undefined;
	[key: string]: any;
};

export interface GetImageResult {
	rawOptions: ImageTransform;
	options: ImageTransform;
	src: string;
	srcSet: {
		values: SrcSetValue[];
		attribute: string;
	};
	attributes: Record<string, any>;
}

type ImageSharedProps<T> = T & {
	/**
	 * Width of the image, the value of this property will be used to assign the `width` property on the final `img` element.
	 *
	 * This value will additionally be used to resize the image to the desired width, taking into account the original aspect ratio of the image.
	 *
	 * **Example**:
	 * ```astro
	 * <Image src={...} width={300} alt="..." />
	 * ```
	 * **Result**:
	 * ```html
	 * <img src="..." width="300" height="..." alt="..." />
	 * ```
	 */
	width?: number | `${number}`;
	/**
	 * Height of the image, the value of this property will be used to assign the `height` property on the final `img` element.
	 *
	 * For local images, if `width` is not present, this value will additionally be used to resize the image to the desired height, taking into account the original aspect ratio of the image.
	 *
	 * **Example**:
	 * ```astro
	 * <Image src={...} height={300} alt="..." />
	 * ```
	 * **Result**:
	 * ```html
	 * <img src="..." height="300" width="..." alt="..." />
	 * ```
	 */
	height?: number | `${number}`;
	/**
	 * Desired output format for the image. Defaults to `webp`.
	 *
	 * **Example**:
	 * ```astro
	 * <Image src={...} format="avif" alt="..." />
	 * ```
	 */
	format?: ImageOutputFormat;
	/**
	 * Desired quality for the image. Value can either be a preset such as `low` or `high`, or a numeric value from 0 to 100.
	 *
	 * The perceptual quality of the output image is service-specific.
	 * For instance, a certain service might decide that `high` results in a very beautiful image, but another could choose for it to be at best passable.
	 *
	 * **Example**:
	 * ```astro
	 * <Image src={...} quality='high' alt="..." />
	 * <Image src={...} quality={300} alt="..." />
	 * ```
	 */
	quality?: ImageQuality;
} & (
		| {
				/**
				 * The layout type for responsive images. Requires the `experimental.responsiveImages` flag to be enabled in the Astro config.
				 *
				 * Allowed values are `responsive`, `fixed`, `full-width` or `none`. Defaults to value of `image.experimentalLayout`.
				 *
				 * - `responsive` - The image will scale to fit the container, maintaining its aspect ratio, but will not exceed the specified dimensions.
				 * - `fixed` - The image will maintain its original dimensions.
				 * - `full-width` - The image will scale to fit the container, maintaining its aspect ratio, even if that means the image will exceed its original dimensions.
				 *
				 * **Example**:
				 * ```astro
				 * <Image src={...} layout="responsive" alt="..." />
				 * ```
				 */

				layout?: ImageLayout;

				/**
				 * Defines how the image should be cropped if the aspect ratio is changed. Requires the `experimental.responsiveImages` flag to be enabled in the Astro config.
				 *
				 * Default is `cover`. Allowed values are `fill`, `contain`, `cover`, `none` or `scale-down`. These behave like the equivalent CSS `object-fit` values. Other values may be passed if supported by the image service.
				 *
				 * **Example**:
				 * ```astro
				 * <Image src={...} fit="contain" alt="..." />
				 * ```
				 */

				fit?: ImageFit;

				/**
				 * Defines the position of the image when cropping. Requires the `experimental.responsiveImages` flag to be enabled in the Astro config.
				 *
				 * The value is a string that specifies the position of the image, which matches the CSS `object-position` property. Other values may be passed if supported by the image service.
				 *
				 * **Example**:
				 * ```astro
				 * <Image src={...} position="center top" alt="..." />
				 * ```
				 */

				position?: string;
				/**
				 * If true, the image will be loaded with a higher priority. This can be useful for images that are visible above the fold. There should usually be only one image with `priority` set to `true` per page.
				 * All other images will be lazy-loaded according to when they are in the viewport.
				 * **Example**:
				 * ```astro
				 * <Image src={...} priority alt="..." />
				 * ```
				 */
				priority?: boolean;

				/**
				 * A list of widths to generate images for. The value of this property will be used to assign the `srcset` property on the final `img` element.
				 *
				 * This attribute is incompatible with `densities`.
				 */
				widths?: number[];
				densities?: never;
		  }
		| {
				/**
				 * A list of pixel densities to generate images for. The value of this property will be used to assign the `srcset` property on the final `img` element.
				 *
				 * This attribute is incompatible with `widths`.
				 */
				densities?: (number | `${number}x`)[];
				widths?: never;
				layout?: never;
				fit?: never;
				position?: never;
		  }
	);

export type LocalImageProps<T> = ImageSharedProps<T> & {
	/**
	 * A reference to a local image imported through an ESM import.
	 *
	 * **Example**:
	 * ```js
	 * import myImage from "../assets/my_image.png";
	 * ```
	 * And then refer to the image, like so:
	 * ```astro
	 *	<Image src={myImage} alt="..."></Image>
	 * ```
	 */
	src: ImageMetadata | Promise<{ default: ImageMetadata }>;
};

export type RemoteImageProps<T> =
	| (ImageSharedProps<T> & {
			/**
			 * URL of a remote image. Can start with a protocol (ex: `https://`) or alternatively `/`, or `Astro.url`, for images in the `public` folder
			 *
			 * Remote images are not optimized, and require both `width` and `height` to be set.
			 *
			 * **Example**:
			 * ```
			 * <Image src="https://example.com/image.png" width={450} height={300} alt="..." />
			 * ```
			 */
			src: string;
			/**
			 * When inferSize is true width and height are not required
			 */
			inferSize: true;
	  })
	| (WithRequired<ImageSharedProps<T>, 'width' | 'height'> & {
			/**
			 * URL of a remote image. Can start with a protocol (ex: `https://`) or alternatively `/`, or `Astro.url`, for images in the `public` folder
			 *
			 * Remote images are not optimized, and require both `width` and `height` to be set.
			 *
			 * **Example**:
			 * ```
			 * <Image src="https://example.com/image.png" width={450} height={300} alt="..." />
			 * ```
			 */
			src: string;
			/**
			 * When inferSize is false or undefined width and height are required
			 */
			inferSize?: false | undefined;
	  });
