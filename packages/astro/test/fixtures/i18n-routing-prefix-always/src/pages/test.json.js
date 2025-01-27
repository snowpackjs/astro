export const GET = () => {
	return new Response(JSON.stringify({ lorem: 'ipsum' }), {
		headers: {
			'content-type': 'application/json',
		},
	});
};
