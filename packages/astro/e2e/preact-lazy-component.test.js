import { prepareTestFactory } from './shared-component-tests.js';

const { test, createTests } = prepareTestFactory(import.meta.url, {
	root: './fixtures/preact-lazy-component/',
});

const config = {
	counterComponentFilePath: './src/components/Counter.jsx',
	componentFilePath: './src/components/JSXComponent.jsx',
};

test.describe('Preact lazy components in Astro files', () => {
	createTests({
		...config,
		pageUrl: '/',
		pageSourceFilePath: './src/pages/index.astro',
	});
});

test.describe('Preact lazy components in MDX files', () => {
	createTests({
		...config,
		pageUrl: '/mdx/',
		pageSourceFilePath: './src/pages/mdx.mdx',
	});
});
