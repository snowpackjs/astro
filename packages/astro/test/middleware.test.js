import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Middleware in DEV mode', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware space/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should render locals data', async () => {
		const html = await fixture.fetch('/').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'bar');
	});

	it('should change locals data based on URL', async () => {
		let html = await fixture.fetch('/').then((res) => res.text());
		let $ = cheerio.load(html);
		assert.equal($('p').html(), 'bar');

		html = await fixture.fetch('/lorem').then((res) => res.text());
		$ = cheerio.load(html);
		assert.equal($('p').html(), 'ipsum');
	});

	it('should call a second middleware', async () => {
		const html = await fixture.fetch('/second').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'second');
	});

	it('should successfully create a new response', async () => {
		const html = await fixture.fetch('/rewrite').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('p').html(), null);
		assert.equal($('span').html(), 'New content!!');
	});

	it('should return a new response that is a 500', async () => {
		await fixture.fetch('/broken-500').then((res) => {
			assert.equal(res.status, 500);
			return res.text();
		});
	});

	it('should successfully render a page if the middleware calls only next() and returns nothing', async () => {
		const html = await fixture.fetch('/not-interested').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'Not interested');
	});

	it("should throw an error when the middleware doesn't call next or doesn't return a response", async () => {
		const html = await fixture.fetch('/does-nothing').then((res) => res.text());
		const $ = cheerio.load(html);
		assert.equal($('title').html(), 'MiddlewareNoDataOrNextCalled');
	});

	it('should return 200 if the middleware returns a 200 Response', async () => {
		const response = await fixture.fetch('/no-route-but-200');
		assert.equal(response.status, 200);
		const html = await response.text();
		assert.match(html, /It's OK!/);
	});

	it('should allow setting cookies', async () => {
		const res = await fixture.fetch('/');
		assert.equal(res.headers.get('set-cookie'), 'foo=bar');
	});

	it('should be able to clone the response', async () => {
		const res = await fixture.fetch('/clone');
		const html = await res.text();
		assert.equal(html.includes('it works'), true);
	});

	it('should forward cookies set in a component when the middleware returns a new response', async () => {
		const res = await fixture.fetch('/return-response-cookies');
		const headers = res.headers;
		assert.notEqual(headers.get('set-cookie'), null);
	});

	describe('Integration hooks', () => {
		it('Integration middleware marked as "pre" runs', async () => {
			const res = await fixture.fetch('/integration-pre');
			const json = await res.json();
			assert.equal(json.pre, 'works');
		});

		it('Integration middleware marked as "post" runs', async () => {
			const res = await fixture.fetch('/integration-post');
			const json = await res.json();
			assert.equal(json.post, 'works');
		});
	});
});

describe('Integration hooks with no user middleware', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;
	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware-no-user-middleware/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('Integration middleware marked as "pre" runs', async () => {
		const res = await fixture.fetch('/pre');
		const json = await res.json();
		assert.equal(json.pre, 'works');
	});

	it('Integration middleware marked as "post" runs', async () => {
		const res = await fixture.fetch('/post');
		const json = await res.json();
		assert.equal(json.post, 'works');
	});

	it('Integration middleware marked as "url" runs', async () => {
		const res = await fixture.fetch('/url');
		const json = await res.json();
		assert.equal(json.post, 'works');
	});
});

describe('Middleware in PROD mode, SSG', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware-ssg/',
		});
		await fixture.build();
	});

	it('should render locals data', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'bar');
	});

	it('should change locals data based on URL', async () => {
		let html = await fixture.readFile('/index.html');
		let $ = cheerio.load(html);
		assert.equal($('p').html(), 'bar');

		html = await fixture.readFile('/second/index.html');
		$ = cheerio.load(html);
		assert.equal($('p').html(), 'second');
	});
});

describe('Middleware should not be executed or imported during', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	it('should build the project without errors', async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware-full-ssr/',
			output: 'server',
			adapter: testAdapter({}),
		});
		await fixture.build();
		assert.ok('Should build');
	});
});

