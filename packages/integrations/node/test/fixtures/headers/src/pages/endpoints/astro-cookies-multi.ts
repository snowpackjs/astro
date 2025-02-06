import type { APIContext } from 'astro';

export async function GET({ request, cookies }: APIContext) {
  const headers = new Headers();
  headers.append('content-type', 'text/plain;charset=utf-8');
  cookies.set('from1', 'astro1');
  cookies.set('from2', 'astro2');
  return new Response('hello world', { headers });
}
