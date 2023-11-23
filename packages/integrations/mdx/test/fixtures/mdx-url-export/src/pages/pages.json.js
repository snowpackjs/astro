export async function get() {
	const mdxPages = await import.meta.glob('./*.mdx', { eager: true });
	return Response.json({
		urls: Object.values(mdxPages ?? {}).map((v) => v?.url),
	});
}
