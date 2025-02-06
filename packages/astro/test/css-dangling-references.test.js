import * as assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

const cssAssetReferenceRegExp = /_astro\/[A-Za-z\d\-]+\.[\da-f]{8}\.css/g;

describe("When Vite's preloadModule polyfill is used", async () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/css-dangling-references/',
		});
		await fixture.build();
	});

	it('there are no references to deleted CSS chunks', async () => {
		const fileNames = await fixture.readdir('/_astro/');
		const filePaths = fileNames.map((filename) => '_astro/' + filename);

		const expectations = filePaths
			.filter((filePath) => filePath.endsWith('js'))
			.map(async (filePath) => {
				const contents = await fixture.readFile(filePath);
				const cssReferences = contents.match(cssAssetReferenceRegExp);

				if (cssReferences === null) return;

				const missingReferences = cssReferences.filter((ref) => !filePaths.includes(ref));
				assert.equal(
					missingReferences.length,
					0,
					`${filePath} contains a reference to a deleted css asset: ${missingReferences}`,
				);
			});

		await Promise.all(expectations);
	});
});
