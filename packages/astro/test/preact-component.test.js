import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Preact component', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/preact-component/',
		});
		await fixture.build();
	});

	it('Can load class component', async () => {
		const html = await fixture.readFile('/class/index.html');
		const $ = cheerio.load(html);

		// test 1: Can use class components
		assert.equal($('#class-component').length, 1);
	});

	it('Can load function component', async () => {
		const html = await fixture.readFile('/fn/index.html');
		const $ = cheerio.load(html);

		// test 1: Can use function components
		assert.equal($('#fn-component').length, 1);
		// test 2: Can use function components
		assert.equal($('#arrow-fn-component').length, 1);
	});

	it('Can load TS component', async () => {
		const html = await fixture.readFile('/ts-components/index.html');
		const $ = cheerio.load(html);

		// test 1: Can use TS components
		assert.equal($('.ts-component').length, 1);
	});

	it('Can use hooks', async () => {
		const html = await fixture.readFile('/hooks/index.html');
		const $ = cheerio.load(html);
		assert.equal($('#world').length, 1);
	});

	it('Can export a Fragment', async () => {
		const html = await fixture.readFile('/frag/index.html');
		const $ = cheerio.load(html);

		// test 1: nothing rendered but it didn’t throw
		assert.equal($('body').children().length, 0);
	});

	it('Can use a pragma comment', async () => {
		const html = await fixture.readFile('/pragma-comment/index.html');
		const $ = cheerio.load(html);

		// test 1: rendered the PragmaComment component
		assert.equal($('.pragma-comment').length, 1);
		assert.equal($('.pragma-comment-tsx').length, 1);
	});

	// In moving over to Vite, the jsx-runtime import is now obscured. TODO: update the method of finding this.
	it.skip('Uses the new JSX transform', async () => {
		const html = await fixture.readFile('/pragma-comment/index.html');

		// Grab the imports
		const exp = /import\("(.+?)"\)/g;
		let match, componentUrl;
		while ((match = exp.exec(html))) {
			if (match[1].includes('PragmaComment.js')) {
				componentUrl = match[1];
				break;
			}
		}
		const component = await fixture.fetch(componentUrl).then((res) => res.text());
		const jsxRuntime = component.imports.filter((i) => i.specifier.includes('jsx-runtime'));

		// test 1: preact/jsx-runtime is used for the component
		assert.ok(jsxRuntime);
	});

	it('Can use shared signals between islands', async () => {
		const html = await fixture.readFile('/signals/index.html');
		const $ = cheerio.load(html);
		assert.equal($('.preact-signal').length, 2);

		const sigs1Raw = $($('astro-island')[0]).attr('data-preact-signals');
		const sigs2Raw = $($('astro-island')[1]).attr('data-preact-signals');

		assert.notEqual(sigs1Raw, undefined);
		assert.notEqual(sigs2Raw, undefined);

		const sigs1 = JSON.parse(sigs1Raw);
		const sigs2 = JSON.parse(sigs2Raw);

		assert.notEqual(sigs1.count, undefined);
		assert.equal(sigs1.count, sigs2.count);
	});

	it('Can use signals in array', async () => {
		const html = await fixture.readFile('/signals/index.html');
		const $ = cheerio.load(html);
		const element = $('.preact-signal-array');
		assert.equal(element.length, 1);

		const sigs1Raw = $($('astro-island')[2]).attr('data-preact-signals');

		const sigs1 = JSON.parse(sigs1Raw);

		assert.deepEqual(sigs1, {
			signalsArray: [
				['p0', 1],
				['p0', 2],
				['p1', 4],
			],
		});

		assert.equal(element.find('h1').text(), "I'm not a signal 12345");
		assert.equal(element.find('p').text(), '1-1-2');
	});

	it('Can use signals in object', async () => {
		const html = await fixture.readFile('/signals/index.html');
		const $ = cheerio.load(html);
		const element = $('.preact-signal-object');
		assert.equal(element.length, 1);

		const sigs1Raw = $($('astro-island')[3]).attr('data-preact-signals');

		const sigs1 = JSON.parse(sigs1Raw);

		assert.deepEqual(sigs1, {
			signalsObject: [['p0', 'counter']],
		});

		assert.equal(element.find('h1').text(), 'I am a title');
		assert.equal(element.find('p').text(), '1');
	});

	it('Can use null props', async () => {
		const html = await fixture.readFile('/signals/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#preact-component-with-null-prop').length, 1);
	});
});
