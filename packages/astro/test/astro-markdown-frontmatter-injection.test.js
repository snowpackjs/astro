import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

const FIXTURE_ROOT = './fixtures/astro-markdown-frontmatter-injection/';

describe('Astro Markdown - frontmatter injection', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: FIXTURE_ROOT,
		});
		await fixture.build();
	});

	it('remark supports custom vfile data - get title', async () => {
		const frontmatterByPage = JSON.parse(await fixture.readFile('/glob.json'));
		const titles = frontmatterByPage.map((frontmatter = {}) => frontmatter.title);
		assert.ok(titles.includes('Page 1'));
		assert.ok(titles.includes('Page 2'));
	});

	it('rehype supports custom vfile data - reading time', async () => {
		const frontmatterByPage = JSON.parse(await fixture.readFile('/glob.json'));
		const readingTimes = frontmatterByPage.map(
			(frontmatter = {}) => frontmatter.injectedReadingTime,
		);
		assert.ok(readingTimes.length > 0);
		for (let readingTime of readingTimes) {
			assert.notEqual(readingTime, null);
			assert.match(readingTime.text, /^\d+ min read/);
		}
	});

	it('allow user frontmatter mutation', async () => {
		const frontmatterByPage = JSON.parse(await fixture.readFile('/glob.json'));
		const descriptions = frontmatterByPage.map((frontmatter = {}) => frontmatter.description);
		assert.ok(descriptions.includes('Processed by remarkDescription plugin: Page 1 description'));
		assert.ok(descriptions.includes('Processed by remarkDescription plugin: Page 2 description'));
	});
});
