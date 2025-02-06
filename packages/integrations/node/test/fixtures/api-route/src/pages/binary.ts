
export async function POST({ request }: { request: Request }) {
	let body = await request.arrayBuffer();
	let data = new Uint8Array(body);
	let r = data.reverse();
	return new Response(r, {
		headers: {
			'Content-Type': 'application/octet-stream'
		}
	});
}
