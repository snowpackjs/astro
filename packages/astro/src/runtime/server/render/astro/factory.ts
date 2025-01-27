import type { PropagationHint, SSRResult } from '../../../../types/public/internal.js';
import type { HeadAndContent } from './head-and-content.js';
import type { RenderTemplateResult } from './render-template.js';

export type AstroFactoryReturnValue = RenderTemplateResult | Response | HeadAndContent;

// The callback passed to to $$createComponent
export interface AstroComponentFactory {
	(result: any, props: any, slots: any): AstroFactoryReturnValue | Promise<AstroFactoryReturnValue>;
	isAstroComponentFactory?: boolean;
	moduleId?: string | undefined;
	propagation?: PropagationHint;
}

export function isAstroComponentFactory(obj: any): obj is AstroComponentFactory {
	return obj == null ? false : obj.isAstroComponentFactory === true;
}

export function isAPropagatingComponent(
	result: SSRResult,
	factory: AstroComponentFactory,
): boolean {
	let hint: PropagationHint = factory.propagation || 'none';
	if (factory.moduleId && result.componentMetadata.has(factory.moduleId) && hint === 'none') {
		hint = result.componentMetadata.get(factory.moduleId)!.propagation;
	}
	return hint === 'in-tree' || hint === 'self';
}
