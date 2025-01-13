import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { load as cheerioLoad } from 'cheerio';
import { isWindows, loadFixture } from '../../../astro/test/test-utils.js';

let fixture;

describe('React Development Components', () => {
	if (isWindows) return;

	before(async () => {
		fixture = await loadFixture({
			root: new URL('./fixtures/react-component/', import.meta.url)
		});
	});

	describe('dev', () => {
		/** @type {import('../../../astro/test/test-utils.js').Fixture} */
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('scripts proxy correctly', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			const $ = cheerioLoad(html);

			for (const script of $('script').toArray()) {
				const { src } = script.attribs;
				if (!src) continue;
				assert.equal((await fixture.fetch(src)).status, 200, `404: ${src}`);
			}
		});

		// TODO: move this to separate dev test?
		it.skip('Throws helpful error message on window SSR', async () => {
			const html = await fixture.fetch('/window/index.html');
			assert.ok(
				(await html.text()).includes(
					`[/window]
			The window object is not available during server-side rendering (SSR).
			Try using \`import.meta.env.SSR\` to write SSR-friendly code.
			https://docs.astro.build/reference/api-reference/#importmeta`,
				),
			);
		});

		// In moving over to Vite, the jsx-runtime import is now obscured. TODO: update the method of finding this.
		it.skip('uses the new JSX transform', async () => {
			const html = await fixture.fetch('/index.html');

			// Grab the imports
			const exp = /import\("(.+?)"\)/g;
			let match, componentUrl;
			while ((match = exp.exec(html))) {
				if (match[1].includes('Research.js')) {
					componentUrl = match[1];
					break;
				}
			}
			const component = await fixture.readFile(componentUrl);
			const jsxRuntime = component.imports.filter((i) => i.specifier.includes('jsx-runtime'));

			// test 1: react/jsx-runtime is used for the component
			assert.ok(jsxRuntime);
		});

		it('When a nested component throws it does not crash the server', async () => {
			const res = await fixture.fetch('/error-rendering');
			await res.arrayBuffer();
		});
	});
});
