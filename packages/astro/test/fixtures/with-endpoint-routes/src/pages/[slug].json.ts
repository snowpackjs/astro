export async function getStaticPaths() {
    return [
        { params: { slug: 'thing1' } },
        { params: { slug: 'thing2' } }
    ];
}

export async function GET({ params }) {
    return Response.json({
        slug: params.slug,
        title: '[slug]'
    });
}
