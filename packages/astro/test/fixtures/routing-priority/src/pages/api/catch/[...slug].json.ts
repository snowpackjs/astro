import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  return new Response(
    JSON.stringify({
      path: params.slug,
    })
  );
};

export function getStaticPaths() {
  return [{ params: { slug: 'a' } }, { params: { slug: 'b/c' } }];
}
