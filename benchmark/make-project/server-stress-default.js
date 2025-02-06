import fs from 'node:fs/promises';
import { loremIpsum } from './_util.js';

/**
 * @param {URL} projectDir
 */
export async function run(projectDir) {
	await fs.rm(projectDir, { recursive: true, force: true });
	await fs.mkdir(new URL('./src/pages', projectDir), { recursive: true });
	await fs.mkdir(new URL('./src/components', projectDir), { recursive: true });

	await fs.writeFile(
		new URL('./src/pages/index.astro', projectDir),
		`\
---
import Paragraph from '../components/Paragraph.astro'
const content = "${loremIpsum}"
---

<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="generator" content={Astro.generator} />
		<title>Astro</title>
	</head>
	<body>
		<h1>Astro</h1>
		<div>
			${Array.from({ length: 100 })
				.map(() => '<p>{content}</p>')
				.join('\n')}
		</div>
		<div>
			${Array.from({ length: 50 })
				.map((_, i) => '<Paragraph num={' + i + '} str={content} />')
				.join('\n')}
		</div>
	</body>
</html>`,
		'utf-8',
	);

	await fs.writeFile(
		new URL('./src/components/Paragraph.astro', projectDir),
		`<div>{Astro.props.num} {Astro.props.str}</div>`,
		'utf-8',
	);

	await fs.writeFile(
		new URL('./astro.config.js', projectDir),
		`\
import { defineConfig } from 'astro/config';
import nodejs from '@astrojs/node';

export default defineConfig({
	output: 'server',
	adapter: nodejs({ mode: 'standalone' }),
});`,
		'utf-8',
	);
}
