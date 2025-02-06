import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

async function getFixture(name) {
	return await loadFixture({
		root: new URL(`./fixtures/${name}/`, import.meta.url),
	});
}

describe('Markdoc - render', () => {
	describe('dev', () => {
		it('renders content - simple', async () => {
			const fixture = await getFixture('render-simple');
			const server = await fixture.startDevServer();

			const res = await fixture.fetch('/');
			const html = await res.text();

			renderSimpleChecks(html);

			await server.stop();
		});

		it('renders content - with partials', async () => {
			const fixture = await getFixture('render-partials');
			const server = await fixture.startDevServer();

			const res = await fixture.fetch('/');
			const html = await res.text();

			renderPartialsChecks(html);

			await server.stop();
		});

		it('renders content - with config', async () => {
			const fixture = await getFixture('render-with-config');
			const server = await fixture.startDevServer();

			const res = await fixture.fetch('/');
			const html = await res.text();

			renderConfigChecks(html);

			await server.stop();
		});

		it('renders content - with `render: null` in document', async () => {
			const fixture = await getFixture('render-null');
			const server = await fixture.startDevServer();

			const res = await fixture.fetch('/');
			const html = await res.text();

			renderNullChecks(html);

			await server.stop();
		});

		it('renders content - with root folder containing space', async () => {
			const fixture = await getFixture('render with-space');
			const server = await fixture.startDevServer();

			const res = await fixture.fetch('/');
			const html = await res.text();

			renderWithRootFolderContainingSpace(html);

			await server.stop();
		});
	});

	describe('build', () => {
		it('renders content - simple', async () => {
			const fixture = await getFixture('render-simple');
			await fixture.build();

			const html = await fixture.readFile('/index.html');

			renderSimpleChecks(html);
		});

		it('renders content - with partials', async () => {
			const fixture = await getFixture('render-partials');
			await fixture.build();

			const html = await fixture.readFile('/index.html');

			renderPartialsChecks(html);
		});

		it('renders content - with config', async () => {
			const fixture = await getFixture('render-with-config');
			await fixture.build();

			const html = await fixture.readFile('/index.html');

			renderConfigChecks(html);
		});

		it('renders content - with `render: null` in document', async () => {
			const fixture = await getFixture('render-null');
			await fixture.build();

			const html = await fixture.readFile('/index.html');

			renderNullChecks(html);
		});

		it('renders content - with root folder containing space', async () => {
			const fixture = await getFixture('render with-space');
			await fixture.build();

			const html = await fixture.readFile('/index.html');

			renderWithRootFolderContainingSpace(html);
		});

		it('renders content - with typographer option', async () => {
			const fixture = await getFixture('render-typographer');
			await fixture.build();

			const html = await fixture.readFile('/index.html');

			renderTypographerChecks(html);
		});
	});
});

/**
 * @param {string} html
 */
function renderNullChecks(html) {
	const { document } = parseHTML(html);
	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Post with render null');
	assert.equal(h2.parentElement?.tagName, 'BODY');
	const divWrapper = document.querySelector('.div-wrapper');
	assert.equal(divWrapper.textContent, "I'm inside a div wrapper");
}

/** @param {string} html */
function renderPartialsChecks(html) {
	const { document } = parseHTML(html);
	const top = document.querySelector('#top');
	assert.ok(top);
	const nested = document.querySelector('#nested');
	assert.ok(nested);
	const configured = document.querySelector('#configured');
	assert.ok(configured);
}

/** @param {string} html */
function renderConfigChecks(html) {
	const { document } = parseHTML(html);
	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Post with config');
	const textContent = html;

	assert.notEqual(textContent.includes('Hello'), true);
	assert.equal(textContent.includes('Hola'), true);
	assert.equal(textContent.includes('Konnichiwa'), true);

	const runtimeVariable = document.querySelector('#runtime-variable');
	assert.equal(runtimeVariable?.textContent?.trim(), 'working!');
}

/** @param {string} html */
function renderSimpleChecks(html) {
	const { document } = parseHTML(html);
	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Simple post');
	const p = document.querySelector('p');
	assert.equal(p.textContent, 'This is a simple Markdoc post.');
}

/** @param {string} html */
function renderWithRootFolderContainingSpace(html) {
	const { document } = parseHTML(html);
	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Simple post with root folder containing a space');
	const p = document.querySelector('p');
	assert.equal(p.textContent, 'This is a simple Markdoc post with root folder containing a space.');
}

/**
 * @param {string} html
 */
function renderTypographerChecks(html) {
	const { document } = parseHTML(html);

	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Typographer’s post');

	const p = document.querySelector('p');
	assert.equal(p.textContent, 'This is a post to test the “typographer” option.');
}
