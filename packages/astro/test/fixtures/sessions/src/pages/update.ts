import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
	const previousObject = await context.session.get("key") ?? { value: "none" };
	const previousValue = previousObject.value;
	const sessionData = { value: "expected" };
	context.session.set("key", sessionData);
	sessionData.value = "unexpected";
	return Response.json({previousValue});
};
