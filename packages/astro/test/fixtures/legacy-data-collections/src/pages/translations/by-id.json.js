import { getDataEntryById } from 'astro:content';

export async function GET() {
	const item = await getDataEntryById('i18n', 'en');
	return Response.json(item);
}
