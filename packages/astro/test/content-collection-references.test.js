import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { fixLineEndings, loadFixture } from './test-utils.js';

describe('Content Collections - references', () => {
	let fixture;
	let devServer;
	before(async () => {
		fixture = await loadFixture({ root: './fixtures/content-collection-references/' });
	});

	const modes = ['dev', 'prod'];

	for (const mode of modes) {
		describe(mode, () => {
			before(async () => {
				if (mode === 'prod') {
					await fixture.build({ force: true });
				} else if (mode === 'dev') {
					devServer = await fixture.startDevServer({ force: true });
					await fixture.onNextDataStoreChange(1000).catch(() => {
						// Ignore timeout, because it may have saved before we get here.
					});
				}
			});

			after(async () => {
				if (mode === 'dev') devServer?.stop();
			});

			describe(`JSON result`, () => {
				let json;
				before(async () => {
					if (mode === 'prod') {
						const rawJson = await fixture.readFile('/welcome-data.json');
						json = JSON.parse(rawJson);
					} else if (mode === 'dev') {
						const rawJsonResponse = await fixture.fetch('/welcome-data.json');
						const rawJson = await rawJsonResponse.text();
						json = JSON.parse(rawJson);
					}
				});

				it('Returns expected keys', () => {
					assert.ok(json.hasOwnProperty('welcomePost'));
					assert.ok(json.hasOwnProperty('banner'));
					assert.ok(json.hasOwnProperty('author'));
					assert.ok(json.hasOwnProperty('relatedPosts'));
				});

				it('Returns `banner` data', () => {
					const { banner } = json;
					assert.ok(banner.hasOwnProperty('data'));
					assert.equal(banner.id, 'welcome');
					assert.equal(banner.collection, 'banners');
					assert.equal(
						banner.data.alt,
						'Futuristic landscape with chrome buildings and blue skies',
					);

					assert.equal(banner.data.src.width, 400);
					assert.equal(banner.data.src.height, 225);
					assert.equal(banner.data.src.format, 'jpg');
					assert.equal(banner.data.src.src.includes('the-future'), true);
				});

				it('Returns `author` data', () => {
					const { author } = json;
					assert.ok(author.hasOwnProperty('data'));
					assert.deepEqual(author.data, {
						name: 'Nate Something Moore',
						twitter: 'https://twitter.com/n_moore',
					});
				});

				it('Returns `relatedPosts` data', () => {
					const { relatedPosts } = json;
					assert.equal(Array.isArray(relatedPosts), true, 'Expected relatedPosts to be an array');
					const topLevelInfo = relatedPosts.map(({ data, body, ...meta }) => ({
						...meta,
						body: fixLineEndings(body).trim(),
					}));
					assert.deepEqual(
						topLevelInfo.map(({ id, slug, body, collection }) => ({ id, slug, body, collection })),
						[
							{
								id: 'related-1.md',
								slug: 'related-1',
								body: '# Related post 1\n\nThis is related to the welcome post.',
								collection: 'blog',
							},
							{
								id: 'related-2.md',
								slug: 'related-2',
								body: '# Related post 2\n\nThis is related to the welcome post.',
								collection: 'blog',
							},
						],
					);
					const postData = relatedPosts.map(({ data }) => data);
					assert.deepEqual(postData, [
						{
							title: 'Related post 1',
							banner: { id: 'welcome', collection: 'banners' },
							author: { id: 'fred-schott', collection: 'authors' },
						},
						{
							title: 'Related post 2',
							banner: { id: 'welcome', collection: 'banners' },
							author: { id: 'ben-holmes', collection: 'authors' },
						},
					]);
				});
			});

			describe(`Render result`, () => {
				let $;
				before(async () => {
					if (mode === 'prod') {
						const html = await fixture.readFile('/welcome/index.html');
						$ = cheerio.load(html);
					} else if (mode === 'dev') {
						const htmlResponse = await fixture.fetch('/welcome');
						const html = await htmlResponse.text();
						$ = cheerio.load(html);
					}
				});

				it('Renders `banner` data', () => {
					const banner = $('img[data-banner]');
					assert.equal(banner.length, 1);
					assert.ok(banner.attr('src').includes('the-future'));
					assert.equal(
						banner.attr('alt'),
						'Futuristic landscape with chrome buildings and blue skies',
					);
					assert.equal(banner.attr('width'), '400');
					assert.equal(banner.attr('height'), '225');
				});

				it('Renders `author` data', () => {
					const author = $('a[data-author-name]');
					assert.equal(author.length, 1);
					assert.equal(author.attr('href'), 'https://twitter.com/n_moore');
					assert.equal(author.text(), 'Nate Something Moore');
				});

				it('Renders `relatedPosts` data', () => {
					const relatedPosts = $('ul[data-related-posts]');
					assert.equal(relatedPosts.length, 1);
					const relatedPost1 = relatedPosts.find('li').eq(0);

					assert.equal(relatedPost1.find('a').attr('href'), '/blog/related-1');
					assert.equal(relatedPost1.find('a').text(), 'Related post 1');
					const relatedPost2 = relatedPosts.find('li').eq(1);
					assert.equal(relatedPost2.find('a').attr('href'), '/blog/related-2');
					assert.equal(relatedPost2.find('a').text(), 'Related post 2');
				});
			});
		});
	}
});
