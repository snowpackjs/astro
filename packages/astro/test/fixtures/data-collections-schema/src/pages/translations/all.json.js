import { getCollection } from 'astro:content';

export async function GET() {
	const translations = await getCollection('i18n');
	return Response.json(translations);
}
