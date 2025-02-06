import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from './test-utils.js';
describe('Basics', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/basics/',
		});
		await fixture.build();
	});

	it('Slots are added without the slot attribute', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);
		const bar = document.querySelector('#foo');

		assert.notEqual(bar, undefined);
		assert.equal(bar.getAttribute('slot'), null);
	});

	it('Can show images from public', async () => {
		const data = await fixture.readFile('/public/index.html');
		const { document } = parseHTML(data);
		const img = document.querySelector('img');

		assert.notEqual(img, undefined);
		assert.equal(img.getAttribute('src'), '/light_walrus.avif');
	});

	it('Should generate unique ids when using useId()', async () => {
		const data = await fixture.readFile('/index.html');
		const { document } = parseHTML(data);

		const els = document.querySelectorAll('.vue-use-id');
		assert.equal(els.length, 2);
		assert.notEqual(els[0].getAttribute('id'), els[1].getAttribute('id'));
	});
});
