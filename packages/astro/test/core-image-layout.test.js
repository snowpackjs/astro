import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import parseSrcset from 'parse-srcset';
import { Logger } from '../dist/core/logger/core.js';
import { testImageService } from './test-image-service.js';
import { testRemoteImageService } from './test-remote-image-service.js';
import { loadFixture } from './test-utils.js';

describe('astro:image:layout', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	describe('local image service', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-layout/',
				image: {
					service: testImageService({ foo: 'bar' }),
					domains: ['avatars.githubusercontent.com'],
				},
			});

			devServer = await fixture.startDevServer({});
		});

		after(async () => {
			await devServer.stop();
		});

		describe('basics', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('Adds the <img> tag', () => {
				let $img = $('#local img');
				assert.equal($img.length, 1);
				assert.equal($img.attr('src').startsWith('/_image'), true);
			});

			it('includes lazy loading attributes', () => {
				let $img = $('#local img');
				assert.equal($img.attr('loading'), 'lazy');
				assert.equal($img.attr('decoding'), 'async');
				assert.equal($img.attr('fetchpriority'), 'auto');
			});

			it('includes priority loading attributes', () => {
				let $img = $('#local-priority img');
				assert.equal($img.attr('loading'), 'eager');
				assert.equal($img.attr('decoding'), 'sync');
				assert.equal($img.attr('fetchpriority'), 'high');
			});

			it('has width and height - no dimensions set', () => {
				let $img = $('#local img');
				assert.equal($img.attr('width'), '2316');
				assert.equal($img.attr('height'), '1544');
			});

			it('has proper width and height - only width', () => {
				let $img = $('#local-width img');
				assert.equal($img.attr('width'), '350');
				assert.equal($img.attr('height'), '233');
			});

			it('has proper width and height - only height', () => {
				let $img = $('#local-height img');
				assert.equal($img.attr('width'), '300');
				assert.equal($img.attr('height'), '200');
			});

			it('has proper width and height - has both width and height', () => {
				let $img = $('#local-both img');
				assert.equal($img.attr('width'), '300');
				assert.equal($img.attr('height'), '400');
			});

			it('sets the style', () => {
				let $img = $('#local-both img');
				assert.match($img.attr('style'), /--w: 300/);
				assert.match($img.attr('style'), /--h: 400/);
				assert.equal($img.data('astro-image'), 'responsive');
			});

			it('sets the style when no dimensions set', () => {
				let $img = $('#local img');
				assert.match($img.attr('style'), /--w: 2316/);
				assert.match($img.attr('style'), /--h: 1544/);
				assert.equal($img.data('astro-image'), 'responsive');
			});

			it('sets style for fixed image', () => {
				let $img = $('#local-fixed img');
				assert.match($img.attr('style'), /--w: 800/);
				assert.match($img.attr('style'), /--h: 600/);
				assert.equal($img.data('astro-image'), 'fixed');
			});

			it('sets style for full-width image', () => {
				let $img = $('#local-full-width img');
				assert.equal($img.data('astro-image'), 'full-width');
			});

			it('passes in a parent class', () => {
				let $img = $('#local-class img');

				assert.match($img.attr('class'), /green/);
			});

			it('passes in a parent style', () => {
				let $img = $('#local-style img');
				assert.match($img.attr('style'), /border: 2px red solid/);
			});

			it('passes in a parent style as an object', () => {
				let $img = $('#local-style-object img');
				assert.match($img.attr('style'), /border:2px red solid/);
			});

			it('injects a style tag', () => {
				const style = $('style').text();
				assert.match(style, /\[data-astro-image\]/);
			});
		});

		describe('srcsets', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('has srcset', () => {
				let $img = $('#local img');
				assert.ok($img.attr('srcset'));
				const srcset = parseSrcset($img.attr('srcset'));
				assert.equal(srcset.length, 8);
				assert.equal(srcset[0].url.startsWith('/_image'), true);
				const widths = srcset.map((x) => x.w);
				assert.deepEqual(widths, [640, 750, 828, 1080, 1280, 1668, 2048, 2316]);
			});

			it('constrained - has max of 2x requested size', () => {
				let $img = $('#local-constrained img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.equal(widths.at(-1), 1600);
			});

			it('constrained - just has 1x and 2x when smaller than min breakpoint', () => {
				let $img = $('#local-both img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.deepEqual(widths, [300, 600]);
			});

			it('fixed - has just 1x and 2x', () => {
				let $img = $('#local-fixed img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.deepEqual(widths, [800, 1600]);
			});

			it('full-width: has all breakpoints below image size, ignoring dimensions', () => {
				let $img = $('#local-full-width img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.deepEqual(widths, [640, 750, 828, 1080, 1280, 1668, 2048]);
			});
		});

		describe('generated URLs', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/fit');
				let html = await res.text();
				$ = cheerio.load(html);
			});
			it('generates width and height in image URLs when both are provided', () => {
				let $img = $('#local-both img');
				const aspectRatio = 300 / 400;
				const srcset = parseSrcset($img.attr('srcset'));
				for (const { url } of srcset) {
					const params = new URL(url, 'https://example.com').searchParams;
					const width = parseInt(params.get('w'));
					const height = parseInt(params.get('h'));
					assert.equal(width / height, aspectRatio);
				}
			});

			it('does not pass through fit and position', async () => {
				const fit = $('#fit-cover img');
				assert.ok(!fit.attr('fit'));
				const position = $('#position img');
				assert.ok(!position.attr('position'));
			});

			it('sets a default fit of "cover" when no fit is provided', () => {
				let $img = $('#fit-default img');
				const srcset = parseSrcset($img.attr('srcset'));
				for (const { url } of srcset) {
					const params = new URL(url, 'https://example.com').searchParams;
					assert.equal(params.get('fit'), 'cover');
				}
			});

			it('sets a fit of "contain" when fit="contain" is provided', () => {
				let $img = $('#fit-contain img');
				const srcset = parseSrcset($img.attr('srcset'));
				for (const { url } of srcset) {
					const params = new URL(url, 'https://example.com').searchParams;
					assert.equal(params.get('fit'), 'contain');
				}
			});

			it('sets no fit when fit="none" is provided', () => {
				let $img = $('#fit-none img');
				const srcset = parseSrcset($img.attr('srcset'));
				for (const { url } of srcset) {
					const params = new URL(url, 'https://example.com').searchParams;
					assert.ok(!params.has('fit'));
				}
			});
		});

		describe('remote images', () => {
			describe('srcset', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/remote');
					let html = await res.text();
					$ = cheerio.load(html);
				});
				it('has srcset', () => {
					let $img = $('#constrained img');
					assert.ok($img.attr('srcset'));
					const srcset = parseSrcset($img.attr('srcset'));
					const widths = srcset.map((x) => x.w);
					assert.deepEqual(widths, [640, 750, 800, 828, 1080, 1280, 1600]);
				});

				it('constrained - has max of 2x requested size', () => {
					let $img = $('#constrained img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.equal(widths.at(-1), 1600);
				});

				it('constrained - just has 1x and 2x when smaller than min breakpoint', () => {
					let $img = $('#small img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.deepEqual(widths, [300, 600]);
				});

				it('fixed - has just 1x and 2x', () => {
					let $img = $('#fixed img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.deepEqual(widths, [800, 1600]);
				});

				it('full-width: has all breakpoints', () => {
					let $img = $('#full-width img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.deepEqual(widths, [640, 750, 828, 1080, 1280, 1668, 2048, 2560]);
				});
			});
		});

		describe('picture component', () => {
			/** Original image dimensions */
			const originalWidth = 2316;
			const originalHeight = 1544;

			/** @type {import("cheerio").CheerioAPI} */
			let $;
			before(async () => {
				let res = await fixture.fetch('/picture');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			describe('basics', () => {
				it('creates picture and img elements', () => {
					let $picture = $('#picture-density-2-format picture');
					let $img = $('#picture-density-2-format img');
					assert.equal($picture.length, 1);
					assert.equal($img.length, 1);
				});

				it('includes source elements for each format', () => {
					let $sources = $('#picture-density-2-format source');
					assert.equal($sources.length, 2); // avif and webp formats

					const types = $sources.map((_, el) => $(el).attr('type')).get();
					assert.deepEqual(types.sort(), ['image/avif', 'image/webp']);
				});

				it('generates responsive srcset matching layout breakpoints', () => {
					let $source = $('#picture-density-2-format source').first();
					const srcset = parseSrcset($source.attr('srcset'));

					const widths = srcset.map((s) => s.w);
					assert.deepEqual(widths, [640, 750, 828, 1080, 1158, 1280, 1668, 2048, 2316]);
				});

				it('has proper width and height attributes', () => {
					let $img = $('#picture-density-2-format img');
					// Width is set to half of original in the component
					const expectedWidth = Math.round(originalWidth / 2);
					const expectedHeight = Math.round(originalHeight / 2);

					assert.equal($img.attr('width'), expectedWidth.toString());
					assert.equal($img.attr('height'), expectedHeight.toString());
				});
			});

			describe('responsive variants', () => {
				it('constrained - has max of 2x requested size', () => {
					let $source = $('#picture-constrained source').first();
					const widths = parseSrcset($source.attr('srcset')).map((s) => s.w);
					assert.equal(widths.at(-1), 1600); // Max should be 2x the 800px width

					let $img = $('#picture-constrained img');
					const aspectRatio = originalWidth / originalHeight;
					assert.equal($img.attr('width'), '800');
					assert.equal($img.attr('height'), Math.round(800 / aspectRatio).toString());
				});

				it('constrained - just has 1x and 2x when smaller than min breakpoint', () => {
					let $source = $('#picture-both source').first();
					const widths = parseSrcset($source.attr('srcset')).map((s) => s.w);
					assert.deepEqual(widths, [300, 600]); // Just 1x and 2x for small images

					let $img = $('#picture-both img');
					assert.equal($img.attr('width'), '300');
					assert.equal($img.attr('height'), '400');
				});

				it('fixed - has just 1x and 2x', () => {
					let $source = $('#picture-fixed source').first();
					const widths = parseSrcset($source.attr('srcset')).map((s) => s.w);
					assert.deepEqual(widths, [400, 800]); // Fixed layout only needs 1x and 2x

					let $img = $('#picture-fixed img');
					assert.equal($img.attr('width'), '400');
					assert.equal($img.attr('height'), '300');
				});

				it('full-width: has all breakpoints below image size', () => {
					let $source = $('#picture-full-width source').first();
					const widths = parseSrcset($source.attr('srcset')).map((s) => s.w);
					assert.deepEqual(widths, [640, 750, 828, 1080, 1280, 1668, 2048]);
				});
			});

			describe('fallback format', () => {
				it('uses specified fallback format', () => {
					let $img = $('#picture-fallback img');
					const imageURL = new URL($img.attr('src'), 'http://localhost');
					assert.equal(imageURL.searchParams.get('f'), 'jpeg');
				});

				it('does not add fallbackFormat as an attribute', () => {
					let $img = $('#picture-fallback img');
					assert.equal($img.attr('fallbackformat'), undefined);
				});

				it('maintains original aspect ratio', () => {
					let $img = $('#picture-fallback img');
					const width = parseInt($img.attr('width'));
					const height = parseInt($img.attr('height'));
					const imageAspectRatio = width / height;
					const originalAspectRatio = originalWidth / originalHeight;

					// Allow for small rounding differences
					assert.ok(Math.abs(imageAspectRatio - originalAspectRatio) < 0.01);
				});
			});

			describe('attributes', () => {
				it('applies class to img element', () => {
					let $img = $('#picture-attributes img');
					assert.ok($img.attr('class').includes('img-comp'));
				});

				it('applies pictureAttributes to picture element', () => {
					let $picture = $('#picture-attributes picture');
					assert.ok($picture.attr('class').includes('picture-comp'));
				});

				it('adds inline style attributes', () => {
					let $img = $('#picture-attributes img');
					const style = $img.attr('style');
					assert.match(style, /--w:/);
					assert.match(style, /--h:/);
				});

				it('passing in style as an object', () => {
					let $img = $('#picture-style-object img');
					const style = $img.attr('style');
					assert.match(style, /border:2px red solid/);
				});

				it('passing in style as a string', () => {
					let $img = $('#picture-style img');
					const style = $img.attr('style');
					assert.match(style, /border: 2px red solid/);
				});
			});

			describe('MIME types', () => {
				it('creates source elements with correct MIME types', () => {
					const $sources = $('#picture-mime-types source');
					const types = $sources.map((_, el) => $(el).attr('type')).get();

					// Should have all specified formats in correct MIME type format
					const expectedTypes = [
						// Included twice because we pass jpg and jpeg
						'image/jpeg',
						'image/jpeg',
						'image/png',
						'image/avif',
						'image/webp',
					];

					assert.deepEqual(types.sort(), expectedTypes.sort());
				});

				it('uses valid MIME type format', () => {
					const $sources = $('#picture-mime-types source');
					const validMimeTypes = [
						'image/webp',
						'image/jpeg',
						'image/avif',
						'image/png',
						'image/gif',
						'image/svg+xml',
					];

					$sources.each((_, source) => {
						const type = $(source).attr('type');
						assert.ok(
							validMimeTypes.includes(type),
							`Expected type attribute value to be a valid MIME type: ${type}`,
						);
					});
				});
			});
		});
	});

	describe('remote image service', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		/** @type {Array<{ type: any, level: 'error', message: string; }>} */
		let logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-layout/',
				image: {
					service: testRemoteImageService({ foo: 'bar' }),
					domains: ['images.unsplash.com'],
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

		describe('srcsets', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/');
				let html = await res.text();
				$ = cheerio.load(html);
			});

			it('has full srcset', () => {
				let $img = $('#local img');
				assert.ok($img.attr('srcset'));
				const srcset = parseSrcset($img.attr('srcset'));
				assert.equal(srcset.length, 10);
				assert.equal(srcset[0].url.startsWith('/_image'), true);
				const widths = srcset.map((x) => x.w);
				assert.deepEqual(widths, [640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2316]);
			});

			it('constrained - has max of 2x requested size', () => {
				let $img = $('#local-constrained img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.equal(widths.at(-1), 1600);
			});

			it('constrained - just has 1x and 2x when smaller than min breakpoint', () => {
				let $img = $('#local-both img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.deepEqual(widths, [300, 600]);
			});

			it('fixed - has just 1x and 2x', () => {
				let $img = $('#local-fixed img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.deepEqual(widths, [800, 1600]);
			});

			it('full-width: has all breakpoints below image size, ignoring dimensions', () => {
				let $img = $('#local-full-width img');
				const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
				assert.deepEqual(widths, [640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048]);
			});
		});

		describe('remote', () => {
			describe('srcset', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/remote');
					let html = await res.text();
					$ = cheerio.load(html);
				});
				it('has srcset', () => {
					let $img = $('#constrained img');
					assert.ok($img.attr('srcset'));
					const srcset = parseSrcset($img.attr('srcset'));
					assert.equal(srcset.length, 8);
					assert.equal(srcset[0].url.startsWith('/_image'), true);
					const widths = srcset.map((x) => x.w);
					assert.deepEqual(widths, [640, 750, 800, 828, 960, 1080, 1280, 1600]);
				});

				it('constrained - has max of 2x requested size', () => {
					let $img = $('#constrained img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.equal(widths.at(-1), 1600);
				});

				it('constrained - just has 1x and 2x when smaller than min breakpoint', () => {
					let $img = $('#small img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.deepEqual(widths, [300, 600]);
				});

				it('fixed - has just 1x and 2x', () => {
					let $img = $('#fixed img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.deepEqual(widths, [800, 1600]);
				});

				it('full-width: has all breakpoints', () => {
					let $img = $('#full-width img');
					const widths = parseSrcset($img.attr('srcset')).map((x) => x.w);
					assert.deepEqual(
						widths,
						[640, 750, 828, 960, 1080, 1280, 1668, 1920, 2048, 2560, 3200, 3840, 4480, 5120, 6016],
					);
				});
			});
		});
	});

	describe('build', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-layout/',
				image: {
					service: testImageService({ foo: 'bar' }),
					domains: ['avatars.githubusercontent.com'],
				},
			});

			await fixture.build();
		});

		describe('basics', () => {
			let $;
			let html;
			before(async () => {
				html = await fixture.readFile('/index.html');
				$ = cheerio.load(html);
			});

			it('Adds the <img> tag', () => {
				let $img = $('#local img');
				assert.equal($img.length, 1);
				assert.ok($img.attr('src').startsWith('/_astro'));
			});

			it('includes lazy loading attributes', () => {
				let $img = $('#local img');
				assert.equal($img.attr('loading'), 'lazy');
				assert.equal($img.attr('decoding'), 'async');
				assert.equal($img.attr('fetchpriority'), 'auto');
			});

			it('includes priority loading attributes', () => {
				let $img = $('#local-priority img');
				assert.equal($img.attr('loading'), 'eager');
				assert.equal($img.attr('decoding'), 'sync');
				assert.equal($img.attr('fetchpriority'), 'high');
			});

			it('has width and height - no dimensions set', () => {
				let $img = $('#local img');
				assert.equal($img.attr('width'), '2316');
				assert.equal($img.attr('height'), '1544');
			});

			it('has proper width and height - only width', () => {
				let $img = $('#local-width img');
				assert.equal($img.attr('width'), '350');
				assert.equal($img.attr('height'), '233');
			});

			it('has proper width and height - only height', () => {
				let $img = $('#local-height img');
				assert.equal($img.attr('width'), '300');
				assert.equal($img.attr('height'), '200');
			});

			it('has proper width and height - has both width and height', () => {
				let $img = $('#local-both img');
				assert.equal($img.attr('width'), '300');
				assert.equal($img.attr('height'), '400');
			});

			it('sets the style', () => {
				let $img = $('#local-both img');
				assert.match($img.attr('style'), /--w: 300/);
				assert.match($img.attr('style'), /--h: 400/);
				assert.equal($img.data('astro-image'), 'responsive');
			});

			it('sets the style when no dimensions set', () => {
				let $img = $('#local img');
				assert.match($img.attr('style'), /--w: 2316/);
				assert.match($img.attr('style'), /--h: 1544/);
				assert.equal($img.data('astro-image'), 'responsive');
			});

			it('sets style for fixed image', () => {
				let $img = $('#local-fixed img');
				assert.match($img.attr('style'), /--w: 800/);
				assert.match($img.attr('style'), /--h: 600/);
				assert.equal($img.data('astro-image'), 'fixed');
			});

			it('sets style for full-width image', () => {
				let $img = $('#local-full-width img');
				assert.equal($img.data('astro-image'), 'full-width');
			});

			it('passes in a parent class', () => {
				let $img = $('#local-class img');
				assert.equal($img.prop('class'), 'green');
			});

			it('only passes the class in once', () => {
				// Check that class="green" only appears once
				// We can't use cheerio because it normalises the DOM, so we have to use a regex
				const matches = html.match(/class="green"/g);
				assert.equal(matches.length, 1);
			});

			it('passes in a parent style', () => {
				let $img = $('#local-style img');
				assert.match($img.attr('style'), /border: 2px red solid/);
			});

			it('passes in a parent style as an object', () => {
				let $img = $('#local-style-object img');
				assert.match($img.attr('style'), /border:2px red solid/);
			});

			it('injects a style tag', () => {
				const style = $('style').text();
				assert.match(style, /\[data-astro-image\]/);
			});
		});
	});
});
