import type { APIRoute } from 'astro';

export const GET: APIRoute = async function () {
  return new Response(new Uint8Array([0xff]));
};
