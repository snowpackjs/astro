import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Component children', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-children/' });
		await fixture.build();
	});

	it('Passes string children to framework components', async () => {
		const html = await fixture.readFile('/strings/index.html');
		const $ = cheerio.load(html);

		// test 1: Can pass text to Preact components
		const $preact = $('#preact');
		assert.equal($preact.text().trim(), 'Hello world');

		// test 2: Can pass text to Vue components
		const $vue = $('#vue');
		assert.equal($vue.text().trim(), 'Hello world');

		// test 3: Can pass text to Svelte components
		const $svelte = $('#svelte');
		assert.equal($svelte.text().trim(), 'Hello world');
	});

	it('Passes markup children to framework components', async () => {
		const html = await fixture.readFile('/markup/index.html');
		const $ = cheerio.load(html);

		// test 1: Can pass markup to Preact components
		const $preact = $('#preact h1');
		assert.equal($preact.text().trim(), 'Hello world');

		// test 2: Can pass markup to Vue components
		const $vue = $('#vue h1');
		assert.equal($vue.text().trim(), 'Hello world');

		// test 3: Can pass markup to Svelte components
		const $svelte = $('#svelte h1');
		assert.equal($svelte.text().trim(), 'Hello world');
	});

	it('Passes multiple children to framework components', async () => {
		const html = await fixture.readFile('/multiple/index.html');
		const $ = cheerio.load(html);

		// test 1: Can pass multiple children to Preact components
		const $preact = $('#preact');
		assert.equal($preact.children().length, 2);
		assert.equal($preact.children(':first-child').text().trim(), 'Hello world');
		assert.equal($preact.children(':last-child').text().trim(), 'Goodbye world');

		// test 2: Can pass multiple children to Vue components
		const $vue = $('#vue');
		assert.equal($vue.children().length, 2);
		assert.equal($vue.children(':first-child').text().trim(), 'Hello world');
		assert.equal($vue.children(':last-child').text().trim(), 'Goodbye world');

		// test 3: Can pass multiple children to Svelte components
		const $svelte = $('#svelte');
		assert.equal($svelte.children().length, 2);
		assert.equal($svelte.children(':first-child').text().trim(), 'Hello world');
		assert.equal($svelte.children(':last-child').text().trim(), 'Goodbye world');
	});

	it('Renders a template when children are not rendered for client components', async () => {
		const html = await fixture.readFile('/no-render/index.html');
		const $ = cheerio.load(html);

		// test 1: If SSR only, no children are rendered.
		assert.equal($('#ssr-only').children().length, 0);

		// test 2: If client, and no children are rendered, a template is.
		assert.equal(
			$('#client').parent().children().length,
			2,
			'rendered the client component and a template',
		);
		assert.equal(
			$('#client').parent().find('template[data-astro-template]').length,
			1,
			'Found 1 template',
		);

		// test 3: If client, and children are rendered, no template is.
		assert.equal($('#client-render').parent().children().length, 1);
		assert.equal($('#client-render').parent().find('template').length, 0);

		// test 4: If client and no children are provided, no template is.
		assert.equal($('#client-no-children').parent().children().length, 1);
		assert.equal($('#client-no-children').parent().find('template').length, 0);
	});
});
