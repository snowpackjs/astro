
export function POST() {
	const headers = new Headers();
  headers.append('Set-Cookie', `foo=foo; HttpOnly`);
  headers.append('Set-Cookie', `bar=bar; HttpOnly`);
	headers.append('Location', '/');

  return new Response('', {
    status: 301,
    headers,
  });
}
