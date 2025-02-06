import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { createMarkdownProcessor } from '../dist/index.js';

describe('entities', async () => {
	let processor;

	before(async () => {
		processor = await createMarkdownProcessor();
	});

	it('should not unescape entities in regular Markdown', async () => {
		const markdown = `&lt;i&gt;This should NOT be italic&lt;/i&gt;`;
		const { code } = await processor.render(markdown);

		assert.equal(code, `<p>&#x3C;i>This should NOT be italic&#x3C;/i></p>`);
	});
});
