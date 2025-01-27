import { parse } from '@vue/compiler-sfc';

export function toTSX(code: string, className: string): string {
	let result = `export default function ${className}__AstroComponent_(_props: Record<string, any>): any {}`;

	// NOTE: As you can expect, using regexes for this is not exactly the most reliable way of doing things
	// However, I couldn't figure out a way to do it using Vue's compiler, I tried looking at how Volar does it, but I
	// didn't really understand everything happening there and it seemed to be pretty Volar-specific. I do believe
	// someone more knowledgeable on Vue's internals could figure it out, but since this solution is good enough for most
	// Vue components (and it's an improvement over, well, nothing), it's alright, I think
	try {
		const parsedResult = parse(code);

		if (parsedResult.errors.length > 0) {
			return `
				let ${className}__AstroComponent_: Error
				export default ${className}__AstroComponent_
			`;
		}

		// Vue supports 2 type of script blocks: setup and non-setup
		const regularScriptBlockContent = parsedResult.descriptor.script?.content ?? '';
		const { scriptSetup } = parsedResult.descriptor;

		if (scriptSetup) {
			const codeWithoutComments = scriptSetup.content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
			const definePropsType = /defineProps<([\s\S]+?)>\s?\(\)/.exec(codeWithoutComments);
			const propsGeneric = scriptSetup.attrs.generic;
			const propsGenericType = propsGeneric ? `<${propsGeneric}>` : '';

			if (definePropsType) {
				result = `
						${regularScriptBlockContent}
						${scriptSetup.content}

						export default function ${className}__AstroComponent_${propsGenericType}(_props: ${definePropsType[1]}): any {
							<div></div>
						}
				`;
			} else {
				// TODO. Find a way to support generics when using defineProps without passing explicit types.
				// Right now something like this `defineProps({ prop: { type: Array as PropType<T[]> } })`
				//  won't be correctly typed in Astro.
				const defineProps = /defineProps\([\s\S]+?\)/.exec(codeWithoutComments);
				if (defineProps) {
					result = `
					import { defineProps } from 'vue';

					${regularScriptBlockContent}

					const Props = ${defineProps[0]}

					export default function ${className}__AstroComponent_${propsGenericType}(_props: typeof Props): any {
						<div></div>
					}
				`;
				}
			}
		}
	} catch {
		return result;
	}

	return result;
}
