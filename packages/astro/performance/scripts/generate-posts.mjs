import fs from 'node:fs';
import path from 'node:path';

const NUM_POSTS = 10;
const POSTS_DIR = './src/content/posts.generated';
const EXT = '.md';
const TEMPLATE = 'simple.md';

export async function generatePosts({
	postsDir = POSTS_DIR,
	numPosts = NUM_POSTS,
	ext = EXT,
	template = TEMPLATE,
}) {
	if (fs.existsSync(postsDir)) {
		const files = await fs.promises.readdir(postsDir);
		await Promise.all(files.map((file) => fs.promises.unlink(path.join(postsDir, file))));
	} else {
		await fs.promises.mkdir(postsDir, { recursive: true });
	}

	await Promise.all(
		Array.from(Array(numPosts).keys()).map((idx) => {
			return fs.promises.writeFile(
				`${postsDir}/post-${idx}${ext.startsWith('.') ? ext : `.${ext}`}`,
				fs.readFileSync(new URL(`./templates/${template}`, import.meta.url), 'utf8'),
			);
		}),
	);
}
