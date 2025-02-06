import crypto from 'node:crypto';

export async function POST({ request }: { request: Request }) {
	const hash = crypto.createHash('sha256');

    const iterable = request.body as unknown as AsyncIterable<Uint8Array>;
    for await (const chunk of iterable) {
        hash.update(chunk);
    }

	return new Response(hash.digest(), {
		headers: {
			'Content-Type': 'application/octet-stream'
		}
	});
}
