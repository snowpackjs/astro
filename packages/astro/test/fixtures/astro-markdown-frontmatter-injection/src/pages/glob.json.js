export async function GET() {
	const docs = await import.meta.glob('./*.md', { eager: true });
	return Response.json(Object.values(docs).map((doc) => doc.frontmatter));
}
