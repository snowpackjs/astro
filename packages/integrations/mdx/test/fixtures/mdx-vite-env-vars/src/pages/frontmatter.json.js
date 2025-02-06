import { frontmatter } from './vite-env-vars.mdx';

export function GET() {
	return Response.json(frontmatter);
}
