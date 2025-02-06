import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Slots: Solid', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/slots-solid/' });
		await fixture.build();
	});

	it('Renders default slot', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#default-self-closing').text().trim(), 'Fallback');
		assert.equal($('#default-empty').text().trim(), 'Fallback');
		assert.equal($('#zero').text().trim(), '0');
		assert.equal($('#false').text().trim(), '');
		assert.equal($('#string').text().trim(), '');
		assert.equal($('#content').text().trim(), 'Hello world!');
	});

	it('Renders named slot', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#named').text().trim(), 'Fallback / Named');
	});

	it('Converts dash-case slot to camelCase', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#dash-case').text().trim(), 'Fallback / Dash Case');
	});

	describe('For MDX Pages', () => {
		it('Renders default slot', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#content').text().trim(), 'Hello world!');
		});

		it('Renders named slot', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#named').text().trim(), 'Fallback / Named');
		});

		it('Converts dash-case slot to camelCase', async () => {
			const html = await fixture.readFile('/mdx/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#dash-case').text().trim(), 'Fallback / Dash Case');
		});
	});
});
