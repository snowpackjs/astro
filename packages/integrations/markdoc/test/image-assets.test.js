import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

const root = new URL('./fixtures/image-assets/', import.meta.url);

describe('Markdoc - Image assets', () => {
	let baseFixture;

	before(async () => {
		baseFixture = await loadFixture({
			root,
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await baseFixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('uses public/ image paths unchanged', async () => {
			const res = await baseFixture.fetch('/');
			const html = await res.text();
			const { document } = parseHTML(html);
			assert.equal(document.querySelector('#public > img')?.src, '/favicon.svg');
		});

		it('transforms relative image paths to optimized path', async () => {
			const res = await baseFixture.fetch('/');
			const html = await res.text();
			const { document } = parseHTML(html);
			assert.match(
				document.querySelector('#relative > img')?.src,
				/\/_image\?href=.*%2Fsrc%2Fassets%2Frelative%2Foar.jpg%3ForigWidth%3D420%26origHeight%3D630%26origFormat%3Djpg&w=420&h=630&f=webp/,
			);
		});

		it('transforms aliased image paths to optimized path', async () => {
			const res = await baseFixture.fetch('/');
			const html = await res.text();
			const { document } = parseHTML(html);
			assert.match(
				document.querySelector('#alias > img')?.src,
				/\/_image\?href=.*%2Fsrc%2Fassets%2Falias%2Fcityscape.jpg%3ForigWidth%3D420%26origHeight%3D280%26origFormat%3Djpg&w=420&h=280&f=webp/,
			);
		});

		it('passes images inside image tags to configured image component', async () => {
			const res = await baseFixture.fetch('/');
			const html = await res.text();
			const { document } = parseHTML(html);
			assert.equal(document.querySelector('#component > img')?.className, 'custom-styles');
		});
	});

	describe('build', () => {
		before(async () => {
			await baseFixture.build();
		});

		it('uses public/ image paths unchanged', async () => {
			const html = await baseFixture.readFile('/index.html');
			const { document } = parseHTML(html);
			assert.equal(document.querySelector('#public > img')?.src, '/favicon.svg');
		});

		it('transforms relative image paths to optimized path', async () => {
			const html = await baseFixture.readFile('/index.html');
			const { document } = parseHTML(html);
			assert.match(document.querySelector('#relative > img')?.src, /^\/_astro\/oar.*\.webp$/);
		});

		it('transforms aliased image paths to optimized path', async () => {
			const html = await baseFixture.readFile('/index.html');
			const { document } = parseHTML(html);
			assert.match(document.querySelector('#alias > img')?.src, /^\/_astro\/cityscape.*\.webp$/);
		});

		it('passes images inside image tags to configured image component', async () => {
			const html = await baseFixture.readFile('/index.html');
			const { document } = parseHTML(html);
			assert.equal(document.querySelector('#component > img')?.className, 'custom-styles');
			assert.match(document.querySelector('#component > img')?.src, /^\/_astro\/oar.*\.webp$/);
		});
	});
});
