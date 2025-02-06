export async function getStaticPaths() {
    return [
        { params: { slug: 'thing3' } },
        { params: { slug: 'thing4' } }
    ];
}

export async function GET({ params }) {
    return Response.json({
        slug: params.slug,
        title: 'data [slug]'
    });
}
