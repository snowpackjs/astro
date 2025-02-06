import { manifest } from 'astro:ssr-manifest';

export function GET() {
	return Response.json(manifest);
}
