import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { fixLineEndings, loadFixture } from './test-utils.js';

const FIXTURE_ROOT = './fixtures/astro-markdown/';

describe('Astro Markdown', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: FIXTURE_ROOT,
		});
		await fixture.build();
	});

	it('Exposes raw markdown content', async () => {
		const { raw } = JSON.parse(await fixture.readFile('/raw-content.json'));

		assert.equal(
			fixLineEndings(raw).trim(),
			`# Basic page\n\nLets make sure raw and compiled content look right!`,
		);
	});

	it('Allows ?raw and ?url imports', async () => {
		const { rawImport, url } = JSON.parse(await fixture.readFile('/raw-content.json'));
		assert.equal(
			fixLineEndings(rawImport).trim(),
			`# Basic page\n\nLets make sure raw and compiled content look right!`,
		);
		assert.ok(url.startsWith('data:text/markdown;base64,'));
	});

	it('Exposes compiled HTML content', async () => {
		const { compiled } = JSON.parse(await fixture.readFile('/raw-content.json'));

		assert.equal(
			fixLineEndings(compiled).trim(),
			`<h1 id="basic-page">Basic page</h1>\n<p>Lets make sure raw and compiled content look right!</p>`,
		);
	});

	describe('syntax highlighting', async () => {
		it('handles Shiki', async () => {
			const html = await fixture.readFile('/code-in-md/index.html');
			const $ = cheerio.load(html);

			assert.notEqual($('pre.astro-code').length, 0);
		});

		it('handles Prism', async () => {
			const prismFixture = await loadFixture({
				root: FIXTURE_ROOT,
				markdown: {
					syntaxHighlight: 'prism',
				},
			});
			await prismFixture.build();

			const html = await prismFixture.readFile('/code-in-md/index.html');
			const $ = cheerio.load(html);

			assert.notEqual($('pre.language-html').length, 0);
		});
	});

	it('Passes frontmatter to layout via "content" and "frontmatter" props', async () => {
		const html = await fixture.readFile('/with-layout/index.html');
		const $ = cheerio.load(html);

		const contentTitle = $('[data-content-title]');
		const frontmatterTitle = $('[data-frontmatter-title]');

		assert.equal(contentTitle.text(), 'With layout');
		assert.equal(frontmatterTitle.text(), 'With layout');
	});

	it('Passes headings to layout via "headings" prop', async () => {
		const html = await fixture.readFile('/with-layout/index.html');
		const $ = cheerio.load(html);

		const headingSlugs = [...$('body').find('[data-headings] > li')].map((el) => $(el).text());

		assert.ok(headingSlugs.length > 0);
		assert.ok(headingSlugs.includes('section-1'));
		assert.ok(headingSlugs.includes('section-2'));
	});

	it('Passes compiled content to layout via "compiledContent" prop', async () => {
		const html = await fixture.readFile('/with-layout/index.html');
		const $ = cheerio.load(html);

		const compiledContent = $('[data-compiled-content]');

		assert.equal(
			fixLineEndings(compiledContent.text()).trim(),
			`<h2 id="section-1">Section 1</h2>\n<h2 id="section-2">Section 2</h2>`,
		);
	});

	it('Passes raw content to layout via "rawContent" prop', async () => {
		const html = await fixture.readFile('/with-layout/index.html');
		const $ = cheerio.load(html);

		const rawContent = $('[data-raw-content]');

		assert.equal(fixLineEndings(rawContent.text()).trim(), `## Section 1\n\n## Section 2`);
	});

	it('Exposes getHeadings() on glob imports', async () => {
		const { headings } = JSON.parse(await fixture.readFile('/headings-glob.json'));

		const headingSlugs = headings.map((heading) => heading?.slug);

		assert.ok(headingSlugs.includes('section-1'));
		assert.ok(headingSlugs.includes('section-2'));
	});

	it('passes "file" and "url" to layout', async () => {
		const html = await fixture.readFile('/with-layout/index.html');
		const $ = cheerio.load(html);

		const frontmatterFile = $('[data-frontmatter-file]')?.text();
		const frontmatterUrl = $('[data-frontmatter-url]')?.text();
		const file = $('[data-file]')?.text();
		const url = $('[data-url]')?.text();

		assert.equal(
			frontmatterFile?.endsWith('with-layout.md'),
			true,
			'"file" prop does not end with correct path or is undefined',
		);
		assert.equal(frontmatterUrl, '/with-layout');
		assert.equal(file, frontmatterFile);
		assert.equal(url, frontmatterUrl);
	});

	describe('Vite env vars (#3412)', () => {
		it('Allows referencing import.meta.env in content', async () => {
			const html = await fixture.readFile('/vite-env-vars/index.html');
			const $ = cheerio.load(html);

			// test 1: referencing an existing var name
			assert.equal($('code').eq(0).text(), 'import.meta.env.SITE');
			assert.equal($('li').eq(0).text(), 'import.meta.env.SITE');
			assert.ok($('code').eq(3).text().includes('site: import.meta.env.SITE'));

			// // test 2: referencing a non-existing var name
			assert.equal($('code').eq(1).text(), 'import.meta.env.TITLE');
			assert.equal($('li').eq(1).text(), 'import.meta.env.TITLE');
			assert.ok($('code').eq(3).text().includes('title: import.meta.env.TITLE'));

			// // test 3: referencing `import.meta.env` itself (without any var name)
			assert.equal($('code').eq(2).text(), 'import.meta.env');
			assert.equal($('li').eq(2).text(), 'import.meta.env');
			assert.ok($('code').eq(3).text().includes('// Use Vite env vars with import.meta.env'));
		});
		it('Allows referencing import.meta.env in frontmatter', async () => {
			const { title = '' } = JSON.parse(await fixture.readFile('/vite-env-vars-glob.json'));
			assert.ok(title.includes('import.meta.env.SITE'));
			assert.ok(title.includes('import.meta.env.TITLE'));
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		it('ignores .md extensions on query params', async () => {
			const res = await fixture.fetch('/false-positive?page=page.md');
			assert.ok(res.ok);
			const html = await res.text();
			const $ = cheerio.load(html);
			assert.equal($('p').text(), 'the page is not markdown');
		});

		after(async () => {
			await devServer.stop();
		});
	});
});
