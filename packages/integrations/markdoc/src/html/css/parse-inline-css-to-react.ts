import { styleToObject } from './style-to-object.js';

export function parseInlineCSSToReactLikeObject(
	css: string | undefined | null,
): React.CSSProperties | undefined {
	if (typeof css === 'string') {
		const cssObject: Record<string, string> = {};
		styleToObject(css, (originalCssDirective: string, value: string) => {
			const reactCssDirective = convertCssDirectiveNameToReactCamelCase(originalCssDirective);
			cssObject[reactCssDirective] = value;
		});
		return cssObject;
	}

	return undefined;
}

function convertCssDirectiveNameToReactCamelCase(original: string): string {
	// capture group 1 is the character to capitalize, the hyphen is omitted by virtue of being outside the capture group
	const replaced = original.replace(/-([a-z\d])/gi, (_match, char) => {
		return char.toUpperCase();
	});
	return replaced;
}
