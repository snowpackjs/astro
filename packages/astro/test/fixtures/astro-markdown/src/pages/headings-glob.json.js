import { getHeadings } from './with-layout.md';

export async function GET() {
	return Response.json({
		headings: getHeadings(),
	});
}
