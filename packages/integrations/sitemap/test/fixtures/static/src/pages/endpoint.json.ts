export async function GET({}) {
	return Response.json({
		name: 'Astro',
		url: 'https://astro.build/',
	});
}
