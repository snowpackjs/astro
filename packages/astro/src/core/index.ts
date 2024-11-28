// This is the main entrypoint when importing the `astro` package.

import type { AstroInlineConfig } from '../@types/astro.js';
import { default as _sync } from './sync/index.js';

export { default as build } from './build/index.js';
export { default as dev } from './dev/index.js';
export { default as preview } from './preview/index.js';

/**
 * Generates TypeScript types for all Astro modules. This sets up a `src/env.d.ts` file for type inferencing,
 * and defines the `astro:content` module for the Content Collections API.
 *
 * @experimental The JavaScript API is experimental
 */
// Wrap `_sync` to prevent exposing internal options
export const sync = (inlineConfig: AstroInlineConfig) => _sync(inlineConfig);
