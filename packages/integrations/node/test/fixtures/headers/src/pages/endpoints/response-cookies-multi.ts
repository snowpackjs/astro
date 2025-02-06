export async function GET({ request }: { request: Request }) {
  const headers = new Headers();
  headers.append('content-type', 'text/plain;charset=utf-8');
  headers.append('Set-Cookie', 'hello1=world1');
  headers.append('SET-COOKIE', 'hello2=world2');
	return new Response('hello world', { headers });
}
