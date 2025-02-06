import assert from 'node:assert/strict';
import { basename } from 'node:path';
import { Writable } from 'node:stream';
import { after, afterEach, before, describe, it } from 'node:test';
import { removeDir } from '@astrojs/internal-helpers/fs';
import * as cheerio from 'cheerio';
import parseSrcset from 'parse-srcset';
import { Logger } from '../dist/core/logger/core.js';
import testAdapter from './test-adapter.js';
import { testImageService } from './test-image-service.js';
import { loadFixture } from './test-utils.js';

describe('astro:image', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	describe('dev', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		/** @type {Array<{ type: any, level: 'error', message: string; }>} */
		let logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image/',
				image: {
					service: testImageService({ foo: 'bar' }),
					domains: ['avatars.githubusercontent.com'],
				},
			});

			devServer = await fixture.startDevServer({
				logger: new Logger({
					level: 'error',
					dest: new Writable({
						objectMode: true,
						write(event, _, callback) {
							logs.push(event);
							callback();
						},
					}),
				}),
			});
		});

		after(async () => {
			await devServer.stop();
		});

		describe('basics', () => {
			let $;
			let body;
			before(async () => {
				let res = await fixture.fetch('/');
				body = await res.text();
				$ = cheerio.load(body);
			});

			it('Adds the <img> tag', () => {
				let $img = $('#local img');
				assert.equal($img.length, 1);
				assert.equal($img.attr('src').startsWith('/_image'), true);
			});

			it('does not inject responsive image styles when not enabled', () => {
				assert.ok(!body.includes('[data-astro-image]'));
			});
			it('includes loading and decoding attributes', () => {
				let $img = $('#local img');
				assert.equal(!!$img.attr('loading'), true);
				assert.equal(!!$img.attr('decoding'), true);
			});

			it('has width and height - no dimensions set', () => {
				let $img = $('#local img');
				assert.equal($img.attr('width'), '207');
				assert.equal($img.attr('height'), '243');
			});

			it('has proper width and height - only width', () => {
				let $img = $('#local-width img');
				assert.equal($img.attr('width'), '350');
				assert.equal($img.attr('height'), '411');
			});

			it('has proper width and height - only height', () => {
				let $img = $('#local-height img');
				assert.equal($img.attr('width'), '170');
				assert.equal($img.attr('height'), '200');
			});

			it('has proper width and height - has both width and height', () => {
				let $img = $('#local-both img');
				assert.equal($img.attr('width'), '300');
				assert.equal($img.attr('height'), '400');
			});

			it('includes the provided alt', () => {
				let $img = $('#local img');
				assert.equal($img.attr('alt'), 'a penguin');
			});

			it('middleware loads the file', async () => {
				let $img = $('#local img');
				let src = $img.attr('src');
				let res = await fixture.fetch(src);
				assert.equal(res.status, 200);
			});

			it('returns proper content-type', async () => {
				let $img = $('#local img');
				let src = $img.attr('src');
				let res = await fixture.fetch(src);
				assert.equal(res.headers.get('content-type'), 'image/webp');
			});

			it('properly skip processing SVGs, but does not error', async () => {
				let res = await fixture.fetch('/svgSupport');
				let html = await res.text();

				$ = cheerio.load(html);
				let $img = $('img');
				assert.equal($img.length, 1);

				let src = $img.attr('src');
				res = await fixture.fetch(src);
				assert.equal(res.status, 200);
			});

			it("errors when an ESM imported image's src is passed to Image/getImage instead of the full import", async () => {
				logs.length = 0;
				let res = await fixture.fetch('/error-image-src-passed');
				await res.text();

				assert.equal(logs.length, 1);
				assert.equal(logs[0].message.includes('must be an imported image or an URL'), true);
			});

			it('supports images from outside the project', async () => {
				let res = await fixture.fetch('/outsideProject');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 2);
				assert.equal(
					$img.toArray().every((img) => {
						return (
							img.attribs['src'].startsWith('/@fs/') ||
							img.attribs['src'].startsWith('/_image?href=%2F%40fs%2F')
						);
					}),
					true,
				);
			});

			it('supports inlined imports', async () => {
				let res = await fixture.fetch('/inlineImport');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 1);

				let src = $img.attr('src');
				res = await fixture.fetch(src);
				assert.equal(res.status, 200);
			});

			it('supports uppercased imports', async () => {
				let res = await fixture.fetch('/uppercase');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 1);

				let src = $img.attr('src');
				let loading = $img.attr('loading');
				res = await fixture.fetch(src);
				assert.equal(res.status, 200);
				assert.notEqual(loading, undefined);
			});

			it('supports avif', async () => {
				let res = await fixture.fetch('/avif');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 1);

				let src = $img.attr('src');
				res = await fixture.fetch(src);
				assert.equal(res.status, 200);
				assert.equal(res.headers.get('content-type'), 'image/avif');
			});

			it('has a working Picture component', async () => {
				let res = await fixture.fetch('/picturecomponent');
				let html = await res.text();
				$ = cheerio.load(html);

				// Fallback format
				let $img = $('#picture-fallback img');
				assert.equal($img.length, 1);

				const imageURL = new URL($img.attr('src'), 'http://localhost');
				assert.equal(imageURL.searchParams.get('f'), 'jpeg');
				assert.equal($img.attr('fallbackformat'), undefined);

				// Densities
				$img = $('#picture-density-2-format img');
				let $picture = $('#picture-density-2-format picture');
				let $source = $('#picture-density-2-format source');
				assert.equal($img.length, 1);
				assert.equal($picture.length, 1);
				assert.equal($source.length, 2);

				const srcset = parseSrcset($source.attr('srcset'));
				assert.equal(
					srcset.every((src) => src.url.startsWith('/_image')),
					true,
				);
				assert.deepEqual(
					srcset.map((src) => src.d),
					[undefined, 2],
				);

				// Widths
				$img = $('#picture-widths img');
				$picture = $('#picture-widths picture');
				$source = $('#picture-widths source');
				assert.equal($img.length, 1);
				assert.equal($picture.length, 1);
				assert.equal($source.length, 1);
				assert.equal(
					$source.attr('sizes'),
					'(max-width: 448px) 400px, (max-width: 810px) 750px, 1050px',
				);

				const srcset2 = parseSrcset($source.attr('srcset'));
				assert.equal(
					srcset2.every((src) => src.url.startsWith('/_image')),
					true,
				);
				assert.deepEqual(
					srcset2.map((src) => src.w),
					[207],
				);

				// MIME Types
				const validMimeTypes = [
					'image/webp',
					'image/jpeg',
					'image/avif',
					'image/png',
					'image/gif',
					'image/svg+xml',
				];

				const $sources = $('#picture-mime-types picture source');
				for ($source of $sources) {
					const type = $source.attribs.type;
					assert.equal(
						validMimeTypes.includes(type),
						true,
						`Expected type attribute value to be a valid MIME type: ${type}`,
					);
				}
			});

			it('Picture component scope styles work', async () => {
				let res = await fixture.fetch('/picturecomponent');
				let html = await res.text();
				$ = cheerio.load(html);

				// Should have scoped attribute
				let $picture = $('#picture-attributes picture');
				assert.ok(Object.keys($picture.attr()).find((a) => a.startsWith('data-astro-cid-')));

				let $img = $('#picture-attributes img');
				assert.ok(Object.keys($img.attr()).find((a) => a.startsWith('data-astro-cid-')));
			});

			it('properly deduplicate srcset images', async () => {
				let res = await fixture.fetch('/srcset');
				let html = await res.text();
				$ = cheerio.load(html);

				let localImage = $('#local-3-images img');
				assert.equal(
					new Set([
						...parseSrcset(localImage.attr('srcset')).map((src) => src.url),
						localImage.attr('src'),
					]).size,
					3,
				);

				let remoteImage = $('#remote-3-images img');
				assert.equal(
					new Set([
						...parseSrcset(remoteImage.attr('srcset')).map((src) => src.url),
						remoteImage.attr('src'),
					]).size,
					3,
				);

				let local1x = $('#local-1x img');
				assert.equal(
					new Set([
						...parseSrcset(local1x.attr('srcset')).map((src) => src.url),
						local1x.attr('src'),
					]).size,
					1,
				);

				let remote1x = $('#remote-1x img');
				assert.equal(
					new Set([
						...parseSrcset(remote1x.attr('srcset')).map((src) => src.url),
						remote1x.attr('src'),
					]).size,
					1,
				);

				let local2Widths = $('#local-2-widths img');
				assert.equal(
					new Set([
						...parseSrcset(local2Widths.attr('srcset')).map((src) => src.url),
						local2Widths.attr('src'),
					]).size,
					2,
				);

				let remote2Widths = $('#remote-2-widths img');
				assert.equal(
					new Set([
						...parseSrcset(remote2Widths.attr('srcset')).map((src) => src.url),
						remote2Widths.attr('src'),
					]).size,
					2,
				);
			});
		});

		describe('vite-isms', () => {
			/**
			 * @type {cheerio.CheerioAPI}
			 */
			let $;
			before(async () => {
				let res = await fixture.fetch('/vite');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('support ?url imports', () => {
				let $url = $('#url');
				assert.equal($url.text(), 'string');
			});

			it('support ?raw imports', () => {
				let $raw = $('#raw');
				assert.equal($raw.text(), 'string');
			});

			it('support glob import as raw', () => {
				let $raw = $('#glob-import');
				assert.equal($raw.text(), 'string');
			});
		});

		describe('remote', () => {
			describe('working', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/');
					let html = await res.text();
					$ = cheerio.load(html);
				});

				it('has proper link and works', async () => {
					let $img = $('#remote img');

					let src = $img.attr('src');
					assert.ok(src.startsWith('/_image?'));
					const imageRequest = await fixture.fetch(src);
					assert.equal(imageRequest.status, 200);
				});

				it('includes the provided alt', async () => {
					let $img = $('#remote img');
					assert.equal($img.attr('alt'), 'fred');
				});

				it('includes loading and decoding attributes', () => {
					let $img = $('#remote img');
					assert.equal(!!$img.attr('loading'), true);
					assert.equal(!!$img.attr('decoding'), true);
				});

				it('includes width and height attributes', () => {
					let $img = $('#remote img');
					assert.equal(!!$img.attr('width'), true);
					assert.equal(!!$img.attr('height'), true);
				});

				it('support data: URI', () => {
					let $img = $('#data-uri img');
					assert.equal(
						$img.attr('src'),
						'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAANCAYAAABy6+R8AAAAAXNSR0IArs4c6QAAAIRlWElmTU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAA2gAwAEAAAAAQAAAA0AAAAAWvB1rQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KGV7hBwAAAWJJREFUKBVtUDEsQ1EUve+1/SItKYMIkYpF06GJdGAwNFFGkxBEYupssRm6EpvJbpVoYhRd6FBikDSxYECsBpG25D/nvP/+p+Ik551z73v33feuyA/izq5CL8ET8ALcBolYIP+vd0ibX/yAT7uj2qkVzwWzUBa0nbacbkKJHi5dlYhXmARYeAS+MwCWA5FPqKIP/9IH/wiygMru5y5mcRYkPHYKP7gAPw4SDbCjRXMgRBJctM4t4ROriM2QSpmkeOtub6YfMYrZvelykbD1sxJVg+6AfKqURRKQLfA4JvoVWgIjDMNlGLVKZxNRFsZsoHGAgREZHKPlJEi2t7if3r2KKS9nVOo0rtNZ3yR7M/VGTqTy5Y4o/scWHBbKfIq0/eZ+x3850OZpaTTxlu/4D3ssuA72uxrYS2rFYjh+aRbmb24LpTVu1IqVKG8P/lmUEaNMxeh6fmquOhkMBE8JJ2yPfwPjdVhiDbiX6AAAAABJRU5ErkJggg==',
					);
					assert.equal(!!$img.attr('width'), true);
					assert.equal(!!$img.attr('height'), true);
				});

				it('support images from public', () => {
					let $img = $('#public img');
					assert.equal($img.attr('src'), '/penguin3.jpg');
					assert.equal(!!$img.attr('width'), true);
					assert.equal(!!$img.attr('height'), true);
				});
			});

			it('error if no width and height', async () => {
				logs.length = 0;
				let res = await fixture.fetch('/remote-error-no-dimensions');
				await res.text();

				assert.equal(logs.length, 1);
				assert.equal(logs[0].message.includes('Missing width and height attributes'), true);
			});

			it('error if no height', async () => {
				logs.length = 0;
				let res = await fixture.fetch('/remote-error-no-height');
				await res.text();

				assert.equal(logs.length, 1);
				assert.equal(logs[0].message.includes('Missing height attribute'), true);
			});

			it('supports aliases', async () => {
				let res = await fixture.fetch('/alias');
				let html = await res.text();
				let $ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 1);
				assert.equal($img.attr('src').includes('penguin1.jpg'), true);
			});
		});

		describe('markdown', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/post');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('Adds the <img> tag', () => {
				let $img = $('img');
				assert.equal($img.length, 2);

				// Verbose test for the full URL to make sure the image went through the full pipeline
				assert.equal(
					$img.attr('src').startsWith('/_image') && $img.attr('src').endsWith('f=webp'),
					true,
				);
			});

			it('has width and height attributes', () => {
				let $img = $('img');
				assert.equal(!!$img.attr('width'), true);
				assert.equal(!!$img.attr('height'), true);
			});

			it('Supports aliased paths', async () => {
				let res = await fixture.fetch('/aliasMarkdown');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.attr('src').startsWith('/_image'), true);
			});

			it('Supports special characters in file name', async () => {
				let res = await fixture.fetch('/specialChars');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 3);
				$img.each((_, el) => {
					assert.equal(el.attribs.src?.startsWith('/_image'), true);
				});
			});

			it('properly handles remote images', async () => {
				let res = await fixture.fetch('/httpImage');
				let html = await res.text();
				$ = cheerio.load(html);

				let $img = $('img');
				assert.equal($img.length, 2);
				const remoteUrls = ['https://example.com/image.png', '/image.png'];
				$img.each((index, element) => {
					assert.equal(element.attribs['src'], remoteUrls[index]);
				});
			});
		});

		describe('getImage', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/get-image');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('Adds the <img> tag', () => {
				let $img = $('img');
				assert.equal($img.length, 1);
				assert.equal($img.attr('src').startsWith('/_image'), true);
			});

			it('includes the provided alt', () => {
				let $img = $('img');
				assert.equal($img.attr('alt'), 'a penguin');
			});
		});

		describe('content collections', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/blog/one');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('Adds the <img> tags', () => {
				let $img = $('img');
				assert.equal($img.length, 8);
			});

			it('image in cc folder is processed', () => {
				let $imgs = $('img');
				let $blogfolderimg = $($imgs[7]);
				assert.equal($blogfolderimg.attr('src').includes('blogfolder.jpg'), true);
				assert.equal($blogfolderimg.attr('src').endsWith('f=webp'), true);
			});

			it('has proper source for directly used image', () => {
				let $img = $('#direct-image img');
				assert.equal($img.attr('src').startsWith('/'), true);
			});

			it('has proper source for refined image', () => {
				let $img = $('#refined-image img');
				assert.equal($img.attr('src').startsWith('/'), true);
			});

			it('has proper sources for array of images', () => {
				let $img = $('#array-of-images img');
				const imgsSrcs = [];
				$img.each((_i, img) => imgsSrcs.push(img.attribs['src']));
				assert.equal($img.length, 2);
				assert.equal(
					imgsSrcs.every((img) => img.startsWith('/')),
					true,
				);
			});

			it('has proper attributes for optimized image through getImage', () => {
				let $img = $('#optimized-image-get-image img');
				assert.equal($img.attr('src').startsWith('/_image'), true);
				assert.equal($img.attr('width'), '207');
				assert.equal($img.attr('height'), '243');
			});

			it('has proper attributes for optimized image through Image component', () => {
				let $img = $('#optimized-image-component img');
				assert.equal($img.attr('src').startsWith('/_image'), true);
				assert.equal($img.attr('width'), '207');
				assert.equal($img.attr('height'), '243');
				assert.equal($img.attr('alt'), 'A penguin!');
			});

			it('properly handles nested images', () => {
				let $img = $('#nested-image img');
				assert.equal($img.attr('src').startsWith('/'), true);
			});
		});

		describe('regular img tag', () => {
			/** @type {ReturnType<import('cheerio')['load']>} */
			let $;
			before(async () => {
				let res = await fixture.fetch('/regular-img');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('does not have a file url', async () => {
				assert.equal($('img').attr('src').startsWith('file://'), false);
			});

			it('includes /src in the path', async () => {
				assert.equal($('img').attr('src').includes('/src'), true);
			});
		});

		describe('custom service', () => {
			it('custom service implements getHTMLAttributes', async () => {
				const response = await fixture.fetch('/');
				const html = await response.text();

				const $ = cheerio.load(html);
				assert.equal($('#local img').attr('data-service'), 'my-custom-service');
			});

			it('custom service works in Markdown', async () => {
				const response = await fixture.fetch('/post');
				const html = await response.text();

				const $ = cheerio.load(html);
				assert.equal($('img').attr('data-service'), 'my-custom-service');
			});

			it('gets service config', async () => {
				const response = await fixture.fetch('/');
				const html = await response.text();

				const $ = cheerio.load(html);
				assert.equal($('#local img').attr('data-service-config'), 'bar');
			});
		});

		describe('custom endpoint', async () => {
			/** @type {import('./test-utils').DevServer} */
			let customEndpointDevServer;

			/** @type {import('./test-utils.js').Fixture} */
			let customEndpointFixture;

			before(async () => {
				customEndpointFixture = await loadFixture({
					root: './fixtures/core-image/',
					image: {
						endpoint: { entrypoint: './src/custom-endpoint.ts' },
						service: testImageService({ foo: 'bar' }),
						domains: ['avatars.githubusercontent.com'],
					},
				});

				customEndpointDevServer = await customEndpointFixture.startDevServer({
					server: { port: 4324 },
				});
			});

			it('custom endpoint works', async () => {
				const response = await customEndpointFixture.fetch('/');
				const html = await response.text();

				const $ = cheerio.load(html);
				const src = $('#local img').attr('src');

				let res = await customEndpointFixture.fetch(src);
				assert.equal(res.status, 200);
				assert.equal(
					await res.text(),
					"You fool! I'm not a image endpoint at all, I just return this!",
				);
			});

			after(async () => {
				await customEndpointDevServer.stop();
			});
		});
	});

	describe('proper errors', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		/** @type {Array<{ type: any, level: 'error', message: string; }>} */
		let logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-errors/',
				image: {
					service: testImageService(),
				},
			});

			devServer = await fixture.startDevServer({
				logger: new Logger({
					level: 'error',
					dest: new Writable({
						objectMode: true,
						write(event, _, callback) {
							logs.push(event);
							callback();
						},
					}),
				}),
			});
		});

		after(async () => {
			await devServer.stop();
		});

		it("properly error when getImage's first parameter isn't filled", async () => {
			logs.length = 0;
			let res = await fixture.fetch('/get-image-empty');
			await res.text();

			assert.equal(logs.length >= 1, true);
			assert.equal(logs[0].message.includes('Expected getImage() parameter'), true);
		});

		it('properly error when src is undefined', async () => {
			logs.length = 0;
			let res = await fixture.fetch('/get-image-undefined');
			await res.text();

			assert.equal(logs.length >= 1, true);
			assert.equal(logs[0].message.includes('Expected `src` property'), true);
		});

		it('errors when an ESM imported image is passed directly to getImage', async () => {
			logs.length = 0;
			let res = await fixture.fetch('/get-image-import-passed');
			await res.text();
			assert.equal(logs.length >= 1, true);
			assert.equal(
				logs[0].message.includes('An ESM-imported image cannot be passed directly'),
				true,
			);
		});

		it('properly error image in Markdown frontmatter is not found', async () => {
			logs.length = 0;
			let res = await fixture.fetch('/blog/one');
			await res.text();

			assert.equal(logs.length, 1);
			assert.equal(logs[0].message.includes('does not exist. Is the path correct?'), true);
		});

		it('properly error image in Markdown content is not found', async () => {
			logs.length = 0;
			let res = await fixture.fetch('/post');
			await res.text();
			assert.equal(logs.length, 1);
			assert.equal(logs[0].message.includes('Could not find requested image'), true);
		});
	});

	describe('support base option correctly', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-base/',
				image: {
					service: testImageService(),
				},
				base: '/blog',
			});
			await fixture.build();
		});

		it('has base path prefix when using the Image component', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');
			assert.equal(src.length > 0, true);
			assert.equal(src.startsWith('/blog'), true);
		});

		it('has base path prefix when using getImage', async () => {
			const html = await fixture.readFile('/get-image/index.html');
			const $ = cheerio.load(html);
			const src = $('img').attr('src');
			assert.equal(src.length > 0, true);
			assert.equal(src.startsWith('/blog'), true);
		});

		it('has base path prefix when using image directly', async () => {
			const html = await fixture.readFile('/direct/index.html');
			const $ = cheerio.load(html);
			const src = $('img').attr('src');
			assert.equal(src.length > 0, true);
			assert.equal(src.startsWith('/blog'), true);
		});

		it('has base path prefix in Markdown', async () => {
			const html = await fixture.readFile('/post/index.html');
			const $ = cheerio.load(html);
			const src = $('img').attr('src');
			assert.equal(src.length > 0, true);
			assert.equal(src.startsWith('/blog'), true);
		});

		it('has base path prefix in Content Collection frontmatter', async () => {
			const html = await fixture.readFile('/blog/one/index.html');
			const $ = cheerio.load(html);
			const src = $('img').attr('src');
			assert.equal(src.length > 0, true);
			assert.equal(src.startsWith('/blog'), true);
		});

		it('has base path prefix in SSR', async () => {
			const fixtureWithBase = await loadFixture({
				root: './fixtures/core-image-ssr/',
				output: 'server',
				outDir: './dist/server-base-path',
				adapter: testAdapter(),
				image: {
					endpoint: {
						entrypoint: 'astro/assets/endpoint/node',
					},
					service: testImageService(),
				},
				base: '/blog',
			});
			await fixtureWithBase.build();
			const app = await fixtureWithBase.loadTestAdapterApp();
			const request = new Request('http://example.com/blog/');
			const response = await app.render(request);
			assert.equal(response.status, 200);
			const html = await response.text();
			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');
			assert.equal(src.startsWith('/blog'), true);
			const img = await app.render(new Request(`https://example.com${src}`));
			assert.equal(img.status, 200);
		});
	});

	describe('build ssg', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-ssg/',
				image: {
					service: testImageService(),
					domains: ['astro.build', 'avatars.githubusercontent.com'],
				},
			});
			// Remove cache directory
			removeDir(new URL('./fixtures/core-image-ssg/node_modules/.astro', import.meta.url));

			await fixture.build();
		});

		it('writes out images to dist folder', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');
			assert.equal(src.length > 0, true);
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('writes out allowed remote images', async () => {
			const html = await fixture.readFile('/remote/index.html');
			const $ = cheerio.load(html);
			const src = $('#remote img').attr('src');
			assert.equal(src.length > 0, true);
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('writes out images to dist folder with proper extension if no format was passed', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');
			assert.equal(src.endsWith('.webp'), true);
		});

		it('getImage() usage also written', async () => {
			const html = await fixture.readFile('/get-image/index.html');
			const $ = cheerio.load(html);
			let $img = $('img');

			// <img> tag
			assert.equal($img.length, 1);
			assert.equal($img.attr('alt'), 'a penguin');

			// image itself
			const src = $img.attr('src');
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('Picture component images are written', async () => {
			const html = await fixture.readFile('/picturecomponent/index.html');
			const $ = cheerio.load(html);
			let $img = $('img');
			let $source = $('source');

			assert.equal($img.length, 1);
			assert.equal($source.length, 2);

			const srcset = parseSrcset($source.attr('srcset'));
			let hasExistingSrc = await Promise.all(
				srcset.map(async (src) => {
					const data = await fixture.readFile(src.url, null);
					return data instanceof Buffer;
				}),
			);

			assert.deepEqual(
				hasExistingSrc.every((src) => src === true),
				true,
			);
		});

		it('markdown images are written', async () => {
			const html = await fixture.readFile('/post/index.html');
			const $ = cheerio.load(html);
			let $img = $('img');

			// <img> tag
			assert.equal($img.length, 1);
			assert.equal($img.attr('alt'), 'My article cover');

			// image itself
			const src = $img.attr('src');
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('aliased images are written', async () => {
			const html = await fixture.readFile('/alias/index.html');

			const $ = cheerio.load(html);
			let $img = $('img');

			// <img> tag
			assert.equal($img.length, 1);
			assert.equal($img.attr('alt'), 'A penguin!');

			// image itself
			const src = $img.attr('src');
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('aliased images in Markdown are written', async () => {
			const html = await fixture.readFile('/aliasMarkdown/index.html');

			const $ = cheerio.load(html);
			let $img = $('img');

			// <img> tag
			assert.equal($img.length, 1);
			assert.equal($img.attr('alt'), 'A penguin');

			// image itself
			const src = $img.attr('src');
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('output files for content collections images', async () => {
			const html = await fixture.readFile('/blog/one/index.html');

			const $ = cheerio.load(html);
			let $img = $('img');
			assert.equal($img.length, 2);

			const srcdirect = $('#direct-image img').attr('src');
			const datadirect = await fixture.readFile(srcdirect, null);
			assert.equal(datadirect instanceof Buffer, true);

			const srcnested = $('#nested-image img').attr('src');
			const datanested = await fixture.readFile(srcnested, null);
			assert.equal(datanested instanceof Buffer, true);
		});

		it('quality attribute produces a different file', async () => {
			const html = await fixture.readFile('/quality/index.html');
			const $ = cheerio.load(html);
			assert.notEqual($('#no-quality img').attr('src'), $('#quality-low img').attr('src'));
		});

		it('quality can be a number between 0-100', async () => {
			const html = await fixture.readFile('/quality/index.html');
			const $ = cheerio.load(html);
			assert.notEqual($('#no-quality img').attr('src'), $('#quality-num img').attr('src'));
		});

		it('format attribute produces a different file', async () => {
			const html = await fixture.readFile('/format/index.html');
			const $ = cheerio.load(html);
			assert.notEqual($('#no-format img').attr('src'), $('#format-avif img').attr('src'));
		});

		it('has cache entries', async () => {
			const generatedImages = (await fixture.glob('_astro/**/*.webp'))
				.map((path) => basename(path))
				.sort();
			const cachedImages = [...(await fixture.glob('../node_modules/.astro/assets/**/*.webp'))]
				.map((path) => basename(path))
				.sort();

			assert.deepEqual(generatedImages, cachedImages);
		});

		it('uses cache entries', async () => {
			const logs = [];
			const logging = {
				dest: {
					write(chunk) {
						logs.push(chunk);
					},
				},
			};

			await fixture.build({ logging });
			const generatingImageIndex = logs.findIndex((logLine) =>
				logLine.message.includes('generating optimized images'),
			);
			const relevantLogs = logs.slice(generatingImageIndex + 1, -1);
			const isReusingCache = relevantLogs.every((logLine) =>
				logLine.message.includes('(reused cache entry)'),
			);

			assert.equal(isReusingCache, true);
		});

		it('writes remote image cache metadata', async () => {
			const html = await fixture.readFile('/remote/index.html');
			const $ = cheerio.load(html);
			const metaSrc =
				'../node_modules/.astro/assets/' + basename($('#remote img').attr('src')) + '.json';
			const data = await fixture.readFile(metaSrc, null);
			assert.equal(data instanceof Buffer, true);
			const metadata = JSON.parse(data.toString());
			assert.equal(typeof metadata.expires, 'number');
		});

		it('client images are written to build', async () => {
			const html = await fixture.readFile('/client/index.html');
			const $ = cheerio.load(html);
			let $script = $('script');

			// Find image
			const regex = /src:"([^"]*)/;
			const imageSrc = regex.exec($script.html())[1];
			const data = await fixture.readFile(imageSrc, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('client images srcset parsed correctly', async () => {
			const html = await fixture.readFile('/srcset/index.html');
			const $ = cheerio.load(html);
			const srcset = $('#local-2-widths-with-spaces img').attr('srcset');

			// Find image
			const regex = /^(.+?) \d+[wx]$/m;
			const imageSrcset = regex.exec(srcset)[1];
			assert.notEqual(imageSrcset.includes(' '), true);
		});

		it('supports images with encoded characters in url', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const img = $('#encoded-chars img');
			const src = img.attr('src');
			const data = await fixture.readFile(src);
			assert.notEqual(data, undefined);
		});

		describe('custom service in build', () => {
			it('uses configured hashes properties', async () => {
				await fixture.build();
				const html = await fixture.readFile('/imageDeduplication/index.html');

				const $ = cheerio.load(html);

				const allTheSamePath = $('#all-the-same img')
					.map((_, el) => $(el).attr('src'))
					.get();

				assert.equal(
					allTheSamePath.every((path) => path === allTheSamePath[0]),
					true,
				);

				const useCustomHashProperty = $('#use-data img')
					.map((_, el) => $(el).attr('src'))
					.get();
				assert.equal(
					useCustomHashProperty.every((path) => path === useCustomHashProperty[0]),
					false,
				);

				assert.notEqual(useCustomHashProperty[1], useCustomHashProperty[0]);
			});
		});
	});

	describe('dev ssr', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-ssr/',
				output: 'server',
				outDir: './dist/server-dev',
				adapter: testAdapter(),
				base: 'some-base',
				image: {
					service: testImageService(),
				},
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('serves the image at /_image', async () => {
			const params = new URLSearchParams();
			params.set('href', '/src/assets/penguin1.jpg?origWidth=207&origHeight=243&origFormat=jpg');
			params.set('f', 'webp');
			const response = await fixture.fetch('/some-base/_image?' + String(params));
			assert.equal(response.status, 200);
			assert.equal(response.headers.get('content-type'), 'image/webp');
		});

		it('does not interfere with query params', async () => {
			let res = await fixture.fetch('/api?src=image.png');
			const html = await res.text();
			assert.equal(html, 'An image: "image.png"');
		});
	});

	describe('prod ssr', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-ssr/',
				output: 'server',
				outDir: './dist/server-prod',
				adapter: testAdapter(),
				image: {
					endpoint: { entrypoint: 'astro/assets/endpoint/node' },
					service: testImageService(),
				},
			});
			await fixture.build();
		});

		it('dynamic route images are built at response time', async () => {
			const app = await fixture.loadTestAdapterApp();
			let request = new Request('http://example.com/');
			let response = await app.render(request);
			assert.equal(response.status, 200);
			const html = await response.text();
			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');
			request = new Request('http://example.com' + src);
			response = await app.render(request);
			assert.equal(response.status, 200);
		});

		it('endpoint handle malformed requests', async () => {
			const badPaths = [
				'../../../../../../../../../../../../etc/hosts%00',
				'../../../../../../../../../../../../etc/hosts',
				'../../boot.ini',
				'/../../../../../../../../%2A',
				'../../../../../../../../../../../../etc/passwd%00',
				'../../../../../../../../../../../../etc/passwd',
				'../../../../../../../../../../../../etc/shadow%00',
				'../../../../../../../../../../../../etc/shadow',
				'/../../../../../../../../../../etc/passwd^^',
				'/../../../../../../../../../../etc/shadow^^',
				'/../../../../../../../../../../etc/passwd',
				'/../../../../../../../../../../etc/shadow',
				'/./././././././././././etc/passwd',
				'/./././././././././././etc/shadow',
				'....................etcpasswd',
				'....................etcshadow',
				'....................etcpasswd',
				'....................etcshadow',
				'/..../..../..../..../..../..../etc/passwd',
				'/..../..../..../..../..../..../etc/shadow',
				'.\\./.\\./.\\./.\\./.\\./.\\./etc/passwd',
				'.\\./.\\./.\\./.\\./.\\./.\\./etc/shadow',
				'....................etcpasswd%00',
				'....................etcshadow%00',
				'....................etcpasswd%00',
				'....................etcshadow%00',
				'%0a/bin/cat%20/etc/passwd',
				'%0a/bin/cat%20/etc/shadow',
				'%00/etc/passwd%00',
				'%00/etc/shadow%00',
				'%00../../../../../../etc/passwd',
				'%00../../../../../../etc/shadow',
				'/../../../../../../../../../../../etc/passwd%00.jpg',
				'/../../../../../../../../../../../etc/passwd%00.html',
				'/..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../etc/passwd',
				'/..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../etc/shadow',
				'/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/passwd,',
				'/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/etc/shadow,',
				'%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%,25%5c..%25%5c..%25%5c..%25%5c..%00',
				'/%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..,%25%5c..%25%5c..%25%5c..%25%5c..%00',
				'%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%,25%5c..%25%5c..%	25%5c..%25%5c..%00',
				'%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%,25%5c..%25%5c..%		25%5c..%25%5c..%255cboot.ini',
				'/%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..%25%5c..,%25%5c..%25%5c..%25%5c..%25%5c..winnt/desktop.ini',
				'\\&apos;/bin/cat%20/etc/passwd\\&apos;',
				'\\&apos;/bin/cat%20/etc/shadow\\&apos;',
				'../../../../../../../../conf/server.xml',
				'/../../../../../../../../bin/id|',
				'C:/inetpub/wwwroot/global.asa',
				'C:inetpubwwwrootglobal.asa',
				'C:/boot.ini',
				'C:\boot.ini',
				'../../../../../../../../../../../../localstart.asp%00',
				'../../../../../../../../../../../../localstart.asp',
				'../../../../../../../../../../../../boot.ini%00',
				'../../../../../../../../../../../../boot.ini',
				'/./././././././././././boot.ini',
				'/../../../../../../../../../../../boot.ini%00',
				'/../../../../../../../../../../../boot.ini',
				'/..../..../..../..../..../..../boot.ini',
				'/.\\./.\\./.\\./.\\./.\\./.\\./boot.ini',
				'....................\boot.ini',
				'....................\boot.ini%00',
				'....................\boot.ini',
				'/../../../../../../../../../../../boot.ini%00.html',
				'/../../../../../../../../../../../boot.ini%00.jpg',
				'/.../.../.../.../.../	',
				'..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../..%c0%af../boot.ini',
				'/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/%2e%2e/boot.ini',
				'../prerender/index.html',
			];

			const app = await fixture.loadTestAdapterApp();

			for (const path of badPaths) {
				let request = new Request('http://example.com/_image?href=' + path);
				let response = await app.render(request);
				const body = await response.text();

				assert.equal(response.status, 500);
				assert.equal(body.includes('Internal Server Error'), true);
			}

			// Server should still be running
			let request = new Request('http://example.com/');
			let response = await app.render(request);
			assert.equal(response.status, 200);
		});

		it('prerendered routes images are built', async () => {
			const html = await fixture.readFile('/client/prerender/index.html');
			const $ = cheerio.load(html);
			const src = $('img').attr('src');
			const imgData = await fixture.readFile('/client' + src, null);
			assert.equal(imgData instanceof Buffer, true);
		});
	});

	describe('trailing slash on the endpoint', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		it('includes a trailing slash if trailing slash is set to always', async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image/',
				image: {
					service: testImageService(),
				},
				trailingSlash: 'always',
			});
			devServer = await fixture.startDevServer();

			let res = await fixture.fetch('/');
			let html = await res.text();

			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');

			assert.equal(src.startsWith('/_image/?'), true);
		});

		it('does not includes a trailing slash if trailing slash is set to never', async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image/',
				image: {
					service: testImageService(),
				},
				trailingSlash: 'never',
			});
			devServer = await fixture.startDevServer();

			let res = await fixture.fetch('/');
			let html = await res.text();

			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');

			assert.equal(src.startsWith('/_image?'), true);
		});

		afterEach(async () => {
			await devServer.stop();
		});
	});
	describe('build data url', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-data-url/',
				image: {
					remotePatterns: [
						{
							protocol: 'data',
						},
					],
				},
			});

			await fixture.build();
		});

		it('uses short hash for data url filename', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src1 = $('#data-url img').attr('src');
			assert.equal(basename(src1).length < 32, true);
			const src2 = $('#data-url-no-size img').attr('src');
			assert.equal(basename(src2).length < 32, true);
			assert.equal(src1.split('_')[0], src2.split('_')[0]);
		});

		it('adds file extension for data url images', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src = $('#data-url img').attr('src');
			assert.equal(src.endsWith('.webp'), true);
		});

		it('writes data url images to dist', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src = $('#data-url img').attr('src');
			assert.equal(src.length > 0, true);
			const data = await fixture.readFile(src, null);
			assert.equal(data instanceof Buffer, true);
		});

		it('infers size of data url images', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const img = $('#data-url-no-size img');
			const width = img.attr('width');
			const height = img.attr('height');
			assert.equal(width, '256');
			assert.equal(height, '144');
		});
	});
});
