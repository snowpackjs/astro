import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';

import {
	createContainerWithAutomaticRestart,
	startContainer,
} from '../../../dist/core/dev/index.js';
import { createFixture, createRequestAndResponse } from '../test-utils.js';

/** @type {import('astro').AstroInlineConfig} */
const defaultInlineConfig = {
	logLevel: 'silent',
};

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
			'/astro.config.mjs': ``,
		});

		const restart = await createContainerWithAutomaticRestart({
			inlineConfig: {
				...defaultInlineConfig,
				root: fixture.path,
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
			// TODO: fix this hack
			restart.container.viteServer.watcher.emit(
				'change',
				fixture.getPath('/astro.config.mjs').replace(/\\/g, '/'),
			);

			// Wait for the restart to finish
			let hmrError = await restartComplete;
			assert.ok(hmrError instanceof Error);

			// Do it a second time to make sure we are still watching

			restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.mjs', 'const foo = bar2');
			// TODO: fix this hack
			restart.container.viteServer.watcher.emit(
				'change',
				fixture.getPath('/astro.config.mjs').replace(/\\/g, '/'),
			);

			hmrError = await restartComplete;
			assert.ok(hmrError instanceof Error);
		} finally {
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
			inlineConfig: {
				...defaultInlineConfig,
				root: fixture.path,
			},
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			// Trigger a change
			let restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.mjs', '');
			// TODO: fix this hack
			restart.container.viteServer.watcher.emit(
				'change',
				fixture.getPath('/astro.config.mjs').replace(/\\/g, '/'),
			);
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
			inlineConfig: {
				...defaultInlineConfig,
				root: fixture.path,
			},
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			// Trigger a change
			let restartComplete = restart.restarted();
			await fixture.writeFile('/astro.config.ts', '');
			// TODO: fix this hack
			restart.container.viteServer.watcher.emit(
				'change',
				fixture.getPath('/astro.config.mjs').replace(/\\/g, '/'),
			);
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
			inlineConfig: {
				...defaultInlineConfig,
				root: fixture.path,
			},
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			let restartComplete = restart.restarted();
			await fixture.writeFile('/package.json', `{}`);
			// TODO: fix this hack
			restart.container.viteServer.watcher.emit(
				'change',
				fixture.getPath('/package.json').replace(/\\/g, '/'),
			);
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
			inlineConfig: {
				...defaultInlineConfig,
				root: fixture.path,
			},
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
			inlineConfig: {
				...defaultInlineConfig,
				root: fixture.path,
			},
		});
		await startContainer(restart.container);
		assert.equal(isStarted(restart.container), true);

		try {
			let restartComplete = restart.restarted();
			await fixture.writeFile('/.astro/settings.json', `{ }`);
			// TODO: fix this hack
			restart.container.viteServer.watcher.emit(
				'change',
				fixture.getPath('/.astro/settings.json').replace(/\\/g, '/'),
			);
			await restartComplete;
		} finally {
			await restart.container.close();
		}
	});
});
