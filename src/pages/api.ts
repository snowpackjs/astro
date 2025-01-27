export function GET() {
	const json = {
		foo: 'bar',
		number: 1,
	};
	return new Response(JSON.stringify(json), {
		headers: {
			'content-type': 'application/json',
		},
	});
}
