
export async function POST({ request }) {
	let body = await request.json();
	const recipes = [
		{
			id: 1,
			name: 'Potato Soup'
		},
		{
			id: 2,
			name: 'Broccoli Soup'
		}
	];

	let out = recipes.filter(r => {
		return r.id === body.id;
	});

	return new Response(JSON.stringify(out), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
