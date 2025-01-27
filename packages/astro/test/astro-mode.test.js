import assert from 'node:assert/strict';
import { promises as fs, existsSync } from 'node:fs';
import { after, afterEach, before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('--mode', () => {
	/** @type {import('./test-utils.js').Fixture} */
	let fixture;
	let devDataStoreFile;
	let prodDataStoreFile;

	async function deleteDataStoreFiles() {
		await fs.unlink(devDataStoreFile).catch(() => {});
		await fs.unlink(prodDataStoreFile).catch(() => {});
	}

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/astro-mode/',
		});
		devDataStoreFile = new URL('./.astro/data-store.json', fixture.config.root);
		prodDataStoreFile = new URL('./node_modules/.astro/data-store.json', fixture.config.root);
	});

	afterEach(() => {
		// Reset so it doesn't interfere with other tests as builds below
		// will interact with env variables loaded from .env files
		delete process.env.NODE_ENV;
		// `astro:env` writes to `process.env` currently which should be avoided,
		// otherwise consecutive builds can't get the latest `.env` values. Workaround
		// here for now be resetting it.
		delete process.env.TITLE;
	});

	describe('build', () => {
		before(async () => {
			await deleteDataStoreFiles();
			await fixture.build();
		});

		it('works', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#env-mode').text(), 'production');
			assert.equal($('#env-dev').text(), 'false');
			assert.equal($('#env-prod').text(), 'true');
			assert.equal($('#env-title').text(), 'production');
			assert.equal($('#env-astro-title').text(), 'production');
		});

		it('writes data store file in the correct location', async () => {
			assert.ok(existsSync(prodDataStoreFile));
		});
	});

	describe('build --mode testing --devOutput', () => {
		before(async () => {
			await deleteDataStoreFiles();
			await fixture.build({ mode: 'testing' }, { devOutput: true });
		});

		it('works', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#env-mode').text(), 'testing');
			assert.equal($('#env-dev').text(), 'true');
			assert.equal($('#env-prod').text(), 'false');
			assert.equal($('#env-title').text(), '');
			assert.equal($('#env-astro-title').text(), 'unset');
			assert.ok;
		});

		it('writes data store file in the correct location', async () => {
			assert.ok(existsSync(prodDataStoreFile));
		});
	});

	describe('build --mode staging', () => {
		before(async () => {
			await deleteDataStoreFiles();
			await fixture.build({ mode: 'staging' });
		});

		it('works', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			assert.equal($('#env-mode').text(), 'staging');
			assert.equal($('#env-dev').text(), 'false');
			assert.equal($('#env-prod').text(), 'true');
			assert.equal($('#env-title').text(), 'staging');
			assert.equal($('#env-astro-title').text(), 'staging');
		});

		it('writes data store file in the correct location', async () => {
			assert.ok(existsSync(prodDataStoreFile));
		});
	});

	describe('dev', () => {
		/** @type {import('./test-utils.js').DevServer} */
		let devServer;
		before(async () => {
			await deleteDataStoreFiles();
			devServer = await fixture.startDevServer();
		});
		after(async () => {
			await devServer.stop();
		});

		it('works', async () => {
			const res = await fixture.fetch('/');
			assert.equal(res.status, 200);
			const html = await res.text();
			const $ = cheerio.load(html);
			assert.equal($('#env-mode').text(), 'development');
			assert.equal($('#env-dev').text(), 'true');
			assert.equal($('#env-prod').text(), 'false');
			assert.equal($('#env-title').text(), 'development');
			assert.equal($('#env-astro-title').text(), 'development');
		});

		it('writes data store file in the correct location', async () => {
			assert.ok(existsSync(devDataStoreFile));
		});
	});

	describe('dev --mode develop', () => {
		/** @type {import('./test-utils.js').DevServer} */
		let devServer;
		before(async () => {
			await deleteDataStoreFiles();
			devServer = await fixture.startDevServer({ mode: 'develop' });
		});
		after(async () => {
			await devServer.stop();
		});

		it('works', async () => {
			const res = await fixture.fetch('/');
			assert.equal(res.status, 200);
			const html = await res.text();
			const $ = cheerio.load(html);
			assert.equal($('#env-mode').text(), 'develop');
			assert.equal($('#env-dev').text(), 'true');
			assert.equal($('#env-prod').text(), 'false');
			assert.equal($('#env-title').text(), '');
			assert.equal($('#env-astro-title').text(), 'unset');
		});

		it('writes data store file in the correct location', async () => {
			assert.ok(existsSync(devDataStoreFile));
		});
	});
});
