import type { Integration } from '../astro.js';

function randomFromArray<T>(list: T[]) {
	return list[Math.floor(Math.random() * list.length)];
}

const categoryIcons = new Map(
	Object.entries({
		frameworks: ['puzzle', 'grid'],
		adapters: ['puzzle', 'grid', 'compress'],
		'css+ui': ['compress', 'grid', 'image', 'resizeImage', 'puzzle'],
		'performance+seo': ['approveUser', 'checkCircle', 'compress', 'robot', 'searchFile', 'sitemap'],
		analytics: ['checkCircle', 'compress', 'searchFile'],
		accessibility: ['approveUser', 'checkCircle'],
		other: ['checkCircle', 'grid', 'puzzle', 'sitemap'],
	}),
);

export function iconForIntegration(integration: Integration) {
	const icons = integration.categories
		.filter((category: string) => categoryIcons.has(category))
		.map((category: string) => categoryIcons.get(category)!)
		.flat();

	return randomFromArray(icons);
}

const iconColors = [
	'#BC52EE',
	'#6D6AF0',
	'#52EEBD',
	'#52B7EE',
	'#52EE55',
	'#B7EE52',
	'#EEBD52',
	'#EE5552',
	'#EE52B7',
	'#858B98',
];

export function colorForIntegration() {
	return randomFromArray(iconColors);
}
