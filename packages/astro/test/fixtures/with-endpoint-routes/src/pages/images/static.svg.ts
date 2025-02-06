export function GET() {
	return new Response(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
	<title>Static SVG</title>
</svg>`,
		{
			headers: {
				'content-type': 'image/svg+xml',
			},
		}
	);
}
