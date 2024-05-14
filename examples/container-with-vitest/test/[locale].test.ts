import { unstable_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Locale from '../src/pages/[locale].astro';

test('Dynamic route', async () => {
	const container = await AstroContainer.create();
	const result = await container.renderToString(Locale, {
		params: {
			"locale": 'en'
		},
		request: new Request('http://example.com/en'),
		route: '/[locale]',
	});

	expect(result).toContain('Locale: en');
});
