import { getCollection } from 'astro:content';

export async function GET() {
	const authors = await getCollection('authors');
	return Response.json(authors);
}
