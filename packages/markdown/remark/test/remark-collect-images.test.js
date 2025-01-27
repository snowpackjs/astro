import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { createMarkdownProcessor } from '../dist/index.js';

describe('collect images', async () => {
	let processor;

	before(async () => {
		processor = await createMarkdownProcessor();
	});

	it('should collect inline image paths', async () => {
		const markdown = `Hello ![inline image url](./img.png)`;
		const fileURL = 'file.md';

		const {
			code,
			metadata: { imagePaths },
		} = await processor.render(markdown, { fileURL });

		assert.equal(
			code,
			'<p>Hello <img __ASTRO_IMAGE_="{&#x22;src&#x22;:&#x22;./img.png&#x22;,&#x22;alt&#x22;:&#x22;inline image url&#x22;,&#x22;index&#x22;:0}"></p>',
		);

		assert.deepEqual(imagePaths, ['./img.png']);
	});

	it('should add image paths from definition', async () => {
		const markdown = `Hello ![image ref][img-ref]\n\n[img-ref]: ./img.webp`;
		const fileURL = 'file.md';

		const { code, metadata } = await processor.render(markdown, { fileURL });

		assert.equal(
			code,
			'<p>Hello <img __ASTRO_IMAGE_="{&#x22;src&#x22;:&#x22;./img.webp&#x22;,&#x22;alt&#x22;:&#x22;image ref&#x22;,&#x22;index&#x22;:0}"></p>',
		);

		assert.deepEqual(metadata.imagePaths, ['./img.webp']);
	});
});
