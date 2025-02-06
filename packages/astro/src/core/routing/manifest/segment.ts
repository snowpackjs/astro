export function validateSegment(segment: string, file = '') {
	if (!file) file = segment;

	if (segment.includes('][')) {
		throw new Error(`Invalid route ${file} \u2014 parameters must be separated`);
	}
	if (countOccurrences('[', segment) !== countOccurrences(']', segment)) {
		throw new Error(`Invalid route ${file} \u2014 brackets are unbalanced`);
	}
	if (
		(/.+\[\.\.\.[^\]]+\]/.test(segment) || /\[\.\.\.[^\]]+\].+/.test(segment)) &&
		file.endsWith('.astro')
	) {
		throw new Error(`Invalid route ${file} \u2014 rest parameter must be a standalone segment`);
	}
}

function countOccurrences(needle: string, haystack: string) {
	let count = 0;
	for (const hay of haystack) {
		if (hay === needle) count += 1;
	}
	return count;
}
