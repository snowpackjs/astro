export async function GET({ request }: { request: Request }) {
  const headers = new Headers();
  headers.append('content-type', 'text/plain;charset=utf-8');
  headers.append('x-SINGLE', 'single');
  headers.append('X-triple', 'one');
  headers.append('x-Triple', 'two');
  headers.append('x-TRIPLE', 'three');
  headers.append('SET-cookie', 'hello1=world1');
  headers.append('Set-Cookie', 'hello2=world2');
	return new Response('hello world', { headers });
}
