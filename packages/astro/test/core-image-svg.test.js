import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { Logger } from '../dist/core/logger/core.js';
import { loadFixture } from './test-utils.js';

describe('astro:assets - SVG Components', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	describe('dev', () => {
		/** @type {import('./test-utils').DevServer} */
		let devServer;
		/** @type {Array<{ type: any, level: 'error', message: string; }>} */
		let logs = [];

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-svg/',
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
			before(async () => {
				let res = await fixture.fetch('/');
				let html = await res.text();
				$ = cheerio.load(html, { xml: true });
			});
			it('Inlines the SVG by default', () => {
				const $svgs = $('.inline svg');
				assert.equal($svgs.length, 2);
				$svgs.each(function () {
					assert.equal($(this).attr('role'), 'img');
					assert.equal(!!$(this).attr('mode'), false);
					const $use = $(this).children('use');
					assert.equal($use.length, 0);
				});
			});

			it('Adds the <svg> tag with the definition', () => {
				const $svg = $('.sprite #definition svg');
				assert.equal($svg.length, 1);
				assert.equal($svg.attr('role'), 'img');

				const $symbol = $svg.children('symbol');
				assert.equal($symbol.length, 1);
				assert.equal($symbol.attr('id').startsWith('a:'), true);

				const $use = $svg.children('use');
				assert.equal($use.length, 1);
				assert.equal($use.attr('href').startsWith('#a:'), true);
				assert.equal($use.attr('href').slice(1), $symbol.attr('id'));
			});
			it('Adds the <svg> tag that uses the definition', () => {
				let $svg = $('.sprite #reused svg');
				assert.equal($svg.length, 1);
				assert.equal($svg.attr('role'), 'img');

				const $symbol = $svg.children('symbol');
				assert.equal($symbol.length, 0);

				const definitionId = $('#definition svg symbol').attr('id');
				const $use = $svg.children('use');
				assert.equal($use.length, 1);
				assert.equal($use.attr('href').startsWith('#a:'), true);
				assert.equal($use.attr('href').slice(1), definitionId);
			});
		});

		describe('props', () => {
			describe('size', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/size');
					let html = await res.text();
					$ = cheerio.load(html, { xml: true });
				});

				it('has no height and width - no dimensions set', () => {
					let $svg = $('#base svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('height'), false);
					assert.equal(!!$svg.attr('width'), false);
				});
				it('has height and width - no dimensions set', () => {
					let $svg = $('#base-with-defaults svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '1em');
					assert.equal($svg.attr('width'), '1em');
				});
				it('has height and width - string size set', () => {
					let $svg = $('#size-string svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '32');
					assert.equal($svg.attr('width'), '32');
					assert.equal(!!$svg.attr('size'), false);
				});
				it('has height and width - number size set', () => {
					let $svg = $('#size-number svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '48');
					assert.equal($svg.attr('width'), '48');
					assert.equal(!!$svg.attr('size'), false);
				});
				it('has height and width overridden - size set', () => {
					let $svg = $('#override-attrs svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '16');
					assert.equal($svg.attr('width'), '16');
					assert.equal(!!$svg.attr('size'), false);
				});
				it('has unchanged width - size set', () => {
					let $svg = $('#ignore-size-for-width svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '1em');
					assert.equal($svg.attr('width'), '24');
					assert.equal(!!$svg.attr('size'), false);
				});
				it('has unchanged height - size set', () => {
					let $svg = $('#ignore-size-for-height svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '24');
					assert.equal($svg.attr('width'), '1em');
					assert.equal(!!$svg.attr('size'), false);
				});
				it('has unchanged height and with - size set', () => {
					let $svg = $('#ignore-size svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('height'), '24');
					assert.equal($svg.attr('width'), '24');
					assert.equal(!!$svg.attr('size'), false);
				});
			});
			describe('mode', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/inline');
					let html = await res.text();
					$ = cheerio.load(html, { xml: true });
				});

				it('adds the svg into the document directly by default', () => {
					let $svg = $('#default svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('viewBox'), true);
					assert.equal($svg.attr('height'), '1em');
					assert.equal($svg.attr('width'), '1em');
					assert.equal($svg.attr('role'), 'img');
					assert.equal(!!$svg.attr('mode'), false);

					const $symbol = $svg.children('symbol');
					assert.equal($symbol.length, 0);
					const $use = $svg.children('use');
					assert.equal($use.length, 0);
					const $path = $svg.children('path');
					assert.equal($path.length, 1);
				});
				it('adds the svg into the document directly', () => {
					let $svg = $('#inline svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('viewBox'), true);
					assert.equal($svg.attr('height'), '1em');
					assert.equal($svg.attr('width'), '1em');
					assert.equal($svg.attr('role'), 'img');
					assert.equal(!!$svg.attr('mode'), false);

					const $symbol = $svg.children('symbol');
					assert.equal($symbol.length, 0);
					const $use = $svg.children('use');
					assert.equal($use.length, 0);
					const $path = $svg.children('path');
					assert.equal($path.length, 1);
				});
				it('adds the svg into the document and overrides the dimensions', () => {
					let $svg = $('#inline-with-size svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('viewBox'), true);
					assert.equal($svg.attr('height'), '24');
					assert.equal($svg.attr('width'), '24');
					assert.equal($svg.attr('role'), 'img');
					assert.equal(!!$svg.attr('mode'), false);

					const $symbol = $svg.children('symbol');
					assert.equal($symbol.length, 0);
					const $use = $svg.children('use');
					assert.equal($use.length, 0);
					const $path = $svg.children('path');
					assert.equal($path.length, 1);
				});
				it('adds the svg into the document as a sprite, overriding the default', () => {
					let $svg = $('#definition svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('viewBox'), false);
					assert.equal($svg.attr('height'), '1em');
					assert.equal($svg.attr('width'), '1em');
					assert.equal($svg.attr('role'), 'img');
					assert.equal(!!$svg.attr('mode'), false);

					let $symbol = $svg.children('symbol');
					assert.equal($symbol.length, 1);
					assert.equal(!!$symbol.attr('viewBox'), true);
					let $use = $svg.children('use');
					assert.equal($use.length, 1);
					let $path = $svg.children('path');
					assert.equal($path.length, 0);

					$svg = $('#reused svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('viewBox'), false);
					assert.equal($svg.attr('height'), '1em');
					assert.equal($svg.attr('width'), '1em');
					assert.equal($svg.attr('role'), 'img');
					assert.equal(!!$svg.attr('mode'), false);

					$symbol = $svg.children('symbol');
					assert.equal($symbol.length, 0);
					assert.equal(!!$symbol.attr('viewBox'), false);
					$use = $svg.children('use');
					assert.equal($use.length, 1);
					$path = $svg.children('path');
					assert.equal($path.length, 0);
				});
			});
			describe('title', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/title');
					let html = await res.text();
					$ = cheerio.load(html, { xml: true });
				});

				it('adds a title into the SVG', () => {
					let $svg = $('#base svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('title'), false);

					const $title = $('#base svg > title');
					assert.equal($title.length, 1);
					assert.equal($title.text(), 'GitHub Logo');
				});
			});
			describe('strip', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/strip');
					let html = await res.text();
					$ = cheerio.load(html, { xml: true });
				});

				it('removes unnecessary attributes', () => {
					let $svg = $('#base svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('xmlns'), false);
					assert.equal(!!$svg.attr('xmlns:xlink'), false);
					assert.equal(!!$svg.attr('version'), false);
				});
				it('ignores additional root level nodes', () => {
					let $svg = $('#additionalNodes');
					// Ensure we only have the svg node
					assert.equal($svg.children().length, 1);
					assert.equal($svg.children()[0].name, 'svg');
					$svg = $svg.children('svg');
					assert.equal($svg.length, 1);
					assert.equal(!!$svg.attr('xmlns'), false);
					assert.equal(!!$svg.attr('xmlns:xlink'), false);
					assert.equal(!!$svg.attr('version'), false);
				});
			});
			describe('additional props', () => {
				let $;
				before(async () => {
					let res = await fixture.fetch('/props');
					let html = await res.text();
					$ = cheerio.load(html, { xml: true });
				});

				it('adds the props to the svg', () => {
					let $svg = $('#base svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('aria-hidden'), 'true');
					assert.equal($svg.attr('id'), 'plus');
					assert.equal($svg.attr('style'), `color:red;font-size:32px`);
					assert.equal($svg.attr('class'), 'foobar');
					assert.equal($svg.attr('data-state'), 'open');

					const $symbol = $svg.children('symbol');
					assert.equal($symbol.length, 0);
					const $use = $svg.children('use');
					assert.equal($use.length, 0);
					const $path = $svg.children('path');
					assert.equal($path.length, 1);
				});
				it('allows overriding the role attribute', () => {
					let $svg = $('#role svg');
					assert.equal($svg.length, 1);
					assert.equal($svg.attr('role'), 'presentation');
				});
			});
		});

		describe('multiple', () => {
			let $;
			before(async () => {
				let res = await fixture.fetch('/multiple');
				let html = await res.text();
				$ = cheerio.load(html, { xml: true });
			});

			it('adds only one definition for each svg', () => {
				// First SVG
				let $svg = $('.one svg');
				assert.equal($svg.length, 2);
				let $symbol = $('.one svg > symbol');
				assert.equal($symbol.length, 1);
				let $use = $('.one svg > use');
				assert.equal($use.length, 2);
				const defId = $('.one.def svg > symbol').attr('id');
				const useId = $('.one.use svg > use').attr('href').replace('#', '');
				assert.ok(defId);
				assert.equal(defId, useId);

				// Second SVG
				$svg = $('.two svg');
				assert.equal($svg.length, 2);
				$symbol = $('.two svg > symbol');
				assert.equal($symbol.length, 1);
				$use = $('.two svg > use');
				assert.equal($use.length, 2);
				const defId2 = $('.two.def svg > symbol').attr('id');
				const useId2 = $('.two.use svg > use').attr('href').replace('#', '');
				assert.ok(defId2);
				assert.equal(defId2, useId2);

				// Third SVG
				$svg = $('.three svg');
				assert.equal($svg.length, 1);
				$symbol = $('.three svg > symbol');
				assert.equal($symbol.length, 1);
				$use = $('.three svg > use');
				assert.equal($use.length, 1);
				const defId3 = $('.three.def svg > symbol').attr('id');
				assert.ok(defId3);

				// Assert IDs are different
				assert.equal(new Set([defId, defId2, defId3]).size, 3);
				assert.equal(new Set([useId, useId2]).size, 2);
			});
		});

		describe('markdown', () => {
			it('Adds the <svg> tag with the definition', async () => {
				let res = await fixture.fetch('/blog/basic');
				let html = await res.text();
				const $ = cheerio.load(html, { xml: true });

				const $svg = $('svg');
				assert.equal($svg.length, 1);
				assert.equal($svg.attr('role'), 'img');

				const $symbol = $svg.children('symbol');
				assert.equal($symbol.length, 0);
				const $use = $svg.children('use');
				assert.equal($use.length, 0);
				const $path = $svg.children('path');
				assert.equal($path.length > 0, true);
			});
			it('Adds the <svg> tag that uses the definition', async () => {
				let res = await fixture.fetch('/blog/sprite');
				let html = await res.text();
				const $ = cheerio.load(html, { xml: true });

				const $svg = $('svg');
				assert.equal($svg.length, 2);
				$svg.each(function () {
					assert.equal($(this).attr('role'), 'img');
				});

				const definitionId = $($svg[0]).children('symbol').attr('id');

				const $reuse = $($svg[1]);
				const $symbol = $reuse.children('symbol');
				assert.equal($symbol.length, 0);

				const $use = $reuse.children('use');
				assert.equal($use.length, 1);
				assert.equal($use.attr('href').startsWith('#a:'), true);
				assert.equal($use.attr('href').slice(1), definitionId);
			});
			it('Adds the <svg> tag that applies props', async () => {
				let res = await fixture.fetch('/blog/props');
				let html = await res.text();
				const $ = cheerio.load(html, { xml: true });

				const $svg = $('svg');
				assert.equal($svg.length, 1);
				assert.equal($svg.attr('role'), 'img');
				assert.equal($svg.attr('height'), '48');
				assert.equal($svg.attr('width'), '48');
				assert.equal(!!$svg.attr('size'), false);
				assert.equal($svg.attr('class'), 'icon');
				assert.equal($svg.attr('data-icon'), 'github');
				assert.equal($svg.attr('aria-description'), 'Some description');
				assert.equal($svg.children('title').text(), 'Find out more on GitHub!');
			});
		});
	});
});
