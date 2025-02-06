/**
 * CSS test
 * Run this test first! This uses quite a bit of memory, so prefixing with `0-` helps it start and finish early,
 * rather than trying to start up when all other threads are busy and having to fight for resources
 */

import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

/** @type {import('./test-utils').Fixture} */
let fixture;

describe('CSS', function () {
	before(async () => {
		fixture = await loadFixture({ root: './fixtures/0-css/' });
	});

	// test HTML and CSS contents for accuracy
	describe('build', () => {
		let $;
		let html;
		let bundledCSS;

		before(
			async () => {
				await fixture.build();

				// get bundled CSS (will be hashed, hence DOM query)
				html = await fixture.readFile('/index.html');
				$ = cheerio.load(html);
				const bundledCSSHREF = $('link[rel=stylesheet][href^=/_astro/]').attr('href');
				bundledCSS = (await fixture.readFile(bundledCSSHREF.replace(/^\/?/, '/')))
					.replace(/\s/g, '')
					.replace('/n', '');
			},
			{
				timeout: 45000,
			},
		);

		describe('Astro Styles', () => {
			it('HTML and CSS scoped correctly', async () => {
				const el1 = $('#dynamic-class');
				const el2 = $('#dynamic-vis');
				const classes = $('#class');
				let scopedAttribute;
				for (const [key] of Object.entries(classes[0].attribs)) {
					if (/^data-astro-cid-[A-Za-z\d-]+/.test(key)) {
						// Ema: this is ugly, but for reasons that I don't want to explore, cheerio
						// lower case the hash of the attribute
						scopedAttribute = key;
					}
				}
				if (!scopedAttribute) {
					throw new Error("Couldn't find scoped attribute");
				}

				// 1. check HTML
				assert.equal(el1.attr('class'), `blue`);
				assert.equal(el2.attr('class'), `visible`);

				// 2. check CSS
				const expected = `.blue[${scopedAttribute}],.color\\:blue[${scopedAttribute}]{color:#b0e0e6}.visible[${scopedAttribute}]{display:block}`;
				assert.equal(bundledCSS.includes(expected), true);
			});

			it('Generated link tags are void elements', async () => {
				assert.notEqual(html.includes('</link>'), true);
			});

			it('No <style> skips scoping', async () => {
				// Astro component without <style> should not include scoped class
				assert.equal($('#no-scope').attr('class'), undefined);
			});

			it('Child inheritance', (_t, done) => {
				for (const [key] of Object.entries($('#passed-in')[0].attribs)) {
					if (/^data-astro-cid-[A-Za-z\d-]+/.test(key)) {
						done();
					}
				}
			});

			it('Using hydrated components adds astro-island styles', async () => {
				const inline = $('style').html();
				assert.equal(inline.includes('display:contents'), true);
			});

			it('<style lang="sass">', async () => {
				assert.match(bundledCSS, /h1\[data-astro-cid-[^{]*\{color:#90ee90\}/);
			});

			it('<style lang="scss">', async () => {
				assert.match(bundledCSS, /h1\[data-astro-cid-[^{]*\{color:#ff69b4\}/);
			});

			it('Styles through barrel files should only include used Astro scoped styles', async () => {
				const barrelHtml = await fixture.readFile('/barrel-styles/index.html');
				const barrel$ = cheerio.load(barrelHtml);
				const barrelBundledCssHref = barrel$('link[rel=stylesheet][href^=/_astro/]').attr('href');
				const style = await fixture.readFile(barrelBundledCssHref.replace(/^\/?/, '/'));
				assert.match(style, /\.comp-a\[data-astro-cid/);
				assert.match(style, /\.comp-c\{/);
				assert.doesNotMatch(style, /\.comp-b/);
			});
		});

		describe('Styles in src/', () => {
			it('.css', async () => {
				assert.match(bundledCSS, /.linked-css[^{]*\{color:gold/);
			});

			it('.sass', async () => {
				assert.match(bundledCSS, /.linked-sass[^{]*\{color:#789/);
			});

			it('.scss', async () => {
				assert.match(bundledCSS, /.linked-scss[^{]*\{color:#6b8e23/);
			});
		});

		describe('JSX', () => {
			it('.css', async () => {
				const el = $('#react-css');
				// 1. check HTML
				assert.equal(el.attr('class'), 'react-title');
				// 2. check CSS
				assert.equal(bundledCSS.includes('.react-title'), true);
			});

			it('.module.css', async () => {
				const el = $('#react-module-css');
				const classes = el.attr('class').split(' ');
				const moduleClass = classes.find((name) => /^_title_[\w-]+/.test(name));

				// 1. check HTML
				assert.equal(el.attr('class').includes(moduleClass), true);

				// 2. check CSS
				assert.match(bundledCSS, new RegExp(`.${moduleClass}[^{]*{font-family:fantasy`));
			});

			it('.sass', async () => {
				const el = $('#react-sass');

				// 1. check HTML
				assert.equal(el.attr('class').includes('react-sass-title'), true);

				// 2. check CSS
				assert.match(bundledCSS, /.react-sass-title[^{]*\{font-family:fantasy/);
			});

			it('.scss', async () => {
				const el = $('#react-scss');

				// 1. check HTML
				assert.equal(el.attr('class').includes('react-scss-title'), true);

				// 2. check CSS
				assert.match(bundledCSS, /.react-scss-title[^{]*\{font-family:fantasy/);
			});

			it('.module.sass', async () => {
				const el = $('#react-module-sass');
				const classes = el.attr('class').split(' ');
				const moduleClass = classes.find((name) => /^_title_[\w-]+/.test(name));

				// 1. check HTML
				assert.equal(el.attr('class').includes(moduleClass), true);

				// 2. check CSS
				assert.match(bundledCSS, new RegExp(`.${moduleClass}[^{]*{font-family:fantasy`));
			});

			it('.module.scss', async () => {
				const el = $('#react-module-scss');
				const classes = el.attr('class').split(' ');
				const moduleClass = classes.find((name) => /^_title_[\w-]+/.test(name));

				// 1. check HTML
				assert.equal(el.attr('class').includes(moduleClass), true);

				// 2. check CSS
				assert.match(bundledCSS, new RegExp(`.${moduleClass}[^{]*{font-family:fantasy`));
			});

			it('.module.css ordering', () => {
				const globalStyleClassIndex = bundledCSS.indexOf('.module-ordering');
				const moduleStyleClassIndex = bundledCSS.indexOf('._module_ordering');
				// css module has higher priority than global style
				assert.equal(globalStyleClassIndex > -1, true);
				assert.equal(moduleStyleClassIndex > -1, true);
				assert.equal(moduleStyleClassIndex > globalStyleClassIndex, true);
			});
		});

		describe('Vue', () => {
			it('<style>', async () => {
				const el = $('#vue-css');

				// 1. check HTML
				assert.equal(el.attr('class').includes('vue-css'), true);

				// 2. check CSS
				assert.match(bundledCSS, /.vue-css[^{]*\{font-family:cursive/);
			});

			it('<style scoped>', async () => {
				const el = $('#vue-scoped');

				// find data-v-* attribute (how Vue CSS scoping works)
				const { attribs } = el.get(0);
				const scopeId = Object.keys(attribs).find((k) => k.startsWith('data-v-'));
				assert.ok(scopeId);

				// 1. check HTML
				assert.equal(el.attr('class').includes('vue-scoped'), true);

				// 2. check CSS
				assert.equal(bundledCSS.includes(`.vue-scoped[${scopeId}]`), true);
			});

			it('<style module>', async () => {
				const el = $('#vue-modules');
				const classes = el.attr('class').split(' ');
				const moduleClass = classes.find((name) => /^_vueModules_[\w-]+/.test(name));

				// 1. check HTML
				assert.equal(el.attr('class').includes(moduleClass), true);

				// 2. check CSS
				assert.match(bundledCSS, new RegExp(`.${moduleClass}[^{]*{font-family:cursive`));
			});

			it('<style lang="sass">', async () => {
				const el = $('#vue-sass');

				// 1. check HTML
				assert.equal(el.attr('class').includes('vue-sass'), true);

				// 2. check CSS
				assert.match(bundledCSS, /.vue-sass[^{]*\{font-family:cursive/);
			});

			it('<style lang="scss">', async () => {
				const el = $('#vue-scss');

				// 1. check HTML
				assert.equal(el.attr('class').includes('vue-scss'), true);

				// 2. check CSS
				assert.match(bundledCSS, /.vue-scss[^{]*\{font-family:cursive/);
			});
		});

		describe('Svelte', () => {
			it('<style>', async () => {
				const el = $('#svelte-css');
				const classes = el.attr('class').split(' ');
				const scopedClass = classes.find(
					(name) => name !== 'svelte-css' && /^svelte-[A-Za-z\d-]+/.test(name),
				);

				// 1. check HTML
				assert.equal(el.attr('class').includes('svelte-css'), true);

				// 2. check CSS
				assert.match(
					bundledCSS,
					new RegExp(`.svelte-css.${scopedClass}[^{]*{font-family:ComicSansMS`),
				);
			});

			it('<style lang="sass">', async () => {
				const el = $('#svelte-sass');
				const classes = el.attr('class').split(' ');
				const scopedClass = classes.find(
					(name) => name !== 'svelte-sass' && /^svelte-[A-Za-z\d-]+/.test(name),
				);

				// 1. check HTML
				assert.equal(el.attr('class').includes('svelte-sass'), true);

				// 2. check CSS
				assert.match(
					bundledCSS,
					new RegExp(`.svelte-sass.${scopedClass}[^{]*{font-family:ComicSansMS`),
				);
			});

			it('<style lang="scss">', async () => {
				const el = $('#svelte-scss');
				const classes = el.attr('class').split(' ');
				const scopedClass = classes.find(
					(name) => name !== 'svelte-scss' && /^svelte-[A-Za-z\d-]+/.test(name),
				);

				// 1. check HTML
				assert.equal(el.attr('class').includes('svelte-scss'), true);

				// 2. check CSS
				assert.match(
					bundledCSS,
					new RegExp(`.svelte-scss.${scopedClass}[^{]*{font-family:ComicSansMS`),
				);
			});

			it('client:only and SSR in two pages, both should have styles', async () => {
				const onlyHtml = await fixture.readFile('/client-only-and-ssr/only/index.html');
				const $onlyHtml = cheerio.load(onlyHtml);
				const onlyHtmlCssHref = $onlyHtml('link[rel=stylesheet][href^=/_astro/]').attr('href');
				const onlyHtmlCss = await fixture.readFile(onlyHtmlCssHref.replace(/^\/?/, '/'));

				const ssrHtml = await fixture.readFile('/client-only-and-ssr/ssr/index.html');
				const $ssrHtml = cheerio.load(ssrHtml);
				const ssrHtmlCssHref = $ssrHtml('link[rel=stylesheet][href^=/_astro/]').attr('href');
				const ssrHtmlCss = await fixture.readFile(ssrHtmlCssHref.replace(/^\/?/, '/'));

				assert.equal(onlyHtmlCss.includes('.svelte-only-and-ssr'), true);
				assert.equal(ssrHtmlCss.includes('.svelte-only-and-ssr'), true);
			});
		});

		describe('Vite features', () => {
			it('.css?raw return a string', () => {
				const el = $('#css-raw');
				assert.equal(el.text(), '.foo {color: red;}');
			});
		});
	});

	// with "build" handling CSS checking, the dev tests are mostly testing the paths resolve in dev
	describe('dev', () => {
		let devServer;
		let $;

		before(async () => {
			devServer = await fixture.startDevServer();
			const html = await fixture.fetch('/').then((res) => res.text());
			$ = cheerio.load(html);
		});

		after(async () => {
			await devServer.stop();
		});

		it('resolves CSS in public/', async () => {
			const href = $('link[href="/global.css"]').attr('href');
			assert.equal((await fixture.fetch(href)).status, 200);
		});

		// Skipped until upstream fix lands
		// Our fix: https://github.com/withastro/astro/pull/2106
		// OG Vite PR: https://github.com/vitejs/vite/pull/5940
		// Next Vite PR: https://github.com/vitejs/vite/pull/5796
		it.skip('resolved imported CSS with ?url', async () => {
			const href = $('link[href$="imported-url.css"]').attr('href');
			assert.ok(href);
			assert.equal((await fixture.fetch(href)).status, 200);
		});

		it('resolves ESM style imports', async () => {
			const allInjectedStyles = $('style').text().replace(/\s*/g, '');

			assert.equal(allInjectedStyles.includes('.imported{'), true, 'styles/imported-url.css');
			assert.equal(allInjectedStyles.includes('.imported-sass{'), true, 'styles/imported-url.sass');
			assert.equal(allInjectedStyles.includes('.imported-scss{'), true, 'styles/imported-url.scss');
		});

		it('resolves Astro styles', async () => {
			const allInjectedStyles = $('style').text();

			assert.equal(allInjectedStyles.includes('.linked-css[data-astro-cid-'), true);
			assert.equal(allInjectedStyles.includes('.linked-sass[data-astro-cid-'), true);
			assert.equal(allInjectedStyles.includes('.linked-scss[data-astro-cid-'), true);
			assert.equal(allInjectedStyles.includes('.wrapper[data-astro-cid-'), true);
		});

		it('resolves Styles from React', async () => {
			const styles = [
				'ReactModules.module.css',
				'ReactModules.module.scss',
				'ReactModules.module.sass',
			];
			for (const style of styles) {
				const href = $(`style[data-vite-dev-id$="${style}"]`).attr('data-vite-dev-id');
				assert.equal((await fixture.fetch(href)).status, 200);
			}

			const allInjectedStyles = $('style').text().replace(/\s*/g, '');

			assert.equal(allInjectedStyles.includes('.react-title{'), true);
			assert.equal(allInjectedStyles.includes('.react-sass-title{'), true);
			assert.equal(allInjectedStyles.includes('.react-scss-title{'), true);
		});

		it('resolves CSS from Svelte', async () => {
			const allInjectedStyles = $('style').text();

			assert.equal(allInjectedStyles.includes('.svelte-css'), true);
			assert.equal(allInjectedStyles.includes('.svelte-sass'), true);
			assert.equal(allInjectedStyles.includes('.svelte-scss'), true);
		});

		it('resolves CSS from Vue', async () => {
			const allInjectedStyles = $('style').text().replace(/\s*/g, '');

			assert.equal(allInjectedStyles.includes('.vue-css{'), true);
			assert.equal(allInjectedStyles.includes('.vue-sass{'), true);
			assert.equal(allInjectedStyles.includes('.vue-scss{'), true);
			assert.equal(allInjectedStyles.includes('.vue-scoped[data-v-'), true);
			assert.equal(allInjectedStyles.includes('._vueModules_'), true);
		});

		it('remove unused styles from client:load components', async () => {
			const bundledAssets = await fixture.readdir('./_astro');
			// SvelteDynamic styles is already included in the main page css asset
			const unusedCssAsset = bundledAssets.find((asset) => /SvelteDynamic\..*\.css/.test(asset));
			assert.equal(unusedCssAsset, undefined, 'Found unused style ' + unusedCssAsset);

			let foundVitePreloadCSS = false;
			const bundledJS = await fixture.glob('**/*.?(m)js');
			for (const filename of bundledJS) {
				const content = await fixture.readFile(filename);
				if (content.match(/ReactDynamic\..*\.css/)) {
					foundVitePreloadCSS = filename;
				}
			}
			assert.equal(
				foundVitePreloadCSS,
				false,
				'Should not have found a preload for the dynamic CSS',
			);
		});

		it('.module.css ordering', () => {
			const globalStyleTag = $('style[data-vite-dev-id$="default.css"]');
			const moduleStyleTag = $('style[data-vite-dev-id$="ModuleOrdering.module.css"]');
			const globalStyleClassIndex = globalStyleTag.index();
			const moduleStyleClassIndex = moduleStyleTag.index();
			// css module has higher priority than global style
			assert.equal(globalStyleClassIndex > -1, true);
			assert.equal(moduleStyleClassIndex > -1, true);
			assert.equal(moduleStyleClassIndex > globalStyleClassIndex, true);
		});

		it('.css?raw return a string', () => {
			const el = $('#css-raw');
			assert.equal(el.text(), '.foo {color: red;}');
		});
	});
});
