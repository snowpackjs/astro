import { generatePosts } from './generate-posts.mjs';

(async () => {
	const postsDir = process.argv[2];
	const numPosts =
		typeof process.argv[3] === 'string' && process.argv[3].length > 0
			? Number(process.argv[3])
			: undefined;

	const ext = process.argv[4];
	const template = process.argv[5];

	await generatePosts({ postsDir, numPosts, ext, template });

	console.info(`${numPosts} ${ext} posts written to ${JSON.stringify(postsDir)} 🚀`);
})();
