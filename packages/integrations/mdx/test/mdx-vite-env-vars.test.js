import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

describe('MDX - Vite env vars', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/mdx-vite-env-vars/', import.meta.url),
		});
		await fixture.build();
	});

	it('Avoids transforming `import.meta.env` outside JSX expressions', async () => {
		const html = await fixture.readFile('/vite-env-vars/index.html');
		const { document } = parseHTML(html);

		assert.equal(document.querySelector('h1')?.innerHTML.includes('import.meta.env.SITE'), true);
		assert.equal(document.querySelector('code')?.innerHTML.includes('import.meta.env.SITE'), true);
		assert.equal(document.querySelector('pre')?.innerHTML.includes('import.meta.env.SITE'), true);
	});
	it('Allows referencing `import.meta.env` in frontmatter', async () => {
		const { title = '' } = JSON.parse(await fixture.readFile('/frontmatter.json'));
		assert.equal(title.includes('import.meta.env.SITE'), true);
	});
	it('Transforms `import.meta.env` in {JSX expressions}', async () => {
		const html = await fixture.readFile('/vite-env-vars/index.html');
		const { document } = parseHTML(html);

		assert.equal(
			document
				.querySelector('[data-env-site]')
				?.innerHTML.includes('https://mdx-is-neat.com/blog/cool-post'),
			true,
		);
	});
	it('Transforms `import.meta.env` in variable exports', async () => {
		const html = await fixture.readFile('/vite-env-vars/index.html');
		const { document } = parseHTML(html);

		assert.equal(
			document.querySelector('[data-env-variable-exports]')?.innerHTML.includes('MODE works'),
			true,
		);
		assert.equal(
			document
				.querySelector('[data-env-variable-exports-unknown]')
				?.innerHTML.includes('exports: ""'),
			true,
		);
	});
	it('Transforms `import.meta.env` in HTML attributes', async () => {
		const html = await fixture.readFile('/vite-env-vars/index.html');
		const { document } = parseHTML(html);

		const dataAttrDump = document.querySelector('[data-env-dump]');
		assert.notEqual(dataAttrDump, null);

		assert.equal(dataAttrDump.getAttribute('data-env-prod'), 'true');
		assert.equal(dataAttrDump.getAttribute('data-env-dev'), 'false');
		assert.equal(dataAttrDump.getAttribute('data-env-base-url'), '/');
		assert.equal(dataAttrDump.getAttribute('data-env-mode'), 'production');
	});
});
