import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Dev reroute', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/reroute/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should render the index page when navigating /reroute ', async () => {
		const html = await fixture.fetch('/reroute').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating /blog/hello ', async () => {
		const html = await fixture.fetch('/blog/hello').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating /blog/salut ', async () => {
		const html = await fixture.fetch('/blog/salut').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating dynamic route /dynamic/[id] ', async () => {
		const html = await fixture.fetch('/dynamic/hello').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating spread route /spread/[...spread] ', async () => {
		const html = await fixture.fetch('/spread/hello').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should return a 404', async () => {
		const response = await fixture.fetch('/blog/oops');

		assert.equal(response.status, 404);
	});
});

describe('Dev rewrite, trailing slash -> never', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-trailing-slash-never/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should rewrite to the homepage', async () => {
		const html = await fixture.fetch('/foo').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});
});

describe('Dev rewrite, trailing slash -> never, with base', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-trailing-slash-never/',
			base: 'base',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should rewrite to the homepage', async () => {
		const html = await fixture.fetch('/base/foo').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});
});

describe('Dev rewrite, dynamic routing', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-dynamic-routing/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should decode the escaped characters in the URL', async () => {
		const html = await fixture.fetch('/foo').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should decode the escaped characters in the params', async () => {
		const html = await fixture.fetch('/bar').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});
});

describe('Dev rewrite, hybrid/server', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-server/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should rewrite the [slug]/title ', async () => {
		const html = await fixture.fetch('/').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.match($('h1').text(), /Title/);
		assert.match($('p').text(), /some-slug/);
	});

	it('should display an error if a rewrite is attempted after the body has been consumed', async () => {
		const formData = new FormData();
		formData.append('email', 'example@example.com');

		const request = new Request('http://example.com/post/post-body-used', {
			method: 'POST',
			body: formData,
		});
		const response = await fixture.fetch('/post/post-body-used', request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.equal($('title').text(), 'RewriteWithBodyUsed');
	});

	it('should error when rewriting from a SSR route to a SSG route', async () => {
		const html = await fixture.fetch('/forbidden/dynamic').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.match($('title').text(), /ForbiddenRewrite/);
	});
});

describe('Build reroute', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/reroute/',
		});
		await fixture.build();
	});

	it('should create the index page when navigating /reroute ', async () => {
		const html = await fixture.readFile('/reroute/index.html');
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should create the index page when navigating /blog/hello ', async () => {
		const html = await fixture.readFile('/blog/hello/index.html');
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should create the index page when navigating /blog/salut ', async () => {
		const html = await fixture.readFile('/blog/salut/index.html');

		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should create the index page when navigating dynamic route /dynamic/[id] ', async () => {
		const html = await fixture.readFile('/dynamic/hello/index.html');
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should create the index page when navigating spread route /spread/[...spread] ', async () => {
		const html = await fixture.readFile('/spread/hello/index.html');
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should create the 404 built-in page', async () => {
		try {
			await fixture.readFile('/spread/oops/index.html');
			assert.fail('Not found');
		} catch {
			assert.ok;
		}
	});
});

describe('SSR route', () => {
	it("should not build if a user tries to use rewrite('/404') in static pages", async () => {
		try {
			const fixture = await loadFixture({
				root: './fixtures/rewrite-404-invalid/',
			});
			await fixture.build();
			assert.fail('It should fail.');
		} catch {
			// it passes
			assert.equal(true, true);
		}
	});
});

describe('SSR reroute', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/reroute/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should render the index page when navigating /reroute ', async () => {
		const request = new Request('http://example.com/reroute');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating /blog/hello ', async () => {
		const request = new Request('http://example.com/blog/hello');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating /blog/salut ', async () => {
		const request = new Request('http://example.com/blog/salut');
		const response = await app.render(request);
		const html = await response.text();

		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating dynamic route /dynamic/[id] ', async () => {
		const request = new Request('http://example.com/dynamic/hello');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the index page when navigating spread route /spread/[...spread] ', async () => {
		const request = new Request('http://example.com/spread/hello');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
	});

	it('should render the 404 built-in page', async () => {
		const request = new Request('http://example.com/blog/oops');
		const response = await app.render(request);
		assert.equal(response.status, 404);
	});

	it('should pass the POST data from one page to another', async () => {
		const request = new Request('http://example.com/post/post-a', {
			method: 'POST',
			body: JSON.stringify({
				email: 'example@example.com',
			}),
			headers: {
				'content-type': 'application/json',
			},
		});
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Post B');
		assert.match($('h2').text(), /example@example.com/);
	});
});

