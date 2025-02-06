import type { ComponentInstance } from '../../types/astro.js';
import type { RouteData } from '../../types/public/internal.js';
import type { Pipeline } from '../base-pipeline.js';
export { Pipeline } from '../base-pipeline.js';
export { getParams, getProps } from './params-and-props.js';
export { loadRenderer } from './renderer.js';
export { Slots } from './slots.js';

export interface SSROptions {
	/** The pipeline instance */
	pipeline: Pipeline;
	/** location of file on disk */
	filePath: URL;
	/** the web request (needed for dynamic routes) */
	pathname: string;
	/** The runtime component instance */
	preload: ComponentInstance;
	/** Request */
	request: Request;
	/** optional, in case we need to render something outside a dev server */
	route: RouteData;
}
