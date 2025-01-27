import mdx from '@astrojs/mdx';

import * as assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX Component', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-component/', import.meta.url),
			integrations: [mdx()],
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('supports top-level imports', async () => {
			const html = await fixture.readFile('/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('h1');
			const foo = document.querySelector('#foo');

			assert.equal(h1.textContent, 'Hello component!');
			assert.equal(foo.textContent, 'bar');
		});

		it('supports glob imports - <Component.default />', async () => {
			const html = await fixture.readFile('/glob/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-default-export] h1');
			const foo = document.querySelector('[data-default-export] #foo');

			assert.equal(h1.textContent, 'Hello component!');
			assert.equal(foo.textContent, 'bar');
		});

		it('supports glob imports - <Content />', async () => {
			const html = await fixture.readFile('/glob/index.html');
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-content-export] h1');
			const foo = document.querySelector('[data-content-export] #foo');

			assert.equal(h1.textContent, 'Hello component!');
			assert.equal(foo.textContent, 'bar');
		});

		describe('with <Fragment>', () => {
			it('supports top-level imports', async () => {
				const html = await fixture.readFile('/w-fragment/index.html');
				const { document } = parseHTML(html);

				const h1 = document.querySelector('h1');
				const p = document.querySelector('p');

				assert.equal(h1.textContent, 'MDX containing <Fragment />');
				assert.equal(p.textContent, 'bar');
			});

			it('supports glob imports - <Component.default />', async () => {
				const html = await fixture.readFile('/glob/index.html');
				const { document } = parseHTML(html);

				const h = document.querySelector('[data-default-export] [data-file="WithFragment.mdx"] h1');
				const p = document.querySelector('[data-default-export] [data-file="WithFragment.mdx"] p');

				assert.equal(h.textContent, 'MDX containing <Fragment />');
				assert.equal(p.textContent, 'bar');
			});

			it('supports glob imports - <Content />', async () => {
				const html = await fixture.readFile('/glob/index.html');
				const { document } = parseHTML(html);

				const h = document.querySelector('[data-content-export] [data-file="WithFragment.mdx"] h1');
				const p = document.querySelector('[data-content-export] [data-file="WithFragment.mdx"] p');

				assert.equal(h.textContent, 'MDX containing <Fragment />');
				assert.equal(p.textContent, 'bar');
			});
		});
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('supports top-level imports', async () => {
			const res = await fixture.fetch('/');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('h1');
			const foo = document.querySelector('#foo');

			assert.equal(h1.textContent, 'Hello component!');
			assert.equal(foo.textContent, 'bar');
		});

		it('supports glob imports - <Component.default />', async () => {
			const res = await fixture.fetch('/glob');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-default-export] h1');
			const foo = document.querySelector('[data-default-export] #foo');

			assert.equal(h1.textContent, 'Hello component!');
			assert.equal(foo.textContent, 'bar');
		});

		it('supports glob imports - <Content />', async () => {
			const res = await fixture.fetch('/glob');

			assert.equal(res.status, 200);

			const html = await res.text();
			const { document } = parseHTML(html);

			const h1 = document.querySelector('[data-content-export] h1');
			const foo = document.querySelector('[data-content-export] #foo');

			assert.equal(h1.textContent, 'Hello component!');
			assert.equal(foo.textContent, 'bar');
		});

		describe('with <Fragment>', () => {
			it('supports top-level imports', async () => {
				const res = await fixture.fetch('/w-fragment');

				assert.equal(res.status, 200);

				const html = await res.text();
				const { document } = parseHTML(html);

				const h1 = document.querySelector('h1');
				const p = document.querySelector('p');

				assert.equal(h1.textContent, 'MDX containing <Fragment />');
				assert.equal(p.textContent, 'bar');
			});

			it('supports glob imports - <Component.default />', async () => {
				const res = await fixture.fetch('/glob');

				assert.equal(res.status, 200);

				const html = await res.text();
				const { document } = parseHTML(html);

				const h = document.querySelector('[data-default-export] [data-file="WithFragment.mdx"] h1');
				const p = document.querySelector('[data-default-export] [data-file="WithFragment.mdx"] p');

				assert.equal(h.textContent, 'MDX containing <Fragment />');
				assert.equal(p.textContent, 'bar');
			});

			it('supports glob imports - <Content />', async () => {
				const res = await fixture.fetch('/glob');

				assert.equal(res.status, 200);

				const html = await res.text();
				const { document } = parseHTML(html);

				const h = document.querySelector('[data-content-export] [data-file="WithFragment.mdx"] h1');
				const p = document.querySelector('[data-content-export] [data-file="WithFragment.mdx"] p');

				assert.equal(h.textContent, 'MDX containing <Fragment />');
				assert.equal(p.textContent, 'bar');
			});
		});
	});
});
