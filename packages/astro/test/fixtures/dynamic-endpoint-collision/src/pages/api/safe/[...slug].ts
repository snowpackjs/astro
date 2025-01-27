import type { APIRoute } from 'astro';

// No undefined so should not error
const slugs = ['one'];

export const GET: APIRoute = ({ params }) => {
	return Response.json({
		slug: params.slug || 'index',
	});
};

export function getStaticPaths() {
	return slugs.map((u) => ({ params: { slug: u } }));
}
