import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import * as devalue from 'devalue';
import testAdapter from './test-adapter.js';
import { preventNodeBuiltinDependencyPlugin } from './test-plugins.js';
import { loadFixture } from './test-utils.js';

describe('Legacy Content Collections', () => {
	describe('Query', () => {
		let fixture;
		before(async () => {
			fixture = await loadFixture({ root: './fixtures/legacy-content-collections/' });
			await fixture.build();
		});

		describe('Collection', () => {
			let json;
			before(async () => {
				const rawJson = await fixture.readFile('/collections.json');
				json = devalue.parse(rawJson);
			});

			it('Returns `without config` collection', async () => {
				assert.ok(json.hasOwnProperty('withoutConfig'));
				assert.equal(Array.isArray(json.withoutConfig), true);

				const ids = json.withoutConfig.map((item) => item.id);
				assert.deepEqual(
					ids.sort(),
					[
						'columbia.md',
						'endeavour.md',
						'enterprise.md',
						// Spaces allowed in IDs
						'promo/launch week.mdx',
					].sort(),
				);
			});

			it('Handles spaces in `without config` slugs', async () => {
				assert.ok(json.hasOwnProperty('withoutConfig'));
				assert.equal(Array.isArray(json.withoutConfig), true);

				const slugs = json.withoutConfig.map((item) => item.slug);
				assert.deepEqual(
					slugs.sort(),
					[
						'columbia',
						'endeavour',
						'enterprise',
						// "launch week.mdx" is converted to "launch-week.mdx"
						'promo/launch-week',
					].sort(),
				);
			});

			it('Passes legacy entry to filter function', async () => {
				assert.ok(json.hasOwnProperty('filtered'));
				assert.ok(Array.isArray(json.filtered));
				assert.ok(json.filtered.length > 0);
			});

			it('Returns `with schema` collection', async () => {
				assert.ok(json.hasOwnProperty('withSchemaConfig'));
				assert.equal(Array.isArray(json.withSchemaConfig), true);

				const ids = json.withSchemaConfig.map((item) => item.id);
				const publishedDates = json.withSchemaConfig.map((item) => item.data.publishedAt);
				assert.deepEqual(ids.sort(), ['four%.md', 'one.md', 'three.md', 'two.md'].sort());
				assert.equal(
					publishedDates.every((date) => date instanceof Date),
					true,
					'Not all publishedAt dates are Date objects',
				);
				assert.deepEqual(
					publishedDates.map((date) => date.toISOString()),
					[
						'2021-01-01T00:00:00.000Z',
						'2021-01-01T00:00:00.000Z',
						'2021-01-03T00:00:00.000Z',
						'2021-01-02T00:00:00.000Z',
					],
				);
			});

			it('Returns `with custom slugs` collection', async () => {
				assert.ok(json.hasOwnProperty('withSlugConfig'));
				assert.equal(Array.isArray(json.withSlugConfig), true);

				const slugs = json.withSlugConfig.map((item) => item.slug);
				assert.deepEqual(slugs, ['fancy-one', 'excellent-three', 'interesting-two']);
			});

			it('Returns `with union schema` collection', async () => {
				assert.ok(json.hasOwnProperty('withUnionSchema'));
				assert.equal(Array.isArray(json.withUnionSchema), true);

				const post = json.withUnionSchema.find((item) => item.id === 'post.md');
				assert.notEqual(post, undefined);
				assert.deepEqual(post.data, {
					type: 'post',
					title: 'My Post',
					description: 'This is my post',
				});
				const newsletter = json.withUnionSchema.find((item) => item.id === 'newsletter.md');
				assert.notEqual(newsletter, undefined);
				assert.deepEqual(newsletter.data, {
					type: 'newsletter',
					subject: 'My Newsletter',
				});
			});

			it('Handles symlinked content', async () => {
				assert.ok(json.hasOwnProperty('withSymlinkedContent'));
				assert.equal(Array.isArray(json.withSymlinkedContent), true);
				const ids = json.withSymlinkedContent.map((item) => item.id);
				assert.deepEqual(ids.sort(), ['first.md', 'second.md', 'third.md'].sort());
				assert.equal(
					json.withSymlinkedContent.find(({ id }) => id === 'first.md').data.title,
					'First Blog',
				);
			});

			it('Handles symlinked data', async () => {
				assert.ok(json.hasOwnProperty('withSymlinkedData'));
				assert.equal(Array.isArray(json.withSymlinkedData), true);

				const ids = json.withSymlinkedData.map((item) => item.id);
				assert.deepEqual(ids, ['welcome']);
				assert.equal(
					json.withSymlinkedData[0].data.alt,
					'Futuristic landscape with chrome buildings and blue skies',
				);
				assert.notEqual(json.withSymlinkedData[0].data.src.src, undefined);
			});
		});

		describe('Propagation', () => {
			it('Applies styles', async () => {
				const html = await fixture.readFile('/propagation/index.html');
				const $ = cheerio.load(html);
				assert.equal($('style').text().includes('content:"works!"'), true);
			});
		});

		describe('Entry', () => {
			let json;
			before(async () => {
				const rawJson = await fixture.readFile('/entries.json');
				json = devalue.parse(rawJson);
			});

			it('Returns `without config` collection entry', async () => {
				assert.ok(json.hasOwnProperty('columbiaWithoutConfig'));
				assert.equal(json.columbiaWithoutConfig.id, 'columbia.md');
			});

			it('Returns `with schema` collection entry', async () => {
				assert.ok(json.hasOwnProperty('oneWithSchemaConfig'));
				assert.equal(json.oneWithSchemaConfig.id, 'one.md');
				assert.equal(json.oneWithSchemaConfig.data.publishedAt instanceof Date, true);
				assert.equal(
					json.oneWithSchemaConfig.data.publishedAt.toISOString(),
					'2021-01-01T00:00:00.000Z',
				);
			});

			it('Returns `with custom slugs` collection entry', async () => {
				assert.ok(json.hasOwnProperty('twoWithSlugConfig'));
				assert.equal(json.twoWithSlugConfig.slug, 'interesting-two');
			});

			it('Returns `with union schema` collection entry', async () => {
				assert.ok(json.hasOwnProperty('postWithUnionSchema'));
				assert.equal(json.postWithUnionSchema.id, 'post.md');
				assert.deepEqual(json.postWithUnionSchema.data, {
					type: 'post',
					title: 'My Post',
					description: 'This is my post',
				});
			});
		});

		describe('Scripts', () => {
			it('Contains all the scripts imported by components', async () => {
				const html = await fixture.readFile('/with-scripts/one/index.html');
				const $ = cheerio.load(html);
				assert.equal($('script').length, 2);
				// Read the scripts' content
				const scriptsCode = $('script')
					.map((_, el) => $(el).text())
					.toArray()
					.join('\n');
				assert.match(scriptsCode, /ScriptCompA/);
				assert.match(scriptsCode, /ScriptCompB/);
			});
		});
	});

	const blogSlugToContents = {
		'first-post': {
			title: 'First post',
			element: 'blockquote',
			content: 'First post loaded: yes!',
		},
		'second-post': {
			title: 'Second post',
			element: 'blockquote',
			content: 'Second post loaded: yes!',
		},
		'third-post': {
			title: 'Third post',
			element: 'blockquote',
			content: 'Third post loaded: yes!',
		},
		'using-mdx': {
			title: 'Using MDX',
			element: 'a[href="#"]',
			content: 'Embedded component in MDX',
		},
	};

	describe('Static paths integration', () => {
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/content-static-paths-integration/',
				legacy: {
					collections: true,
				},
			});
			await fixture.build();
		});

		it('Generates expected pages', async () => {
			for (const slug in blogSlugToContents) {
				assert.equal(fixture.pathExists(`/posts/${slug}`), true);
			}
		});

		it('Renders titles', async () => {
			for (const slug in blogSlugToContents) {
				const post = await fixture.readFile(`/posts/${slug}/index.html`);
				const $ = cheerio.load(post);
				assert.equal($('h1').text(), blogSlugToContents[slug].title);
			}
		});

		it('Renders content', async () => {
			for (const slug in blogSlugToContents) {
				const post = await fixture.readFile(`/posts/${slug}/index.html`);
				const $ = cheerio.load(post);
				assert.equal(
					$(blogSlugToContents[slug].element).text().trim(),
					blogSlugToContents[slug].content,
				);
			}
		});
	});

	describe('With spaces in path', () => {
		it('Does not throw', async () => {
			const fixture = await loadFixture({
				root: './fixtures/content with spaces in folder name/',
				legacy: {
					collections: true,
				},
			});
			let error = null;
			try {
				await fixture.build({ force: true });
			} catch (e) {
				error = e.message;
			}
			assert.equal(error, null);
		});
	});
	describe('With config.mjs', () => {
		it("Errors when frontmatter doesn't match schema", async () => {
			const fixture = await loadFixture({
				root: './fixtures/content-collections-with-config-mjs/',
				legacy: {
					collections: true,
				},
			});
			let error;
			try {
				await fixture.build();
			} catch (e) {
				error = e.message;
			}
			assert.match(error, /\*\*title\*\*: Expected type `"string"`, received `"number"`/);
		});
	});
	describe('With config.mts', () => {
		it("Errors when frontmatter doesn't match schema", async () => {
			const fixture = await loadFixture({
				root: './fixtures/content-collections-with-config-mts/',
				legacy: {
					collections: true,
				},
			});
			let error;
			try {
				await fixture.build();
			} catch (e) {
				error = e.message;
			}
			assert.match(error, /\*\*title\*\*: Expected type `"string"`, received `"number"`/);
		});
	});

	describe('With empty markdown file', () => {
		it('Throws the right error', async () => {
			const fixture = await loadFixture({
				root: './fixtures/content-collections-empty-md-file/',
				legacy: {
					collections: true,
				},
			});
			let error;
			try {
				await fixture.build();
			} catch (e) {
				error = e.message;
			}
			assert.equal(error.includes('**title**: Required'), true);
		});
	});

	describe('With empty collections directory', () => {
		it('Handles the empty directory correctly', async () => {
			const fixture = await loadFixture({
				root: './fixtures/content-collections-empty-dir/',
				legacy: {
					collections: true,
				},
			});
			let error;
			try {
				await fixture.build();
			} catch (e) {
				error = e.message;
			}
			assert.equal(error, undefined);

			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const h1 = $('h1');
			assert.equal(h1.text(), 'Entries length: 0');
			assert.equal(h1.attr('data-entries'), '[]');
		});
	});

	describe('SSR integration', () => {
		let app;

		before(async () => {
			const fixture = await loadFixture({
				root: './fixtures/content-ssr-integration/',
				output: 'server',
				adapter: testAdapter(),
				vite: {
					plugins: [preventNodeBuiltinDependencyPlugin()],
				},
				legacy: {
					collections: true,
				},
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('Responds 200 for expected pages', async () => {
			for (const slug in blogSlugToContents) {
				const request = new Request('http://example.com/posts/' + slug);
				const response = await app.render(request);
				assert.equal(response.status, 200);
			}
		});

		it('Renders titles', async () => {
			for (const slug in blogSlugToContents) {
				const request = new Request('http://example.com/posts/' + slug);
				const response = await app.render(request);
				const body = await response.text();
				const $ = cheerio.load(body);
				assert.equal($('h1').text(), blogSlugToContents[slug].title);
			}
		});

		it('Renders content', async () => {
			for (const slug in blogSlugToContents) {
				const request = new Request('http://example.com/posts/' + slug);
				const response = await app.render(request);
				const body = await response.text();
				const $ = cheerio.load(body);
				assert.equal(
					$(blogSlugToContents[slug].element).text().trim(),
					blogSlugToContents[slug].content,
				);
			}
		});
	});

	describe('Base configuration', () => {
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/content-collections-base/',
				legacy: {
					collections: true,
				},
			});
			await fixture.build();
		});

		it('Includes base in links', async () => {
			const html = await fixture.readFile('/docs/index.html');
			const $ = cheerio.load(html);
			assert.equal($('link').attr('href').startsWith('/docs'), true);
		});

		it('Includes base in scripts', async () => {
			const html = await fixture.readFile('/docs/index.html');
			const $ = cheerio.load(html);
			assert.equal($('script').attr('src').startsWith('/docs'), true);
		});
	});

	describe('Mutation', () => {
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/content-collections-mutation/',
				legacy: {
					collections: true,
				},
			});
			await fixture.build();
		});

		it('Does not mutate cached collection', async () => {
			const html = await fixture.readFile('/index.html');
			const index = cheerio.load(html)('h2:first').text();
			const html2 = await fixture.readFile('/another_page/index.html');
			const anotherPage = cheerio.load(html2)('h2:first').text();

			assert.equal(index, anotherPage);
		});
	});
});
