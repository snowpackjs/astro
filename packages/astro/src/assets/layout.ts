import type { ImageLayout } from './types.js';

// Common screen widths. These will be filtered according to the image size and layout
export const DEFAULT_RESOLUTIONS = [
	640, // older and lower-end phones
	750, // iPhone 6-8
	828, // iPhone XR/11
	960, // older horizontal phones
	1080, // iPhone 6-8 Plus
	1280, // 720p
	1668, // Various iPads
	1920, // 1080p
	2048, // QXGA
	2560, // WQXGA
	3200, // QHD+
	3840, // 4K
	4480, // 4.5K
	5120, // 5K
	6016, // 6K
];

// A more limited set of screen widths, for statically generated images
export const LIMITED_RESOLUTIONS = [
	640, // older and lower-end phones
	750, // iPhone 6-8
	828, // iPhone XR/11
	1080, // iPhone 6-8 Plus
	1280, // 720p
	1668, // Various iPads
	2048, // QXGA
	2560, // WQXGA
];

/**
 * Gets the breakpoints for an image, based on the layout and width
 *
 * The rules are as follows:
 *
 * - For full-width layout we return all breakpoints smaller than the original image width
 * - For fixed layout we return 1x and 2x the requested width, unless the original image is smaller than that.
 * - For responsive layout we return all breakpoints smaller than 2x the requested width, unless the original image is smaller than that.
 */
export const getWidths = ({
	width,
	layout,
	breakpoints = DEFAULT_RESOLUTIONS,
	originalWidth,
}: {
	width?: number;
	layout: ImageLayout;
	breakpoints?: Array<number>;
	originalWidth?: number;
}): Array<number> => {
	const smallerThanOriginal = (w: number) => !originalWidth || w <= originalWidth;

	// For full-width layout we return all breakpoints smaller than the original image width
	if (layout === 'full-width') {
		return breakpoints.filter(smallerThanOriginal);
	}
	// For other layouts we need a width to generate breakpoints. If no width is provided, we return an empty array
	if (!width) {
		return [];
	}
	const doubleWidth = width * 2;
	// For fixed layout we want to return the 1x and 2x widths. We only do this if the original image is large enough to do this though.
	const maxSize = originalWidth ? Math.min(doubleWidth, originalWidth) : doubleWidth;
	if (layout === 'fixed') {
		return originalWidth && width > originalWidth ? [originalWidth] : [width, maxSize];
	}

	// For responsive layout we want to return all breakpoints smaller than 2x requested width.
	if (layout === 'responsive') {
		return (
			[
				// Always include the image at 1x and 2x the specified width
				width,
				doubleWidth,
				...breakpoints,
			]
				// Filter out any resolutions that are larger than the double-resolution image or source image
				.filter((w) => w <= maxSize)
				// Sort the resolutions in ascending order
				.sort((a, b) => a - b)
		);
	}

	return [];
};

/**
 * Gets the `sizes` attribute for an image, based on the layout and width
 */
export const getSizesAttribute = ({
	width,
	layout,
}: { width?: number; layout?: ImageLayout }): string | undefined => {
	if (!width || !layout) {
		return undefined;
	}
	switch (layout) {
		// If screen is wider than the max size then image width is the max size,
		// otherwise it's the width of the screen
		case `responsive`:
			return `(min-width: ${width}px) ${width}px, 100vw`;

		// Image is always the same width, whatever the size of the screen
		case `fixed`:
			return `${width}px`;

		// Image is always the width of the screen
		case `full-width`:
			return `100vw`;

		case 'none':
		default:
			return undefined;
	}
};
