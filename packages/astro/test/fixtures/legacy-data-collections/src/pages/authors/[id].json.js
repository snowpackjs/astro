import { getEntry } from 'astro:content';

const ids = ['Ben Holmes', 'Fred K Schott', 'Nate Moore'];

export function getStaticPaths() {
	return ids.map((id) => ({ params: { id } }));
}

/** @param {import('astro').APIContext} params */
export async function GET({ params }) {
	const { id } = params;
	const author = await getEntry('authors-without-config', id);
	if (!author) {
		return Response.json({ error: `Author ${id} Not found` });
	} else {
		return Response.json(author);
	}
}
