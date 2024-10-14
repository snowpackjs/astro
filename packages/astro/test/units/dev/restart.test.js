import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';

import {
	createContainerWithAutomaticRestart,
	startContainer,
} from '../../../dist/core/dev/index.js';
import { createFixture, createRequestAndResponse } from '../test-utils.js';

function isStarted(container) {
	return !!container.viteServer.httpServer?.listening;
}

// Checking for restarts may hang if no restarts happen, so set a 20s timeout for each test
describe('dev container restarts', { timeout: 20000 }, () => {
	it('Surfaces config errors on restarts', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `
				<html>
					<head><title>Test</title></head>
					<body>
						<h1>Test</h1>
					</body>
				</html>
			`,
			'/astro.config.mjs': `

				`,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: {
				root: fixture.path,
				vite: {
					server: {
						watch: {
							// Because we're making very quick updates, polling it more reliable here
							usePolling: true,
						},
					},
				},
			},
		});

		try {
			let r = createRequestAndResponse({
				method: 'GET',
				url: '/',
			});
			restart.container.handle(r.req, r.res);
			let html = await r.text();
			const $ = cheerio.load(html);
			assert.equal(r.res.statusCode, 200);
			assert.equal($('h1').length, 1);

			// Create an error
			let restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.mjs', 'const foo = bar');

			// Wait for the restart to finish
			console.log('waiting...');
			let hmrError = await restartComplete;
			assert.ok(hmrError instanceof Error);
			console.log('done!');

			// Do it a second time to make sure we are still watching

			restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.mjs', 'const foo = bar2');

			console.log('second waiting...');
			hmrError = await restartComplete;
			assert.ok(hmrError instanceof Error);
			console.log('second done!');
		} finally {
			console.log('cleannnn');
			await restart.container.close();
		}
	});

	it('Restarts the container if previously started', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `
				<html>
					<head><title>Test</title></head>
					<body>
						<h1>Test</h1>
					</body>
				</html>
			`,
			'/astro.config.mjs': ``,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: { root: fixture.path },
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			// Trigger a change
			let restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.mjs', '');
			await restartComplete;

			assert.equal(isStarted(restart.container), true);
		} finally {
			await restart.container.close();
		}
	});

	it('Is able to restart project using Tailwind + astro.config.ts', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': ``,
			'/astro.config.ts': ``,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: { root: fixture.path },
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			// Trigger a change
			let restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.ts', '');
			await restartComplete;

			assert.equal(isStarted(restart.container), true);
		} finally {
			await restart.container.close();
		}
	});

	it('Is able to restart project on package.json changes', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': ``,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: { root: fixture.path },
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			let restartComplete = restart.restarted();
			await fixture.writeFile('/package.json', `{}`);
			await restartComplete;
		} finally {
			await restart.container.close();
		}
	});

	it('Is able to restart on viteServer.restart API call', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': ``,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: { root: fixture.path },
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			let restartComplete = restart.restarted();
			await restart.container.viteServer.restart();
			await restartComplete;
		} finally {
			await restart.container.close();
		}
	});

	it('Is able to restart project on .astro/settings.json changes', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': ``,
			'/.astro/settings.json': `{}`,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: { root: fixture.path },
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			let restartComplete = restart.restarted();
			await fixture.writeFile('/.astro/settings.json', `{ }`);
			await restartComplete;
		} finally {
			await restart.container.close();
		}
	});
});
