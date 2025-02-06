
export async function POST({ locals }) {
	const out = { ...locals };

	return new Response(JSON.stringify(out), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
}
