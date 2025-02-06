import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { parseHTML } from 'linkedom';
import { loadFixture } from './test-utils.js';

describe('App Entrypoint', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint/',
		});
		await fixture.build();
	});

	it('loads during SSR', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerioLoad(html);

		// test 1: basic component renders
		assert.equal($('#foo > #bar').text(), 'works');

		// test 2: component with multiple script blocks renders and exports
		// values from non setup block correctly
		assert.equal($('#multiple-script-blocks').text(), '2 4');

		// test 3: component using generics renders
		assert.equal($('#generics').text(), 'generic');

		// test 4: component using generics and multiple script blocks renders
		assert.equal($('#generics-and-blocks').text(), '1 3!!!');
	});

	it('setup included in renderer bundle', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const island = document.querySelector('astro-island');
		const client = island.getAttribute('renderer-url');
		assert.notEqual(client, undefined);

		const js = await fixture.readFile(client);
		assert.match(js, /\w+\.component\("Bar"/g);
	});

	it('loads svg components without transforming them to assets', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const client = document.querySelector('astro-island svg');

		assert.notEqual(client, undefined);
	});
});

describe('App Entrypoint no export default (dev)', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint-no-export-default/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('loads during SSR', async () => {
		const html = await fixture.fetch('/').then((res) => res.text());
		const { document } = parseHTML(html);
		const bar = document.querySelector('#foo > #bar');
		assert.notEqual(bar, undefined);
		assert.equal(bar.textContent, 'works');
	});

	it('loads svg components without transforming them to assets', async () => {
		const html = await fixture.fetch('/').then((res) => res.text());
		const { document } = parseHTML(html);
		const client = document.querySelector('astro-island svg');

		assert.notEqual(client, undefined);
	});
});

describe('App Entrypoint no export default', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint-no-export-default/',
		});
		await fixture.build();
	});

	it('loads during SSR', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const bar = document.querySelector('#foo > #bar');
		assert.notEqual(bar, undefined);
		assert.equal(bar.textContent, 'works');
	});

	it('component not included in renderer bundle', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const island = document.querySelector('astro-island');
		const client = island.getAttribute('renderer-url');
		assert.notEqual(client, undefined);
		const js = await fixture.readFile(client);
		assert.doesNotMatch(js, /\w+\.component\("Bar"/g);
	});

	it('loads svg components without transforming them to assets', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const client = document.querySelector('astro-island svg');

		assert.notEqual(client, undefined);
	});
});

describe('App Entrypoint relative', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint-relative/',
		});
		await fixture.build();
	});

	it('loads during SSR', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const bar = document.querySelector('#foo > #bar');
		assert.notEqual(bar, undefined);
		assert.equal(bar.textContent, 'works');
	});

	it('component not included in renderer bundle', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const island = document.querySelector('astro-island');
		const client = island.getAttribute('renderer-url');
		assert.notEqual(client, undefined);

		const js = await fixture.readFile(client);
		assert.doesNotMatch(js, /\w+\.component\("Bar"/g);
	});
});

describe('App Entrypoint /src/absolute', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint-src-absolute/',
		});
		await fixture.build();
	});

	it('loads during SSR', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const bar = document.querySelector('#foo > #bar');
		assert.notEqual(bar, undefined);
		assert.equal(bar.textContent, 'works');
	});

	it('component not included in renderer bundle', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const island = document.querySelector('astro-island');
		const client = island.getAttribute('renderer-url');
		assert.notEqual(client, undefined);

		const js = await fixture.readFile(client);
		assert.doesNotMatch(js, /\w+\.component\("Bar"/g);
	});
});

describe('App Entrypoint async', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/app-entrypoint-async/',
		});
		await fixture.build();
	});

	it('loads during SSR', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerioLoad(html);

		// test 1: component before await renders
		assert.equal($('#foo > #bar').text(), 'works');

		// test 2: component after await renders
		assert.equal($('#foo > #baz').text(), 'works');
	});
});
