export function GET() {
	const object = {
		name: 'Endpoint!!',
	};
	return new Response(JSON.stringify(object), {
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
