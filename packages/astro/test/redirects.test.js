import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Astro.redirect', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;

	describe('output: "server"', () => {
		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/redirects/',
				output: 'server',
				adapter: testAdapter(),
				redirects: {
					'/api/redirect': '/test',
					'/external/redirect': 'https://example.com/',
					// for example, the real file handling the target path may be called
					// src/pages/not-verbatim/target1/[something-other-than-dynamic].astro
					'/source/[dynamic]': '/not-verbatim/target1/[dynamic]',
					// may be called src/pages/not-verbatim/target2/[abc]/[xyz].astro
					'/source/[dynamic]/[route]': '/not-verbatim/target2/[dynamic]/[route]',
					// may be called src/pages/not-verbatim/target3/[...rest].astro
					'/source/[...spread]': '/not-verbatim/target3/[...spread]',
				},
			});
			await fixture.build();
		});

		it('Returns a 302 status', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/secret');
			const response = await app.render(request);
			assert.equal(response.status, 302);
			assert.equal(response.headers.get('location'), '/login');
		});

		// ref: https://github.com/withastro/astro/pull/9287#discussion_r1420739810
		it.skip('Ignores external redirect', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/external/redirect');
			const response = await app.render(request);
			assert.equal(response.status, 404);
			assert.equal(response.headers.get('location'), null);
		});

		it('Warns when used inside a component', async () => {
			const app = await fixture.loadTestAdapterApp();
			const request = new Request('http://example.com/late');
			const response = await app.render(request);
			try {
				await response.text();
				assert.equal(false, true);
			} catch (e) {
				assert.equal(
					e.message,
					'The response has already been sent to the browser and cannot be altered.',
				);
			}
		});

		describe('Redirects config', () => {
			it('Returns the redirect', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/api/redirect');
				const response = await app.render(request);
				assert.equal(response.status, 301);
				assert.equal(response.headers.get('Location'), '/test');
			});

			it('Uses 308 for non-GET methods', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/api/redirect', {
					method: 'POST',
				});
				const response = await app.render(request);
				assert.equal(response.status, 308);
			});

			it('Forwards params to the target path - single param', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/source/x');
				const response = await app.render(request);
				assert.equal(response.headers.get('Location'), '/not-verbatim/target1/x');
			});

			it('Forwards params to the target path - multiple params', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/source/x/y');
				const response = await app.render(request);
				assert.equal(response.headers.get('Location'), '/not-verbatim/target2/x/y');
			});

			it('Forwards params to the target path - spread param', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/source/x/y/z');
				const response = await app.render(request);
				assert.equal(response.headers.get('Location'), '/not-verbatim/target3/x/y/z');
			});

			it('Forwards params to the target path - special characters', async () => {
				const app = await fixture.loadTestAdapterApp();
				const request = new Request('http://example.com/source/Las Vegas’');
				const response = await app.render(request);
				assert.equal(
					response.headers.get('Location'),
					'/not-verbatim/target1/Las%20Vegas%E2%80%99',
				);
			});
		});
	});

	describe('output: "static"', () => {
		describe('build', () => {
			before(async () => {
				process.env.STATIC_MODE = true;
				fixture = await loadFixture({
					root: './fixtures/redirects/',
					output: 'static',
					redirects: {
						'/old': '/test',
						'/': '/test',
						'/one': '/test',
						'/two': '/test',
						'/blog/[...slug]': '/articles/[...slug]',
						'/three': {
							status: 302,
							destination: '/test',
						},
						'/more/old/[dynamic]': '/more/[dynamic]',
						'/more/old/[dynamic]/[route]': '/more/[dynamic]/[route]',
						'/more/old/[...spread]': '/more/new/[...spread]',
					},
				});
				await fixture.build();
			});

			it("Minifies the HTML emitted when a page that doesn't exist is emitted", async () => {
				const html = await fixture.readFile('/old/index.html');
				assert.equal(html.includes('\n'), false);
			});

			it('Includes the meta refresh tag in Astro.redirect pages', async () => {
				const html = await fixture.readFile('/secret/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/login'), true);
			});

			it('Includes the meta noindex tag', async () => {
				const html = await fixture.readFile('/secret/index.html');
				assert.equal(html.includes('name="robots'), true);
				assert.equal(html.includes('content="noindex'), true);
			});

			it('Includes a link to the new pages for bots to follow', async () => {
				const html = await fixture.readFile('/secret/index.html');
				assert.equal(html.includes('<a href="/login">'), true);
			});

			it('Includes a canonical link', async () => {
				const html = await fixture.readFile('/secret/index.html');
				assert.equal(html.includes('<link rel="canonical" href="/login">'), true);
			});

			it('A 302 status generates a "temporary redirect" through a short delay', async () => {
				// https://developers.google.com/search/docs/crawling-indexing/301-redirects#metarefresh
				const html = await fixture.readFile('/secret/index.html');
				assert.equal(html.includes('content="2;url=/login"'), true);
			});

			it('Includes the meta refresh tag in `redirect` config pages', async () => {
				let html = await fixture.readFile('/one/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/test'), true);

				html = await fixture.readFile('/two/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/test'), true);

				html = await fixture.readFile('/three/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/test'), true);

				html = await fixture.readFile('/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/test'), true);
			});

			it('Generates page for dynamic routes', async () => {
				let html = await fixture.readFile('/blog/one/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/articles/one'), true);

				html = await fixture.readFile('/blog/two/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/articles/two'), true);
			});

			it('Generates redirect pages for redirects created by middleware', async () => {
				let html = await fixture.readFile('/middleware-redirect/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/test'), true);
			});

			it('falls back to spread rule when dynamic rules should not match', async () => {
				const html = await fixture.readFile('/more/old/welcome/world/index.html');
				assert.equal(html.includes('http-equiv="refresh'), true);
				assert.equal(html.includes('url=/more/new/welcome/world'), true);
			});
		});

		describe('dev', () => {
			/** @type {import('./test-utils.js').DevServer} */
			let devServer;
			before(async () => {
				process.env.STATIC_MODE = true;
				fixture = await loadFixture({
					root: './fixtures/redirects/',
					output: 'static',
					redirects: {
						'/one': '/',
						'/more/old/[dynamic]': '/more/[dynamic]',
						'/more/old/[dynamic]/[route]': '/more/[dynamic]/[route]',
						'/more/old/[...spread]': '/more/new/[...spread]',
					},
				});
				devServer = await fixture.startDevServer();
			});

			after(async () => {
				await devServer.stop();
			});

			it('performs simple redirects', async () => {
				let res = await fixture.fetch('/one', {
					redirect: 'manual',
				});
				assert.equal(res.status, 301);
				assert.equal(res.headers.get('Location'), '/');
			});

			it('performs dynamic redirects', async () => {
				const response = await fixture.fetch('/more/old/hello', { redirect: 'manual' });
				assert.equal(response.status, 301);
				assert.equal(response.headers.get('Location'), '/more/hello');
			});

			it('performs dynamic redirects with special characters', async () => {
				// encodeURI("/more/old/’")
				const response = await fixture.fetch('/more/old/%E2%80%99', { redirect: 'manual' });
				assert.equal(response.status, 301);
				assert.equal(response.headers.get('Location'), '/more/%E2%80%99');
			});

			it('performs dynamic redirects with multiple params', async () => {
				const response = await fixture.fetch('/more/old/hello/world', { redirect: 'manual' });
				assert.equal(response.headers.get('Location'), '/more/hello/world');
			});

			it.skip('falls back to spread rule when dynamic rules should not match', async () => {
				const response = await fixture.fetch('/more/old/welcome/world', { redirect: 'manual' });
				assert.equal(response.headers.get('Location'), '/more/new/welcome/world');
			});
		});
	});

	describe('config.build.redirects = false', () => {
		before(async () => {
			process.env.STATIC_MODE = true;
			fixture = await loadFixture({
				root: './fixtures/redirects/',
				output: 'static',
				redirects: {
					'/one': '/',
				},
				build: {
					redirects: false,
				},
			});
			await fixture.build();
		});

		it('Does not output redirect HTML for redirect routes', async () => {
			let oneHtml = undefined;
			try {
				oneHtml = await fixture.readFile('/one/index.html');
			} catch {}
			assert.equal(oneHtml, undefined);
		});

		it('Outputs redirect HTML for user routes that return a redirect response', async () => {
			let secretHtml = await fixture.readFile('/secret/index.html');
			assert.equal(secretHtml.includes('Redirecting from <code>/secret/</code>'), true);
			assert.equal(secretHtml.includes('to <code>/login</code>'), true);
		});
	});
});
