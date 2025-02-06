import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Locale from '../src/pages/[locale].astro';

test('Dynamic route', async () => {
	const container = await AstroContainer.create();
	// @ts-ignore
	const result = await container.renderToString(Locale, {
		params: {
			locale: 'en',
		},
		request: new Request('http://example.com/en'),
	});

	expect(result).toContain('Locale: en');
});
