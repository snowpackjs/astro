import type { APIRoute } from "astro"

export const GET = (async ({ params, request }) => {
	const url = new URL(request.url);
  const src = url.searchParams.get("src");
	return new Response("An image: " + JSON.stringify(src));
}) satisfies APIRoute;
