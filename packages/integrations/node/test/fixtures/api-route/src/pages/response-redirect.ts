import type { APIContext } from 'astro';

export async function GET({ url: requestUrl }: APIContext) {
    return Response.redirect(new URL('/destination', requestUrl), 307);
}
