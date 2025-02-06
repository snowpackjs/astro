import type { APIContext } from 'astro';

export async function GET({ request, cookies }: APIContext) {
  const headers = new Headers();
  headers.append('content-type', 'text/plain;charset=utf-8');
  headers.append('set-cookie', 'from1=response1');
  headers.append('set-cookie', 'from2=response2');
  cookies.set('from3', 'astro1');
  cookies.set('from4', 'astro2');
  return new Response('hello world', { headers });
}
