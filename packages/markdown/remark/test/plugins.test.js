import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createMarkdownProcessor } from '../dist/index.js';

describe('plugins', () => {
	it('should be able to get file path when passing fileURL', async () => {
		let context;

		const processor = await createMarkdownProcessor({
			remarkPlugins: [
				() => {
					const transformer = (_tree, file) => {
						context = file;
					};
					return transformer;
				},
			],
		});

		await processor.render(`test`, {
			fileURL: new URL('virtual.md', import.meta.url),
		});

		assert.ok(typeof context === 'object');
		assert.equal(context.path, fileURLToPath(new URL('virtual.md', import.meta.url)));
	});
});
