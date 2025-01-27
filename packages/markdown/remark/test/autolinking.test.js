import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { createMarkdownProcessor } from '../dist/index.js';

describe('autolinking', () => {
	describe('plain md', () => {
		let processor;

		before(async () => {
			processor = await createMarkdownProcessor();
		});

		it('autolinks URLs starting with a protocol in plain text', async () => {
			const markdown = `See https://example.com for more.`;
			const { code } = await processor.render(markdown);

			assert.equal(
				code.replace(/\n/g, ''),
				`<p>See <a href="https://example.com">https://example.com</a> for more.</p>`,
			);
		});

		it('autolinks URLs starting with "www." in plain text', async () => {
			const markdown = `See www.example.com for more.`;
			const { code } = await processor.render(markdown);

			assert.equal(
				code.trim(),
				`<p>See <a href="http://www.example.com">www.example.com</a> for more.</p>`,
			);
		});

		it('does not autolink URLs in code blocks', async () => {
			const markdown = `See \`https://example.com\` or \`www.example.com\` for more.`;
			const { code } = await processor.render(markdown);

			assert.equal(
				code.trim(),
				`<p>See <code>https://example.com</code> or <code>www.example.com</code> for more.</p>`,
			);
		});
	});
});
