import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Attributes', async () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/astro-attrs/' });
		await fixture.build();
	});

	it('Passes attributes to elements as expected', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		const attrs = {
			'boolean-attr-true': { attribute: 'allowfullscreen', value: '' },
			'boolean-attr-false': { attribute: 'allowfullscreen', value: undefined },
			'boolean-attr-string-truthy': { attribute: 'allowfullscreen', value: '' },
			'boolean-attr-string-falsy': { attribute: 'allowfullscreen', value: undefined },
			'boolean-attr-number-truthy': { attribute: 'allowfullscreen', value: '' },
			'boolean-attr-number-falsy': { attribute: 'allowfullscreen', value: undefined },
			'data-attr-true': { attribute: 'data-foobar', value: 'true' },
			'data-attr-false': { attribute: 'data-foobar', value: 'false' },
			'data-attr-string-truthy': { attribute: 'data-foobar', value: 'foo' },
			'data-attr-string-falsy': { attribute: 'data-foobar', value: '' },
			'data-attr-number-truthy': { attribute: 'data-foobar', value: '1' },
			'data-attr-number-falsy': { attribute: 'data-foobar', value: '0' },
			'normal-attr-true': { attribute: 'foobar', value: 'true' },
			'normal-attr-false': { attribute: 'foobar', value: 'false' },
			'normal-attr-string-truthy': { attribute: 'foobar', value: 'foo' },
			'normal-attr-string-falsy': { attribute: 'foobar', value: '' },
			'normal-attr-number-truthy': { attribute: 'foobar', value: '1' },
			'normal-attr-number-falsy': { attribute: 'foobar', value: '0' },
			null: { attribute: 'attr', value: undefined },
			undefined: { attribute: 'attr', value: undefined },
			'html-enum': { attribute: 'draggable', value: 'true' },
			'html-enum-true': { attribute: 'draggable', value: 'true' },
			'html-enum-false': { attribute: 'draggable', value: 'false' },
		};

		assert.ok(!/allowfullscreen=/.test(html), 'boolean attributes should not have values');
		assert.ok(
			!/id="data-attr-string-falsy"\s+data-foobar=/.test(html),
			"data attributes should not have values if it's an empty string",
		);
		assert.ok(
			!/id="normal-attr-string-falsy"\s+data-foobar=/.test(html),
			"normal attributes should not have values if it's an empty string",
		);

		// cheerio will unescape the values, so checking that the url rendered unescaped to begin with has to be done manually
		assert.equal(
			html.includes('https://example.com/api/og?title=hello&description=somedescription'),
			true,
		);

		// cheerio will unescape the values, so checking that the url rendered unescaped to begin with has to be done manually
		assert.equal(
			html.includes('cmd: echo &#34;foo&#34; &#38;&#38; echo &#34;bar&#34; > /tmp/hello.txt'),
			true,
		);

		for (const id of Object.keys(attrs)) {
			const { attribute, value } = attrs[id];
			const attr = $(`#${id}`).attr(attribute);
			assert.equal(attr, value, `Expected ${attribute} to be ${value} for #${id}`);
		}
	});

	it('Passes boolean attributes to components as expected', async () => {
		const html = await fixture.readFile('/component/index.html');
		const $ = cheerio.load(html);

		assert.equal($('#true').attr('attr'), 'attr-true');
		assert.equal($('#true').attr('type'), 'boolean');
		assert.equal($('#false').attr('attr'), 'attr-false');
		assert.equal($('#false').attr('type'), 'boolean');
	});

	it('Passes namespaced attributes as expected', async () => {
		const html = await fixture.readFile('/namespaced/index.html');
		const $ = cheerio.load(html);

		assert.equal($('div').attr('xmlns:happy'), 'https://example.com/schemas/happy');
		assert.equal($('img').attr('happy:smile'), 'sweet');
	});

	it('Passes namespaced attributes to components as expected', async () => {
		const html = await fixture.readFile('/namespaced-component/index.html');
		const $ = cheerio.load(html);

		assert.deepEqual($('span').attr('on:click'), '(event) => console.log(event)');
	});
});
