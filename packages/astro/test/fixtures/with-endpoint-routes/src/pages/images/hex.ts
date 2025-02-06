import { readFile } from 'node:fs/promises';

export async function GET() {
	const buffer = await readFile(new URL('../../astro.png', import.meta.url));
	return new Response(buffer.buffer);
}