describe('Middleware API in PROD mode, SSR', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let middlewarePath;
	/** @type {import('../src/core/app/index').App} */
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware space/',
			output: 'server',
			adapter: testAdapter({}),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should render locals data', async () => {
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'bar');
	});

	it('should change locals data based on URL', async () => {
		let response = await app.render(new Request('http://example.com/'));
		let html = await response.text();
		let $ = cheerio.load(html);
		assert.equal($('p').html(), 'bar');

		response = await app.render(new Request('http://example.com/lorem'));
		html = await response.text();
		$ = cheerio.load(html);
		assert.equal($('p').html(), 'ipsum');
	});

	it('should successfully redirect to another page', async () => {
		const request = new Request('http://example.com/redirect');
		const response = await app.render(request);
		assert.equal(response.status, 302);
	});

	it('should call a second middleware', async () => {
		const response = await app.render(new Request('http://example.com/second'));
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'second');
	});

	it('should successfully create a new response', async () => {
		const request = new Request('http://example.com/rewrite');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').html(), null);
		assert.equal($('span').html(), 'New content!!');
	});

	it('should return a new response that is a 500', async () => {
		const request = new Request('http://example.com/broken-500');
		const response = await app.render(request);
		assert.equal(response.status, 500);
	});

	it('should successfully render a page if the middleware calls only next() and returns nothing', async () => {
		const request = new Request('http://example.com/not-interested');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.equal($('p').html(), 'Not interested');
	});

	it("should throw an error when the middleware doesn't call next or doesn't return a response", async () => {
		const request = new Request('http://example.com/does-nothing');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerio.load(html);
		assert.notEqual($('title').html(), 'MiddlewareNoDataReturned');
	});

	it('should return 200 if the middleware returns a 200 Response', async () => {
		const request = new Request('http://example.com/no-route-but-200');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();
		assert.match(html, /It's OK!/);
	});

	it('should correctly work for API endpoints that return a Response object', async () => {
		const request = new Request('http://example.com/api/endpoint');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		assert.equal(response.headers.get('Content-Type'), 'application/json');
	});

	it('should correctly manipulate the response coming from API endpoints (not simple)', async () => {
		const request = new Request('http://example.com/api/endpoint');
		const response = await app.render(request);
		const text = await response.text();
		assert.equal(text.includes('REDACTED'), true);
	});

	it('should correctly call the middleware function for 404', async () => {
		const request = new Request('http://example.com/funky-url');
		const routeData = app.match(request);
		const response = await app.render(request, { routeData });
		const text = await response.text();
		assert.equal(text.includes('Error'), true);
		assert.equal(text.includes('bar'), true);
	});

	it('should render 500.astro when the middleware throws an error', async () => {
		const request = new Request('http://example.com/throw');
		const routeData = app.match(request);

		const response = await app.render(request, { routeData });
		assert.equal(response.status, 500);

		const text = await response.text();
		assert.equal(text.includes('<h1>There was an error rendering the page.</h1>'), true);
	});

	it('should correctly render the page even when custom headers are set in a middleware', async () => {
		const request = new Request('http://example.com/content-policy');
		const routeData = app.match(request);

		const response = await app.render(request, { routeData });
		assert.equal(response.status, 404);
		assert.equal(response.headers.get('content-type'), 'text/html');
	});

	it('can set locals for prerendered pages to use', async () => {
		const text = await fixture.readFile('/client/prerendered/index.html');
		assert.equal(text.includes('<p>yes they can!</p>'), true);
	});

	// keep this last
	it('the integration should receive the path to the middleware', async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware space/',
			output: 'server',
			build: {
				excludeMiddleware: true,
			},
			adapter: testAdapter({
				extendAdapter: {
					adapterFeatures: {
						edgeMiddleware: true,
					},
				},
				setMiddlewareEntryPoint(entryPointsOrMiddleware) {
					middlewarePath = entryPointsOrMiddleware;
				},
			}),
		});
		await fixture.build();
		assert.ok(middlewarePath);
		try {
			const path = fileURLToPath(middlewarePath);
			assert.equal(existsSync(path), true);
			const content = readFileSync(fileURLToPath(middlewarePath), 'utf-8');
			assert.equal(content.length > 0, true);
		} catch {
			assert.fail();
		}
	});
});

describe('Middleware with tailwind', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/middleware-tailwind/',
		});
		await fixture.build();
	});

	it('should correctly emit the tailwind CSS file', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);
		const bundledCSSHREF = $('link[rel=stylesheet][href^=/_astro/]').attr('href');
		const bundledCSS = (await fixture.readFile(bundledCSSHREF.replace(/^\/?/, '/')))
			.replace(/\s/g, '')
			.replace('/n', '');
		assert.equal(bundledCSS.includes('--tw'), true);
	});
});
