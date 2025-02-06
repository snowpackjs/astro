export async function getStaticPaths() {
	return [
        { params: { slug: 'thing1' } },
        { params: { slug: 'thing2' } }
    ];
}

export async function GET() {
	return Response.json({
		title: '[slug]',
	});
}
