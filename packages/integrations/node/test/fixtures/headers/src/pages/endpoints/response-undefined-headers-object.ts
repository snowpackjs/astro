export async function GET({ request }: { request: Request }) {
	return new Response('hello world', { headers: undefined });
}
