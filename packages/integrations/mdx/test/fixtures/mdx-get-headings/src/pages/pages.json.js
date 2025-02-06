export async function GET() {
	const mdxPages = await import.meta.glob('./*.mdx', { eager: true });
	return Response.json({
		headingsByPage: Object.fromEntries(
			Object.entries(mdxPages ?? {}).map(([k, v]) => [k, v?.getHeadings()])
		),
	});
}