describe('SSR rewrite, hybrid/server', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-server/',
			output: 'server',
			adapter: testAdapter(),
		});

		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should rewrite the [slug]/title ', async () => {
		const request = new Request('http://example.com/');
		const response = await app.render(request);
		const html = await response.text();
		const $ = cheerioLoad(html);

		assert.match($('h1').text(), /Title/);
		assert.match($('p').text(), /some-slug/);
	});

	it('should return a 500 if a rewrite is attempted after the body has been read', async () => {
		const formData = new FormData();
		formData.append('email', 'example@example.com');

		const request = new Request('http://example.com/post/post-body-used', {
			method: 'POST',
			body: formData,
		});
		const response = await app.render(request);
		assert.equal(response.status, 500);
	});
});

describe('Middleware', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/reroute/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should render a locals populated in the third middleware function, because we use next("/")', async () => {
		const html = await fixture.fetch('/auth/base').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
		assert.equal($('p').text(), 'Called auth');
	});

	it('should NOT render locals populated in the third middleware function, because we use ctx.reroute("/")', async () => {
		const html = await fixture.fetch('/auth/dashboard').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Index');
		assert.equal($('p').text(), '');
	});

	it('should render the index when rewriting with params', async () => {
		const html = await fixture.fetch('/auth/params').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.match($('h1').text(), /Index/);
	});

	it('should render correctly compute the new params next("/auth/1234")', async () => {
		const html = await fixture.fetch('/auth/astro-params').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.match($('h1').text(), /Index with params/);
		assert.match($('#params').text(), /Param: 1234/);
		assert.match($('#locals').text(), /Locals: Params changed/);
	});
});

describe('Middleware with custom 404.astro and 500.astro', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-custom-404/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('The `next()` function should return a Response with status code 404', async () => {
		const html = await fixture.fetch('/about').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Custom error');
		assert.equal($('p').text(), 'Interjected');
	});

	it('The `next()` function should return a Response with status code 500', async () => {
		const html = await fixture.fetch('/about-2').then((res) => res.text());
		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Custom error');
		assert.equal($('p').text(), 'Interjected');
	});
});

describe('Runtime error, default 500', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-runtime-error/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should return a 500 status code, but not render the custom 500', async () => {
		const response = await fixture.fetch('/errors/from');
		assert.equal(response.status, 500);
		const text = await response.text();
		assert.match(text, /@vite\/client/);
	});
});

describe('Runtime error in SSR, default 500', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-runtime-error/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should return a 500 status code, but not render the custom 500', async () => {
		const request = new Request('http://example.com/errors/from');
		const response = await app.render(request);
		const text = await response.text();
		assert.equal(text, '');
	});
});

describe('Runtime error in dev, custom 500', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-runtime-error-custom500/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should render the custom 500 when rewriting a page that throws an error', async () => {
		const response = await fixture.fetch('/errors/start');
		assert.equal(response.status, 500);
		const html = await response.text();
		assert.match(html, /I am the custom 500/);
	});
});

describe('Runtime error in SSR, custom 500', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-runtime-error-custom500/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should render the custom 500 when rewriting a page that throws an error', async () => {
		const request = new Request('http://example.com/errors/start');
		const response = await app.render(request);
		const html = await response.text();

		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'I am the custom 500');
	});
});

describe('Runtime error in dev, custom 500', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-i18n-manual-routing/',
		});

		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('should return a status 200 when rewriting from the middleware to the homepage', async () => {
		const response = await fixture.fetch('/reroute');
		assert.equal(response.status, 200);
		const html = await response.text();

		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Expected http status of index page is 200');
	});
});

describe('Runtime error in SSR, custom 500', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	let app;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/rewrite-i18n-manual-routing/',
			output: 'server',
			adapter: testAdapter(),
		});
		await fixture.build();
		app = await fixture.loadTestAdapterApp();
	});

	it('should return a status 200 when rewriting from the middleware to the homepage', async () => {
		const request = new Request('http://example.com/foo');
		const response = await app.render(request);
		assert.equal(response.status, 200);
		const html = await response.text();

		const $ = cheerioLoad(html);

		assert.equal($('h1').text(), 'Expected http status of index page is 200');
	});
});
