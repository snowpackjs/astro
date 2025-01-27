import type { RenderTemplateResult } from './render-template.js';

const headAndContentSym = Symbol.for('astro.headAndContent');

export type HeadAndContent = {
	[headAndContentSym]: true;
	head: string;
	content: RenderTemplateResult;
};

export function isHeadAndContent(obj: unknown): obj is HeadAndContent {
	return typeof obj === 'object' && obj !== null && !!(obj as any)[headAndContentSym];
}

export function createHeadAndContent(head: string, content: RenderTemplateResult): HeadAndContent {
	return {
		[headAndContentSym]: true,
		head,
		content,
	};
}
