import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { isWindows, loadFixture } from '../../../astro/test/test-utils.js';

let fixture;

describe('React Components', () => {
	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/react-component/', import.meta.url),
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('Can load React', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);

			// test 1: basic component renders
			assert.equal($('#react-static').text(), 'Hello static!');

			// test 2: no reactroot
			assert.equal($('#react-static').attr('data-reactroot'), undefined);

			// test 3: Can use function components
			assert.equal($('#arrow-fn-component').length, 1);

			// test 4: Can use spread for components
			assert.equal($('#component-spread-props').length, 1);

			// test 5: spread props renders
			assert.equal($('#component-spread-props').text(), 'Hello world!');

			// test 6: Can use TS components
			assert.equal($('.ts-component').length, 1);

			// test 7: Can use Pure components
			assert.equal($('#pure').length, 1);

			// test 8: Check number of islands
			assert.equal($('astro-island[uid]').length, 9);

			// test 9: Check island deduplication
			const uniqueRootUIDs = new Set($('astro-island').map((_i, el) => $(el).attr('uid')));
			assert.equal(uniqueRootUIDs.size, 8);

			// test 10: Should properly render children passed as props
			const islandsWithChildren = $('.with-children');
			assert.equal(islandsWithChildren.length, 2);
			assert.equal(
				$(islandsWithChildren[0]).html(),
				$(islandsWithChildren[1]).find('astro-slot').html(),
			);

			// test 11: Should generate unique React.useId per island
			const islandsWithId = $('.react-use-id');
			assert.equal(islandsWithId.length, 2);
			assert.notEqual($(islandsWithId[0]).attr('id'), $(islandsWithId[1]).attr('id'));
		});

		it('Can load Vue', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('#vue-h2').text(), 'Hasta la vista, baby');
		});

		it('Can use a pragma comment', async () => {
			const html = await fixture.readFile('/pragma-comment/index.html');
			const $ = cheerioLoad(html);

			// test 1: rendered the PragmaComment component
			assert.equal($('.pragma-comment').length, 2);
		});

		// TODO: is this still a relevant test?
		it.skip('Includes reactroot on hydrating components', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);

			const div = $('#research');

			// test 1: has the hydration attr
			assert.ok(div.attr('data-reactroot'));

			// test 2: renders correctly
			assert.equal(div.html(), 'foo bar <!-- -->1');
		});

		it('Can load Suspense-using components', async () => {
			const html = await fixture.readFile('/suspense/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('#client #lazy').length, 1);
			assert.equal($('#server #lazy').length, 1);
		});

		it('Can pass through props with cloneElement', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('#cloned').text(), 'Cloned With Props');
		});

		it('Children are parsed as React components, can be manipulated', async () => {
			const html = await fixture.readFile('/children/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('#one .with-children-count').text(), '2');
		});

		it('Client children passes option to the client', async () => {
			const html = await fixture.readFile('/children/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('[data-react-children]').length, 1);
		});
	});

	if (isWindows) return;

	describe('dev', () => {
		/** @type {import('../../../astro/test/test-utils.js').Fixture} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('scripts proxy correctly', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			for (const script of $('script').toArray()) {
				const { src } = script.attribs;
				if (!src) continue;
				assert.equal((await fixture.fetch(src)).status, 200, `404: ${src}`);
			}
		});

		// TODO: move this to separate dev test?
		it.skip('Throws helpful error message on window SSR', async () => {
			const html = await fixture.fetch('/window/index.html');
			assert.ok(
				(await html.text()).includes(
					`[/window]
			The window object is not available during server-side rendering (SSR).
			Try using \`import.meta.env.SSR\` to write SSR-friendly code.
			https://docs.astro.build/reference/api-reference/#importmeta`,
				),
			);
		});

		// In moving over to Vite, the jsx-runtime import is now obscured. TODO: update the method of finding this.
		it.skip('uses the new JSX transform', async () => {
			const html = await fixture.fetch('/index.html');

			// Grab the imports
			const exp = /import\("(.+?)"\)/g;
			let match, componentUrl;
			while ((match = exp.exec(html))) {
				if (match[1].includes('Research.js')) {
					componentUrl = match[1];
					break;
				}
			}
			const component = await fixture.readFile(componentUrl);
			const jsxRuntime = component.imports.filter((i) => i.specifier.includes('jsx-runtime'));

			// test 1: react/jsx-runtime is used for the component
			assert.ok(jsxRuntime);
		});

		it('When a nested component throws it does not crash the server', async () => {
			const res = await fixture.fetch('/error-rendering');
			await res.arrayBuffer();
		});
	});
});
