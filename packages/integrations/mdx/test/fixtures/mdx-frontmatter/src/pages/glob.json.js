export async function GET() {
	const mdxPages = await import.meta.glob('./*.mdx', { eager: true });
	return Response.json({
		titles: Object.values(mdxPages ?? {}).map((v) => v?.frontmatter?.title),
	});
}
