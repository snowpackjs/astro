import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { viteID } from '../../../dist/core/util.js';
import { getStylesForURL } from '../../../dist/vite-plugin-astro-server/css.js';

const root = new URL('../../fixtures/alias/', import.meta.url);

class TestLoader {
	constructor(modules) {
		this.modules = new Map(modules.map((m) => [m.id, m]));
	}
	getModuleById(id) {
		return this.modules.get(id);
	}
	getModulesByFile(id) {
		return this.modules.has(id) ? [this.modules.get(id)] : [];
	}
	import(id) {
		// try to normalize inline CSS requests so we can map to the existing modules value
		id = id.replace(/(\?|&)inline=?(&|$)/, (_, start, end) => (end ? start : '')).replace(/=$/, '');
		for (const mod of this.modules.values()) {
			for (const importedMod of mod.importedModules) {
				if (importedMod.id === id) {
					return importedMod.ssrModule;
				}
			}
		}
	}
}

describe('Crawling graph for CSS', () => {
	let loader;
	before(() => {
		const indexId = viteID(new URL('./src/pages/index.astro', root));
		const aboutId = viteID(new URL('./src/pages/about.astro', root));
		loader = new TestLoader([
			{
				id: indexId,
				importedModules: [
					{
						id: aboutId,
						url: aboutId,
						importers: new Set(),
					},
					{
						id: indexId + '?astro&style.css',
						url: indexId + '?astro&style.css',
						importers: new Set([{ id: indexId }]),
						ssrModule: { default: '.index {}' },
					},
				],
				importers: new Set(),
				ssrTransformResult: {
					deps: [indexId + '?astro&style.css'],
				},
			},
			{
				id: aboutId,
				importedModules: [
					{
						id: aboutId + '?astro&style.css',
						url: aboutId + '?astro&style.css',
						importers: new Set([{ id: aboutId }]),
						ssrModule: { default: '.about {}' },
					},
				],
				importers: new Set(),
				ssrTransformResult: {
					deps: [aboutId + '?astro&style.css'],
				},
			},
		]);
	});

	it("importedModules is checked against the child's importers", async () => {
		// In dev mode, HMR modules tracked are added to importedModules. We use `importers`
		// to verify that they are true importers.
		const res = await getStylesForURL(new URL('./src/pages/index.astro', root), loader);
		assert.equal(res.styles.length, 1);
	});
});
