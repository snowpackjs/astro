import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { compile as _compile } from '@mdx-js/mdx';
import { rehypeOptimizeStatic } from '../../dist/rehype-optimize-static.js';

/**
 * @param {string} mdxCode
 * @param {Readonly<import('@mdx-js/mdx').CompileOptions>} options
 */
async function compile(mdxCode, options) {
	const result = await _compile(mdxCode, {
		jsx: true,
		rehypePlugins: [rehypeOptimizeStatic],
		...options,
	});
	const code = result.toString();
	// Capture the returned JSX code for testing
	const jsx = /return (.+);\n\}\nexport default function MDXContent/s.exec(code)?.[1];
	if (jsx == null) throw new Error('Could not find JSX code in compiled MDX');
	return dedent(jsx);
}

function dedent(str) {
	const lines = str.split('\n');
	if (lines.length <= 1) return str;
	// Get last line indent, and dedent this amount for the other lines
	const lastLineIndent = lines[lines.length - 1].match(/^\s*/)[0].length;
	return lines.map((line, i) => (i === 0 ? line : line.slice(lastLineIndent))).join('\n');
}

describe('rehype-optimize-static', () => {
	it('works', async () => {
		const jsx = await compile(`# hello`);
		assert.equal(
			jsx,
			`\
<_components.h1 {...{
  "set:html": "hello"
}} />`,
		);
	});

	it('groups sibling nodes as a single Fragment', async () => {
		const jsx = await compile(`\
# hello

foo bar
`);
		assert.equal(
			jsx,
			`\
<Fragment set:html="<h1>hello</h1>
<p>foo bar</p>" />`,
		);
	});

	it('skips optimization of components', async () => {
		const jsx = await compile(`\
import Comp from './Comp.jsx';

# hello

This is a <Comp />
`);
		assert.equal(
			jsx,
			`\
<><Fragment set:html="<h1>hello</h1>
" /><_components.p>{"This is a "}<Comp /></_components.p></>`,
		);
	});

	it('optimizes explicit html elements', async () => {
		const jsx = await compile(`\
# hello

foo <strong>bar</strong> baz

<strong>qux</strong>
`);
		assert.equal(
			jsx,
			`\
<Fragment set:html="<h1>hello</h1>
<p>foo <strong>bar</strong> baz</p>
<strong>qux</strong>" />`,
		);
	});
});
