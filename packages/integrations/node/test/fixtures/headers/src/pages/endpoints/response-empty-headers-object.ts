export async function GET({ request }: { request: Request }) {
  const headers = new Headers();
	return new Response('hello world', { headers });
}
