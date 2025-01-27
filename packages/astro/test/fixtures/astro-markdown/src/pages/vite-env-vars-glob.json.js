import { frontmatter } from './vite-env-vars.md';

export async function GET() {
	return Response.json(frontmatter);
}
