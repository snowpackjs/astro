import { getEntry, getCollection } from 'astro:content';

export async function getStaticPaths() {
	const collection = await getCollection('authors');

	return collection.map(({ id }) => ({ params: { id } }));
}

/** @param {import('astro').APIContext} params */
export async function GET({ params }) {
	const { id } = params;
	const author = await getEntry('authors', id);
	if (!author) {
		return Response.json({ error: `Author ${id} Not found` });
	} else {
		return Response.json(author);
	}
}
