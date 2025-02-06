import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Hoisted Imports', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/hoisted-imports/',
		});
	});

	async function getAllScriptText(page) {
		const html = await fixture.readFile(page);
		const $ = cheerio.load(html);
		return $('script')
			.map((_, el) => $(el).text())
			.toArray()
			.join('\n');
	}

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		function expectScript(scripts, letter) {
			const regex = new RegExp(`console.log\\(['"]${letter}['"]\\)`);
			assert.match(scripts, regex, 'missing component ' + letter);
		}
		function expectNotScript(scripts, letter) {
			const regex = new RegExp(`console.log\\(['"]${letter}['"]\\)`);
			assert.doesNotMatch(scripts, regex, "shouldn't include component " + letter);
		}

		it('includes all imported scripts', async () => {
			const scripts = await getAllScriptText('/all/index.html');
			expectScript(scripts, 'A');
			expectScript(scripts, 'B');
			expectScript(scripts, 'C');
			expectScript(scripts, 'D');
			expectScript(scripts, 'E');
		});

		it('includes no scripts when none imported', async () => {
			const scripts = await getAllScriptText('/none/index.html');
			expectNotScript(scripts, 'A');
			expectNotScript(scripts, 'B');
			expectNotScript(scripts, 'C');
			expectNotScript(scripts, 'D');
			expectNotScript(scripts, 'E');
		});

		it('includes some scripts', async () => {
			const scripts = await getAllScriptText('/some/index.html');
			expectScript(scripts, 'A');
			expectNotScript(scripts, 'B');
			expectScript(scripts, 'C');
			expectNotScript(scripts, 'D');
			expectNotScript(scripts, 'E');
		});

		it('deduplicates already rendered scripts', async () => {
			const scripts = await getAllScriptText('/dedupe/index.html');
			expectScript(scripts, 'A');

			const html = await fixture.readFile('/dedupe/index.html');
			const $ = cheerio.load(html);
			assert.equal($('script').length, 1);
		});

		it('does not inline if script is larger than vite.assetInlineLimit: 100', async () => {
			const html = await fixture.readFile('/no-inline/index.html');
			const $ = cheerio.load(html);
			const scripts = $('script');
			assert.equal(scripts.length, 1);
			assert.ok(scripts[0].attribs.src);
		});

		it('does not inline if script it has shared chunks', async () => {
			const html = await fixture.readFile('/no-inline-if-shared/index.html');
			const $ = cheerio.load(html);
			const scripts = $('script');
			assert.equal(scripts.length, 2);
			assert.ok(scripts[0].attribs.src);
			assert.ok(scripts[1].attribs.src);
		});

		it('renders styles if imported from the script', async () => {
			const html = await fixture.readFile('/script-import-style/index.html');
			const $ = cheerio.load(html);
			const styles = $('style');
			assert.equal(styles.length, 1);
			// There should be no script because it's empty (contains only CSS import)
			const scripts = $('scripts');
			assert.equal(scripts.length, 0);
		});
	});
});
