export async function GET({ request }: { request: Request }) {
  const headers = new Headers();
  headers.append('content-type', 'text/plain;charset=utf-8');
  headers.append('X-HELLO', 'world');
	return new Response('hello world', { headers });
}
