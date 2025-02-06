export const prerender = false;

export async function GET({ params }) {
	return Response.json({
		id: params.id
	});
}
