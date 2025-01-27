export async function getStaticPaths() {
	return [{ params: { image: 1 } }, { params: { image: 2 } }];
}

export async function GET({ params }) {
	return new Response(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
	<title>${params.image}</title>
</svg>`,
		{
			headers: {
				'content-type': 'image/svg+xml',
			},
		}
	);
}
