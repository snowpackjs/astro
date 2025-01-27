import { getEntries, getEntry } from 'astro:content';

export async function GET() {
	const welcomePost = await getEntry('blog', 'welcome');

	if (!welcomePost?.data) {
		return Response.json({ error: 'blog/welcome did not return `data`.' }, { status: 404 })
	}

	const banner = await getEntry(welcomePost.data.banner);
	const author = await getEntry(welcomePost.data.author);
	const rawRelatedPosts = await getEntries(welcomePost.data.relatedPosts ?? []);
	const relatedPosts = rawRelatedPosts.map(({ render /** filter out render() function */, ...p }) => p);

	return Response.json({
		welcomePost,
		banner,
		author,
		relatedPosts,
	})
}
