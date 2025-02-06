import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('jsx-runtime', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/jsx/',
		});
		await fixture.build();
	});

	it('Can load simple JSX components', async () => {
		const html = await fixture.readFile('/component/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#basic').text(), 'Basic');
		assert.equal($('#named').text(), 'Named');
	});

	it('Can load Preact component inside Astro', async () => {
		const html = await fixture.readFile('/frameworks/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#has-preact #preact').length, 0);
		assert.equal($('#preact').text().includes('Preact'), true);
	});

	it('Can load React component inside Astro', async () => {
		const html = await fixture.readFile('/frameworks/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#has-react #react').length, 0);
		assert.equal($('#react').text().includes('React'), true);
	});

	it('Can load Solid component inside Astro', async () => {
		const html = await fixture.readFile('/frameworks/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#has-solid #solid').length, 0);
		assert.equal($('#solid').text().includes('Solid'), true);
	});

	it('Can load Svelte component inside Astro', async () => {
		const html = await fixture.readFile('/frameworks/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#has-svelte #svelte').length, 0);
		assert.equal($('#svelte').text().includes('Svelte'), true);
	});

	it('Can load Vue component inside Astro', async () => {
		const html = await fixture.readFile('/frameworks/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#has-vue #vue').length, 0);
		assert.equal($('#vue').text().includes('Vue'), true);
	});

	it('Can load MDX component inside Astro', async () => {
		const html = await fixture.readFile('/frameworks/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#mdx-wrapper #hello-world').length, 1, 'md content rendered');
		assert.equal($('#mdx-wrapper #react').length, 1, 'React component rendered');
	});
});
