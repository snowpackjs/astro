export const prerender = true;

export function getStaticPaths() {
  return [{ params: { slug: 'test' } }];
}

export function GET() {
  return new Response('OK — test');
}
