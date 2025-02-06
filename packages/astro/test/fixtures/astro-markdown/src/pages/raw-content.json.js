import { compiledContent, rawContent } from './basic.md';
import md from './basic.md?raw';
import url from './basic.md?url';
export async function GET() {
	return Response.json({
		raw: rawContent(),
		compiled: await compiledContent(),
		rawImport: md,
		url,
	});
}
