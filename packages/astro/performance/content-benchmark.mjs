import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { bold, cyan, dim } from 'kleur/colors';
import { loadFixture } from '../test/test-utils.js';
import { generatePosts } from './scripts/generate-posts.mjs';

// Skip nonessential remark / rehype plugins for a fair comparison.
// This includes heading ID generation, syntax highlighting, GFM, and Smartypants.
process.env.ASTRO_PERFORMANCE_BENCHMARK = true;

const extByFixture = {
	md: '.md',
	mdx: '.mdx',
	mdoc: '.mdoc',
};

async function benchmark({ fixtures, templates, numPosts }) {
	for (const fixture of fixtures) {
		const root = new URL(`./fixtures/${fixture}/`, import.meta.url);
		await generatePosts({
			postsDir: fileURLToPath(new URL('./src/content/generated/', root)),
			numPosts,
			ext: extByFixture[fixture],
			template: templates[fixture],
		});
		console.info(`[${fixture}] Generated posts`);

		const { build } = await loadFixture({
			root,
		});
		const now = performance.now();
		console.info(`[${fixture}] Building...`);
		await build();
		console.info(cyan(`[${fixture}] Built in ${bold(getTimeStat(now, performance.now()))}.`));
	}
}

// Test the build performance for content collections across multiple file types (md, mdx, mdoc)
(async function benchmarkAll() {
	try {
		const { values: flags } = parseArgs({ strict: false });
		const test = Array.isArray(flags.test)
			? flags.test
			: typeof flags.test === 'string'
				? [flags.test]
				: ['simple', 'with-astro-components', 'with-react-components'];

		const formats = Array.isArray(flags.format)
			? flags.format
			: typeof flags.format === 'string'
				? [flags.format]
				: ['md', 'mdx', 'mdoc'];

		const numPosts = flags.numPosts || 1000;

		if (test.includes('simple')) {
			const fixtures = formats;
			console.info(
				`\n${bold('Simple')} ${dim(`${numPosts} posts (${formatsToString(fixtures)})`)}`,
			);
			process.env.ASTRO_PERFORMANCE_TEST_NAME = 'simple';
			await benchmark({
				fixtures,
				templates: {
					md: 'simple.md',
					mdx: 'simple.md',
					mdoc: 'simple.md',
				},
				numPosts,
			});
		}

		if (test.includes('with-astro-components')) {
			const fixtures = formats.filter((format) => format !== 'md');
			console.info(
				`\n${bold('With Astro components')} ${dim(
					`${numPosts} posts (${formatsToString(fixtures)})`,
				)}`,
			);
			process.env.ASTRO_PERFORMANCE_TEST_NAME = 'with-astro-components';
			await benchmark({
				fixtures,
				templates: {
					mdx: 'with-astro-components.mdx',
					mdoc: 'with-astro-components.mdoc',
				},
				numPosts,
			});
		}

		if (test.includes('with-react-components')) {
			const fixtures = formats.filter((format) => format !== 'md');
			console.info(
				`\n${bold('With React components')} ${dim(
					`${numPosts} posts (${formatsToString(fixtures)})`,
				)}`,
			);
			process.env.ASTRO_PERFORMANCE_TEST_NAME = 'with-react-components';
			await benchmark({
				fixtures,
				templates: {
					mdx: 'with-react-components.mdx',
					mdoc: 'with-react-components.mdoc',
				},
				numPosts,
			});
		}
	} finally {
		process.env.ASTRO_PERFORMANCE_BENCHMARK = false;
	}
})();

function getTimeStat(timeStart, timeEnd) {
	const buildTime = timeEnd - timeStart;
	return buildTime < 750 ? `${Math.round(buildTime)}ms` : `${(buildTime / 1000).toFixed(2)}s`;
}

function formatsToString(formats) {
	return formats.join(', ');
}
