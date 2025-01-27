/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { AstroClientDirectives } from './elements.js';
import type { BaseIntegrationHooks } from './integrations.js';

// The interfaces in this file can be extended by users
declare global {
	namespace App {
		/**
		 * Used by middlewares to store information, that can be read by the user via the global `Astro.locals`
		 */
		export interface Locals {}
	}

	namespace Astro {
		export interface IntegrationHooks extends BaseIntegrationHooks {}
		export interface ClientDirectives extends AstroClientDirectives {}
	}
}

export {};
