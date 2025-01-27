import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { extractFrontmatter, parseFrontmatter } from '../dist/index.js';

const bom = '\uFEFF';

describe('extractFrontmatter', () => {
	it('handles YAML', () => {
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

	it('handles TOML', () => {
		const toml = `\nfoo = "bar"\n`;
		assert.equal(extractFrontmatter(`+++${toml}+++`), toml);
		assert.equal(extractFrontmatter(`${bom}+++${toml}+++`), toml);
		assert.equal(extractFrontmatter(`\n+++${toml}+++`), toml);
		assert.equal(extractFrontmatter(`\n  \n+++${toml}+++`), toml);
		assert.equal(extractFrontmatter(`+++${toml}+++\ncontent`), toml);
		assert.equal(extractFrontmatter(`${bom}+++${toml}+++\ncontent`), toml);
		assert.equal(extractFrontmatter(`\n\n+++${toml}+++\n\ncontent`), toml);
		assert.equal(extractFrontmatter(`\n  \n+++${toml}+++\n\ncontent`), toml);
		assert.equal(extractFrontmatter(` +++${toml}+++`), undefined);
		assert.equal(extractFrontmatter(`+++${toml} +++`), undefined);
		assert.equal(extractFrontmatter(`text\n+++${toml}+++\n\ncontent`), undefined);
	});
});

describe('parseFrontmatter', () => {
	it('works for YAML', () => {
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

	it('works for TOML', () => {
		const toml = `\nfoo = "bar"\n`;
		assert.deepEqual(parseFrontmatter(`+++${toml}+++`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: '',
		});
		assert.deepEqual(parseFrontmatter(`${bom}+++${toml}+++`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: bom,
		});
		assert.deepEqual(parseFrontmatter(`\n+++${toml}+++`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: '\n',
		});
		assert.deepEqual(parseFrontmatter(`\n  \n+++${toml}+++`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: '\n  \n',
		});
		assert.deepEqual(parseFrontmatter(`+++${toml}+++\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: '\ncontent',
		});
		assert.deepEqual(parseFrontmatter(`${bom}+++${toml}+++\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: `${bom}\ncontent`,
		});
		assert.deepEqual(parseFrontmatter(`\n\n+++${toml}+++\n\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: '\n\n\n\ncontent',
		});
		assert.deepEqual(parseFrontmatter(`\n  \n+++${toml}+++\n\ncontent`), {
			frontmatter: { foo: 'bar' },
			rawFrontmatter: toml,
			content: '\n  \n\n\ncontent',
		});
		assert.deepEqual(parseFrontmatter(` +++${toml}+++`), {
			frontmatter: {},
			rawFrontmatter: '',
			content: ` +++${toml}+++`,
		});
		assert.deepEqual(parseFrontmatter(`+++${toml} +++`), {
			frontmatter: {},
			rawFrontmatter: '',
			content: `+++${toml} +++`,
		});
		assert.deepEqual(parseFrontmatter(`text\n+++${toml}+++\n\ncontent`), {
			frontmatter: {},
			rawFrontmatter: '',
			content: `text\n+++${toml}+++\n\ncontent`,
		});
	});

	it('frontmatter style for YAML', () => {
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

	it('frontmatter style for TOML', () => {
		const toml = `\nfoo = "bar"\n`;
		const parse1 = (style) => parseFrontmatter(`+++${toml}+++`, { frontmatter: style }).content;
		assert.deepEqual(parse1('preserve'), `+++${toml}+++`);
		assert.deepEqual(parse1('remove'), '');
		assert.deepEqual(parse1('empty-with-spaces'), `   \n           \n   `);
		assert.deepEqual(parse1('empty-with-lines'), `\n\n`);

		const parse2 = (style) =>
			parseFrontmatter(`\n  \n+++${toml}+++\n\ncontent`, { frontmatter: style }).content;
		assert.deepEqual(parse2('preserve'), `\n  \n+++${toml}+++\n\ncontent`);
		assert.deepEqual(parse2('remove'), '\n  \n\n\ncontent');
		assert.deepEqual(parse2('empty-with-spaces'), `\n  \n   \n           \n   \n\ncontent`);
		assert.deepEqual(parse2('empty-with-lines'), `\n  \n\n\n\n\ncontent`);
	});
});
