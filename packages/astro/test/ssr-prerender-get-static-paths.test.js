import assert from 'node:assert/strict';
import { after, afterEach, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('Prerender', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	describe('output: "server"', () => {
		describe('getStaticPaths - build calls', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/ssr-prerender-get-static-paths/',
					site: 'https://mysite.dev/',
					adapter: testAdapter(),
					base: '/blog',
					output: 'server',
				});
				await fixture.build();
			});

			after(async () => {
				await fixture.clean();
			});

			afterEach(() => {
				// reset the flag used by [...calledTwiceTest].astro between each test
				globalThis.isCalledOnce = false;
			});

			it('is only called once during build', () => {
				// useless expect; if build() throws in setup then this test fails
				assert.equal(true, true);
			});

			it('Astro.url sets the current pathname', async () => {
				const html = await fixture.readFile('/client/food/tacos/index.html');
				const $ = cheerio.load(html);

				assert.equal($('#props').text(), '10');
				assert.equal($('#url').text(), '/blog/food/tacos/');
			});
		});

		describe('getStaticPaths - dev calls', () => {
			let devServer;

			before(async () => {
				globalThis.isCalledOnce = false;
				devServer = await fixture.startDevServer();
			});

			afterEach(() => {
				// reset the flag used by [...calledTwiceTest].astro between each test
				globalThis.isCalledOnce = false;
			});

			after(async () => {
				await devServer.stop();
			});

			it('only calls prerender getStaticPaths once', async function () {
				// Sometimes this fail in CI as the chokidar watcher triggers an update and invalidates the route cache,
				// causing getStaticPaths to be called twice. Workaround this with 2 retries for now.
				// it was used in the original test using chai, but it's not available in the current version of node:test
				// this.retries(2);

				let res = await fixture.fetch('/blog/a');
				assert.equal(res.status, 200);

				res = await fixture.fetch('/blog/b');
				assert.equal(res.status, 200);

				res = await fixture.fetch('/blog/c');
				assert.equal(res.status, 200);
			});

			describe('404 behavior', () => {
				it('resolves 200 on matching static path - named params', async () => {
					const res = await fixture.fetch('/blog/pizza/provolone-sausage');
					assert.equal(res.status, 200);
				});

				it('resolves 404 on pattern match without static path - named params', async () => {
					const res = await fixture.fetch('/blog/pizza/provolone-pineapple');
					const html = await res.text();
					assert.equal(res.status, 404);
					assert.match(html, /404/);
				});

				it('resolves 200 on matching static path - rest params', async () => {
					const res = await fixture.fetch('/blog/pizza/grimaldis/new-york');
					assert.equal(res.status, 200);
				});

				it('resolves 404 on pattern match without static path - rest params', async () => {
					const res = await fixture.fetch('/blog/pizza/pizza-hut');
					const html = await res.text();

					assert.equal(res.status, 404);
					assert.match(html, /404/);
				});
			});

			describe('route params type validation', () => {
				it('resolves 200 on matching static path - string params', async () => {
					// route provided with { params: { year: "2022", slug: "post-2" }}
					const res = await fixture.fetch('/blog/blog/2022/post-1');
					assert.equal(res.status, 200);
				});

				it('resolves 200 on matching static path - numeric params', async () => {
					// route provided with { params: { year: 2022, slug: "post-2" }}
					const res = await fixture.fetch('/blog/blog/2022/post-2');
					assert.equal(res.status, 200);
				});
			});

			it('resolves 200 on matching static paths', async () => {
				// routes params provided for pages /posts/1, /posts/2, and /posts/3
				for (const page of [1, 2, 3]) {
					let res = await fixture.fetch(`/blog/posts/${page}`);
					assert.equal(res.status, 200);

					const html = await res.text();
					const $ = cheerio.load(html);

					const canonical = $('link[rel=canonical]');
					assert.equal(
						canonical.attr('href'),
						`https://mysite.dev/blog/posts/${page}`,
						`doesn't trim the /${page} route param`,
					);
				}
			});
		});
	});

	describe('output: "static" with server output', () => {
		describe('getStaticPaths - build calls', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/ssr-prerender-get-static-paths/',
					site: 'https://mysite.dev/',
					adapter: testAdapter(),
					base: '/blog',
					output: 'static',
					vite: {
						plugins: [vitePluginRemovePrerenderExport()],
					},
				});
				await fixture.build();
			});

			after(async () => {
				await fixture.clean();
			});

			afterEach(() => {
				// reset the flag used by [...calledTwiceTest].astro between each test
				globalThis.isCalledOnce = false;
			});

			it('is only called once during build', () => {
				// useless expect; if build() throws in setup then this test fails
				assert.equal(true, true);
			});

			it('Astro.url sets the current pathname', async () => {
				const html = await fixture.readFile('/client/food/tacos/index.html');
				const $ = cheerio.load(html);

				assert.equal($('#props').text(), '10');
				assert.equal($('#url').text(), '/blog/food/tacos/');
			});
		});

		describe('getStaticPaths - dev calls', () => {
			let devServer;

			before(async () => {
				globalThis.isCalledOnce = false;
				devServer = await fixture.startDevServer();
			});

			afterEach(() => {
				// reset the flag used by [...calledTwiceTest].astro between each test
				globalThis.isCalledOnce = false;
			});

			after(async () => {
				await devServer.stop();
			});

			it('only calls hybrid getStaticPaths once', async () => {
				let res = await fixture.fetch('/blog/a');
				assert.equal(res.status, 200);

				res = await fixture.fetch('/blog/b');
				assert.equal(res.status, 200);

				res = await fixture.fetch('/blog/c');
				assert.equal(res.status, 200);
			});

			describe('404 behavior', () => {
				it('resolves 200 on matching static path - named params', async () => {
					const res = await fixture.fetch('/blog/pizza/provolone-sausage');
					assert.equal(res.status, 200);
				});

				it('resolves 404 on pattern match without static path - named params', async () => {
					const res = await fixture.fetch('/blog/pizza/provolone-pineapple');
					const html = await res.text();
					assert.equal(res.status, 404);
					assert.match(html, /404/);
				});

				it('resolves 200 on matching static path - rest params', async () => {
					const res = await fixture.fetch('/blog/pizza/grimaldis/new-york');
					assert.equal(res.status, 200);
				});

				it('resolves 404 on pattern match without static path - rest params', async () => {
					const res = await fixture.fetch('/blog/pizza/pizza-hut');
					const html = await res.text();

					assert.equal(res.status, 404);
					assert.match(html, /404/);
				});
			});

			describe('route params type validation', () => {
				it('resolves 200 on matching static path - string params', async () => {
					// route provided with { params: { year: "2022", slug: "post-2" }}
					const res = await fixture.fetch('/blog/blog/2022/post-1');
					assert.equal(res.status, 200);
				});

				it('resolves 200 on matching static path - numeric params', async () => {
					// route provided with { params: { year: 2022, slug: "post-2" }}
					const res = await fixture.fetch('/blog/blog/2022/post-2');
					assert.equal(res.status, 200);
				});
			});

			it('resolves 200 on matching static paths', async () => {
				// routes params provided for pages /posts/1, /posts/2, and /posts/3
				for (const page of [1, 2, 3]) {
					let res = await fixture.fetch(`/blog/posts/${page}`);
					assert.equal(res.status, 200);

					const html = await res.text();
					const $ = cheerio.load(html);

					const canonical = $('link[rel=canonical]');
					assert.equal(
						canonical.attr('href'),
						`https://mysite.dev/blog/posts/${page}`,
						`doesn't trim the /${page} route param`,
					);
				}
			});
		});
	});
});

/** @returns {import('vite').Plugin} */
function vitePluginRemovePrerenderExport() {
	const EXTENSIONS = ['.astro', '.ts'];
	/** @type {import('vite').Plugin} */
	const plugin = {
		name: 'remove-prerender-export',
		transform(code, id) {
			if (!EXTENSIONS.some((ext) => id.endsWith(ext))) return;
			return code.replace(/export\s+const\s+prerender\s+=\s+true;/g, '');
		},
	};
	return {
		name: 'remove-prerender-export-injector',
		configResolved(resolved) {
			resolved.plugins.unshift(plugin);
		},
	};
}
