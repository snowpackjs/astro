import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { isWindows, loadFixture } from '../../../astro/test/test-utils.js';

let fixture;

describe('React Production Components', () => {
	if (isWindows) return;

	before(async () => {	
		/**
		 * Ensures that the NODE_ENV is set to "production" for this runner.
		 * This is necessary to make `react` and `react-dom` use their production builds.
		 * 
		 * Note: Astro overrides the NODE_ENV during the build process. However, the `react` module 
		 * is already imported prior to this in `loadFixture`, causing the mismatch
		 */
		process.env.NODE_ENV = "production";

		fixture = await loadFixture({
			root: new URL('./fixtures/react-component/', import.meta.url),
			mode: "production"
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
			assert.equal($('astro-island[uid]').length, 10);

			// test 9: Check island deduplication
			const uniqueRootUIDs = new Set($('astro-island').map((_i, el) => $(el).attr('uid')));
			assert.equal(uniqueRootUIDs.size, 9);

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

		it('Can load Solid', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerioLoad(html);
			assert.equal($('#solid-sir').text(), 'Greetings sir!');
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
});
