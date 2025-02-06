import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { pathToFileURL } from 'node:url';
import { init, parse } from 'es-module-lexer';
import { resolveConfig } from 'vite';
import { compileAstro } from '../../../dist/vite-plugin-astro/compile.js';

/**
 * @param {string} source
 * @param {string} id
 */
async function compile(source, id, inlineConfig = {}) {
	const viteConfig = await resolveConfig({ configFile: false, ...inlineConfig }, 'serve');
	return await compileAstro({
		compileProps: {
			astroConfig: { root: pathToFileURL('/'), base: '/', experimental: {} },
			viteConfig,
			filename: id,
			source,
		},
		astroFileToCompileMetadata: new Map(),
	});
}

describe('astro full compile', () => {
	it('should compile a single file', async () => {
		const result = await compile(`<h1>Hello World</h1>`, '/src/components/index.astro');
		assert.ok(result.code);
	});

	it('should compile typescript', async () => {
		const result = await compile(
			`\
---
const name: string = 'world'
---

<h1>Hello {name}</h1>`,
			'/src/components/index.astro',
		);
		assert.ok(result.code);
	});

	it('should error on invalid js', async () => {
		let result;
		try {
			result = await compile(
				`\
---
const name = 'world
---

<h1>Hello {name}</h1>`,
				'/src/components/index.astro',
			);
		} catch (e) {
			assert.equal(e.message.includes('Unterminated string literal'), true);
		}
		assert.equal(result, undefined);
	});

	it('has file and url exports for markdwon compat', async () => {
		const result = await compile(`<h1>Hello World</h1>`, '/src/components/index.astro');
		await init;
		const [, exports] = parse(result.code);
		const names = exports.map((e) => e.n);
		assert.equal(names.includes('default'), true);
		assert.equal(names.includes('file'), true);
		assert.equal(names.includes('url'), true);
	});

	describe('when the code contains syntax that is transformed by esbuild', () => {
		let code = `\
---
using x = {}
---`;

		it('should not transform the syntax by default', async () => {
			const result = await compile(code, '/src/components/index.astro');
			assert.equal(result.code.includes('using x = {}'), true);
		});

		it('should transform the syntax by esbuild.target', async () => {
			const result = await compile(code, '/src/components/index.astro', {
				esbuild: { target: 'es2018' },
			});
			assert.equal(result.code.includes('using x = {}'), false);
		});
	});
});
