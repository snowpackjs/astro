import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

describe('Development Routing', () => {
	describe('No site config', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({ root: './fixtures/without-site-config/' });
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			assert.equal(response.status, 200);
		});

		it('200 when loading non-UTF-8 file name', async () => {
			const response = await fixture.fetch('/テスト');
			assert.equal(response.status, 200);
		});

		it('200 when loading include space file name', async () => {
			const response = await fixture.fetch('/te st');
			assert.equal(response.status, 200);
		});

		it('200 when adding search params', async () => {
			const response = await fixture.fetch('/?foo=bar');
			assert.equal(response.status, 200);
		});

		it('200 when loading non-root page', async () => {
			const response = await fixture.fetch('/another');
			assert.equal(response.status, 200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/1');
			assert.equal(response.status, 200);
		});

		it('redirects when loading double slash', async () => {
			const response = await fixture.fetch('//', { redirect: 'manual' });
			assert.equal(response.status, 301);
			assert.equal(response.headers.get('Location'), '/');
		});

		it('redirects when loading multiple slashes', async () => {
			const response = await fixture.fetch('/////', { redirect: 'manual' });
			assert.equal(response.status, 301);
			assert.equal(response.headers.get('Location'), '/');
		});

		it('does not redirect multiple internal slashes', async () => {
			const response = await fixture.fetch('/another///here', { redirect: 'manual' });
			assert.equal(response.status, 404);
		});

		it('does not redirect slashes on query params', async () => {
			const response = await fixture.fetch('/another?foo=bar///', { redirect: 'manual' });
			assert.equal(response.status, 200);
		});

		it('does redirect multiple trailing slashes with query params', async () => {
			const response = await fixture.fetch('/another///?foo=bar///', { redirect: 'manual' });
			assert.equal(response.status, 301);
			assert.equal(response.headers.get('Location'), '/another/?foo=bar///');
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/2');
			assert.equal(response.status, 404);
		});
	});

	describe('No subpath used', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-subpath-no-trailing-slash/',
				outDir: './dist-4007',
				site: 'http://example.com/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			assert.equal(response.status, 200);
		});

		it('200 when loading non-root page', async () => {
			const response = await fixture.fetch('/another');
			assert.equal(response.status, 200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/1');
			assert.equal(response.status, 200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/2');
			assert.equal(response.status, 404);
		});
	});

	describe('Subpath with trailing slash', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-subpath-no-trailing-slash/',
				outDir: './dist-4008',
				site: 'http://example.com',
				base: '/blog',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('404 when loading /', async () => {
			const response = await fixture.fetch('/');
			assert.equal(response.status, 404);
		});

		it('200 when loading subpath root', async () => {
			const response = await fixture.fetch('/blog/');
			assert.equal(response.status, 200);
		});

		it('200 when loading subpath root without trailing slash', async () => {
			const response = await fixture.fetch('/blog');
			assert.equal(response.status, 200);
		});

		it('200 when loading another page with subpath used', async () => {
			const response = await fixture.fetch('/blog/another/');
			assert.equal(response.status, 200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/blog/1/');
			assert.equal(response.status, 200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/blog/2/');
			assert.equal(response.status, 404);
		});
	});

	describe('Subpath without trailing slash', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-subpath-no-trailing-slash/',
				base: '/blog',
				outDir: './dist-4009',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('404 when loading /', async () => {
			const response = await fixture.fetch('/');
			assert.equal(response.status, 404);
		});

		it('200 when loading subpath root with trailing slash', async () => {
			const response = await fixture.fetch('/blog/');
			assert.equal(response.status, 200);
		});

		it('200 when loading subpath root without trailing slash', async () => {
			const response = await fixture.fetch('/blog');
			assert.equal(response.status, 200);
		});

		it('200 when loading another page with subpath used', async () => {
			const response = await fixture.fetch('/blog/another/');
			assert.equal(response.status, 200);
		});

		it('200 when loading dynamic route', async () => {
			const response = await fixture.fetch('/blog/1/');
			assert.equal(response.status, 200);
		});

		it('404 when loading invalid dynamic route', async () => {
			const response = await fixture.fetch('/blog/2/');
			assert.equal(response.status, 404);
		});
	});

	describe('Endpoint routes', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/with-endpoint-routes/',
				site: 'http://example.com/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /home.json', async () => {
			const response = await fixture.fetch('/home.json');
			assert.equal(response.status, 200);

			const body = await response.text().then((text) => JSON.parse(text));
			assert.equal(body.title, 'home');
		});

		it('200 when loading /thing1.json', async () => {
			const response = await fixture.fetch('/thing1.json');
			assert.equal(response.status, 200);

			const body = await response.text().then((text) => JSON.parse(text));
			assert.equal(body.slug, 'thing1');
			assert.equal(body.title, '[slug]');
		});

		it('200 when loading /thing2.json', async () => {
			const response = await fixture.fetch('/thing2.json');
			assert.equal(response.status, 200);

			const body = await response.text().then((text) => JSON.parse(text));
			assert.equal(body.slug, 'thing2');
			assert.equal(body.title, '[slug]');
		});

		it('200 when loading /data/thing3.json', async () => {
			const response = await fixture.fetch('/data/thing3.json');
			assert.equal(response.status, 200);

			const body = await response.text().then((text) => JSON.parse(text));
			assert.equal(body.slug, 'thing3');
			assert.equal(body.title, 'data [slug]');
		});

		it('200 when loading /data/thing4.json', async () => {
			const response = await fixture.fetch('/data/thing4.json');
			assert.equal(response.status, 200);

			const body = await response.text().then((text) => JSON.parse(text));
			assert.equal(body.slug, 'thing4');
			assert.equal(body.title, 'data [slug]');
		});

		it('error responses are served untouched', async () => {
			const response = await fixture.fetch('/not-ok');
			assert.equal(response.status, 404);
			assert.equal(response.headers.get('Content-Type'), 'text/plain;charset=UTF-8');
			const body = await response.text();
			assert.equal(body, 'Text from pages/not-ok.ts');
		});

		it('correct MIME type when loading /home.json (static route)', async () => {
			const response = await fixture.fetch('/home.json');
			assert.match(response.headers.get('content-type'), /application\/json/);
		});

		it('correct MIME type when loading /thing1.json (dynamic route)', async () => {
			const response = await fixture.fetch('/thing1.json');
			assert.match(response.headers.get('content-type'), /application\/json/);
		});

		it('correct MIME type when loading /images/static.svg (static image)', async () => {
			const response = await fixture.fetch('/images/static.svg');
			assert.match(response.headers.get('content-type'), /image\/svg\+xml/);
		});

		it('correct MIME type when loading /images/1.svg (dynamic image)', async () => {
			const response = await fixture.fetch('/images/1.svg');
			assert.match(response.headers.get('content-type'), /image\/svg\+xml/);
		});

		it('correct encoding when loading /images/hex.ts', async () => {
			const response = await fixture.fetch('/images/hex');
			const body = await response.arrayBuffer();
			const hex = Buffer.from(body).toString('hex', 0, 4);

			// Check if we have a PNG
			assert.equal(hex, '89504e47');
		});
	});

	describe('file format routing', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				build: {
					format: 'file',
				},
				root: './fixtures/without-site-config/',
				site: 'http://example.com/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('200 when loading /index.html', async () => {
			const response = await fixture.fetch('/index.html');
			assert.equal(response.status, 200);
		});

		it('200 when loading /base-index.html', async () => {
			const response = await fixture.fetch('/base-index.html');
			assert.equal(response.status, 200);
		});

		it('200 when loading /', async () => {
			const response = await fixture.fetch('/');
			assert.equal(response.status, 200);
		});

		it('200 when loading /テスト.html', async () => {
			const response = await fixture.fetch('/テスト.html');
			assert.equal(response.status, 200);
		});

		it('200 when loading /テスト', async () => {
			const response = await fixture.fetch('/テスト');
			assert.equal(response.status, 200);
		});

		it('200 when loading /te st.html', async () => {
			const response = await fixture.fetch('/te st.html');
			assert.equal(response.status, 200);
		});

		it('200 when loading /te st', async () => {
			const response = await fixture.fetch('/te st');
			assert.equal(response.status, 200);
		});

		it('200 when loading /another.html', async () => {
			const response = await fixture.fetch('/another.html');
			assert.equal(response.status, 200);
		});

		it('200 when loading /another', async () => {
			const response = await fixture.fetch('/another');
			assert.equal(response.status, 200);
		});

		it('200 when loading /1.html', async () => {
			const response = await fixture.fetch('/1.html');
			assert.equal(response.status, 200);
		});

		it('200 when loading /1', async () => {
			const response = await fixture.fetch('/1');
			assert.equal(response.status, 200);
		});

		it('200 when loading /html-ext/1', async () => {
			const response = await fixture.fetch('/html-ext/1');
			assert.equal(response.status, 200);
			assert.equal((await response.text()).includes('none: 1'), true);
		});

		it('200 when loading /html-ext/1.html', async () => {
			const response = await fixture.fetch('/html-ext/1.html');
			assert.equal(response.status, 200);
			assert.equal((await response.text()).includes('html: 1'), true);
		});
	});
});
