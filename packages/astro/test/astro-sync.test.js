// @ts-check
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { loadFixture } from './test-utils.js';

const createFixture = () => {
	/** @type {Awaited<ReturnType<typeof loadFixture>>} */
	let astroFixture;
	/** @type {Record<string, string>} */
	const writtenFiles = {};

	/**
	 * @param {string} path
	 */
	const getExpectedPath = (path) => fileURLToPath(new URL(path, astroFixture.config.root));

	return {
		/** @param {string} root */
		async load(root) {
			astroFixture = await loadFixture({ root });
			return astroFixture.config;
		},
		clean() {
			fs.rmSync(new URL('./.astro/', astroFixture.config.root), { force: true, recursive: true });
		},
		async whenSyncing() {
			const fsMock = {
				...fs,
				/**
				 * @param {fs.PathLike} path
				 * @param {string} contents
				 */
				writeFileSync(path, contents) {
					writtenFiles[path.toString()] = contents;
					return fs.writeFileSync(path, contents);
				},
				promises: {
					...fs.promises,
					/**
					 * @param {fs.PathLike} path
					 * @param {string} contents
					 */
					writeFile(path, contents) {
						writtenFiles[path.toString()] = contents;
						return fs.promises.writeFile(path, contents);
					},
				},
			};

			await astroFixture.sync(
				{ root: fileURLToPath(astroFixture.config.root) },
				{
					// @ts-ignore
					fs: fsMock,
				},
			);
		},
		/** @param {string} path */
		thenFileShouldExist(path) {
			assert.equal(
				writtenFiles.hasOwnProperty(getExpectedPath(path)),
				true,
				`${path} does not exist`,
			);
		},
		/**
		 * @param {string} path
		 * @param {string} content
		 * @param {string | undefined} error
		 */
		thenFileContentShouldInclude(path, content, error = undefined) {
			assert.equal(writtenFiles[getExpectedPath(path)].includes(content), true, error);
		},
		/**
		 * @param {string} path
		 * @param {string} content
		 * @param {string | undefined} error
		 */
		thenFileContentShouldNotInclude(path, content, error = undefined) {
			assert.equal(writtenFiles[getExpectedPath(path)].includes(content), false, error);
		},
		/**
		 * @param {string} path
		 */
		thenFileShouldBeValidTypescript(path) {
			try {
				const content = writtenFiles[getExpectedPath(path)];
				const result = ts.transpileModule(content, {
					compilerOptions: {
						module: ts.ModuleKind.ESNext,
					},
				});
				assert.equal(
					result.outputText,
					'',
					`${path} should be valid TypeScript. Output: ${result.outputText}`,
				);
			} catch (error) {
				assert.fail(`${path} is not valid TypeScript. Error: ${error.message}`);
			}
		},
	};
};

describe('astro sync', () => {
	/** @type {ReturnType<typeof createFixture>} */
	let fixture;
	beforeEach(async () => {
		fixture = createFixture();
	});

	it('Writes `.astro/types.d.ts`', async () => {
		await fixture.load('./fixtures/astro-basic/');
		fixture.clean();
		await fixture.whenSyncing();
		fixture.thenFileShouldExist('.astro/types.d.ts');
		fixture.thenFileContentShouldInclude(
			'.astro/types.d.ts',
			`/// <reference types="astro/client" />`,
		);
	});

	describe('Content collections', () => {
		it('Adds reference to `.astro/types.d.ts`', async () => {
			await fixture.load('./fixtures/content-collections/');
			fixture.clean();
			await fixture.whenSyncing();
			fixture.thenFileShouldExist('.astro/types.d.ts');
			fixture.thenFileContentShouldInclude(
				'.astro/types.d.ts',
				`/// <reference path="content.d.ts" />`,
			);
			fixture.thenFileShouldExist('.astro/content.d.ts');
			fixture.thenFileContentShouldInclude(
				'.astro/content.d.ts',
				`declare module 'astro:content' {`,
				'Types file does not include `astro:content` module declaration',
			);
			fixture.thenFileShouldBeValidTypescript('.astro/content.d.ts');
		});

		it('Writes types for empty collections', async () => {
			await fixture.load('./fixtures/content-collections-empty-dir/');
			fixture.clean();
			await fixture.whenSyncing();
			fixture.thenFileContentShouldInclude(
				'.astro/content.d.ts',
				`"blog": Record<string, {
  id: string;
  render(): Render[".md"];
  slug: string;
  body: string;
  collection: "blog";
  data: InferEntrySchema<"blog">;
  rendered?: RenderedContent;
  filePath?: string;`,
				'Types file does not include empty collection type',
			);
			fixture.thenFileContentShouldInclude(
				'.astro/content.d.ts',
				`"blogMeta": Record<string, {
  id: string;
  body?: string;
  collection: "blogMeta";
  data: InferEntrySchema<"blogMeta">;
  rendered?: RenderedContent;
  filePath?: string;
}>;`,
				'Types file does not include empty collection type',
			);
		});

		it('does not write individual types for entries when emulating legacy collections', async () => {
			await fixture.load('./fixtures/content-collections/');
			fixture.clean();
			await fixture.whenSyncing();
			fixture.thenFileContentShouldNotInclude('.astro/content.d.ts', 'id: "one.md"');
		});
	});

	describe('astro:env', () => {
		it('Adds reference to `.astro/types.d.ts`', async () => {
			await fixture.load('./fixtures/astro-env/');
			fixture.clean();
			await fixture.whenSyncing();
			fixture.thenFileShouldExist('.astro/types.d.ts');
			fixture.thenFileContentShouldInclude(
				'.astro/types.d.ts',
				`/// <reference path="env.d.ts" />`,
			);
			fixture.thenFileShouldExist('.astro/env.d.ts');
			fixture.thenFileContentShouldInclude(
				'.astro/env.d.ts',
				`declare module 'astro:env/client' {`,
				'Types file does not include `astro:env` module declaration',
			);
		});

		it('Does not throw if a public variable is required', async () => {
			try {
				await fixture.load('./fixtures/astro-env-required-public/');
				fixture.clean();
				await fixture.whenSyncing();
				assert.ok(true);
			} catch {
				assert.fail();
			}
		});
		it('Does not throw if a virtual module is imported in content.config.ts or import.meta.env is not loaded', async () => {
			try {
				await fixture.load('./fixtures/astro-env-content-collections/');
				fixture.clean();
				fs.writeFileSync(
					new URL('./fixtures/astro-env-content-collections/.env', import.meta.url),
					'BAR=abc',
					'utf-8',
				);
				await fixture.whenSyncing();
				assert.ok(true);
			} catch {
				assert.fail();
			}
		});
	});

	describe('astro:actions', () => {
		it('Adds reference to `.astro/types.d.ts`', async () => {
			await fixture.load('./fixtures/actions/');
			fixture.clean();
			await fixture.whenSyncing();
			fixture.thenFileShouldExist('.astro/types.d.ts');
			fixture.thenFileContentShouldInclude(
				'.astro/types.d.ts',
				`/// <reference path="actions.d.ts" />`,
			);
			fixture.thenFileShouldExist('.astro/actions.d.ts');
			fixture.thenFileContentShouldInclude(
				'.astro/actions.d.ts',
				`declare module "astro:actions" {`,
				'Types file does not include `astro:actions` module declaration',
			);
			fixture.thenFileShouldBeValidTypescript('.astro/actions.d.ts');
		});
	});
});
