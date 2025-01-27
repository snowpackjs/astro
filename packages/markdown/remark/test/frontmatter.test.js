import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractFrontmatter, parseFrontmatter } from '../dist/index.js';

const bom = '\uFEFF';

describe('extractFrontmatter', () => {
	it('works', () => {
		const yaml = `\nfoo: bar\n`;
		assert.equal(extractFrontmatter(`---${yaml}---`), yaml);
		assert.equal(extractFrontmatter(`${bom}---${yaml}---`), yaml);
		assert.equal(extractFrontmatter(`\n---${yaml}---`), yaml);
		assert.equal(extractFrontmatter(`\n  \n---${yaml}---`), yaml);
		assert.equal(extractFrontmatter(`---${yaml}---\ncontent`), yaml);
		assert.equal(extractFrontmatter(`${bom}---${yaml}---\ncontent`), yaml);
		assert.equal(extractFrontmatter(`\n\n---${yaml}---\n\ncontent`), yaml);
		assert.equal(extractFrontmatter(`\n  \n---${yaml}---\n\ncontent`), yaml);
		assert.equal(extractFrontmatter(` ---${yaml}---`), undefined);
		assert.equal(extractFrontmatter(`---${yaml} ---`), undefined);
		assert.equal(extractFrontmatter(`text\n---${yaml}---\n\ncontent`), undefined);
	});
});

describe('parseFrontmatter', () => {
	it('works', () => {
		const yaml = `\nfoo: bar\n`;
		assert.deepEqual(parseFrontmatter(`---${yaml}---`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: '',
		});
		assert.deepEqual(parseFrontmatter(`${bom}---${yaml}---`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: bom,
		});
		assert.deepEqual(parseFrontmatter(`\n---${yaml}---`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: '\n',
		});
		assert.deepEqual(parseFrontmatter(`\n  \n---${yaml}---`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: '\n  \n',
		});
		assert.deepEqual(parseFrontmatter(`---${yaml}---\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: '\ncontent',
		});
		assert.deepEqual(parseFrontmatter(`${bom}---${yaml}---\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: `${bom}\ncontent`,
		});
		assert.deepEqual(parseFrontmatter(`\n\n---${yaml}---\n\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: '\n\n\n\ncontent',
		});
		assert.deepEqual(parseFrontmatter(`\n  \n---${yaml}---\n\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: yaml,
			content: '\n  \n\n\ncontent',
		});
		assert.deepEqual(parseFrontmatter(` ---${yaml}---`), {
			frontmatter: {},
			rawFrontmatter: '',
			content: ` ---${yaml}---`,
		});
		assert.deepEqual(parseFrontmatter(`---${yaml} ---`), {
			frontmatter: {},
			rawFrontmatter: '',
			content: `---${yaml} ---`,
		});
		assert.deepEqual(parseFrontmatter(`text\n---${yaml}---\n\ncontent`), {
			frontmatter: {},
			rawFrontmatter: '',
			content: `text\n---${yaml}---\n\ncontent`,
		});
	});

	it('frontmatter style', () => {
		const yaml = `\nfoo: bar\n`;
		const parse1 = (style) => parseFrontmatter(`---${yaml}---`, { frontmatter: style }).content;
		assert.deepEqual(parse1('preserve'), `---${yaml}---`);
		assert.deepEqual(parse1('remove'), '');
		assert.deepEqual(parse1('empty-with-spaces'), `   \n        \n   `);
		assert.deepEqual(parse1('empty-with-lines'), `\n\n`);

		const parse2 = (style) =>
			parseFrontmatter(`\n  \n---${yaml}---\n\ncontent`, { frontmatter: style }).content;
		assert.deepEqual(parse2('preserve'), `\n  \n---${yaml}---\n\ncontent`);
		assert.deepEqual(parse2('remove'), '\n  \n\n\ncontent');
		assert.deepEqual(parse2('empty-with-spaces'), `\n  \n   \n        \n   \n\ncontent`);
		assert.deepEqual(parse2('empty-with-lines'), `\n  \n\n\n\n\ncontent`);
	});
});
