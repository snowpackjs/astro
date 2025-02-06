import { svelte2tsx } from 'svelte2tsx';

export function toTSX(code: string, className: string): string {
	let result = `
		let ${className}__AstroComponent_: Error
		export default ${className}__AstroComponent_
	`;

	try {
		let tsx = svelte2tsx(code, { mode: 'ts' }).code;
		tsx = '/// <reference types="svelte2tsx/svelte-shims" />\n' + tsx;
		result = tsx.replace(
			'export default class extends __sveltets_2_createSvelte2TsxComponent(',
			`export default function ${className}__AstroComponent_(_props: typeof Component.props): any {}\nlet Component = `,
		);
	} catch {
		return result;
	}

	return result;
}
