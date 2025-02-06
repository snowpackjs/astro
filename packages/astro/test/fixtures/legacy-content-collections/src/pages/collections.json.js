import { getCollection } from 'astro:content';
import * as devalue from 'devalue';
import { stripAllRenderFn } from '../utils.js';

export async function GET() {
	const withoutConfig = stripAllRenderFn(await getCollection('without-config'));
	const withSchemaConfig = stripAllRenderFn(await getCollection('with-schema-config'));
	const withSlugConfig = stripAllRenderFn(await getCollection('with-custom-slugs'));
	const withUnionSchema = stripAllRenderFn(await getCollection('with-union-schema'));
	const withSymlinkedContent = stripAllRenderFn(await getCollection('with-symlinked-content'));
	const withSymlinkedData = stripAllRenderFn(await getCollection('with-symlinked-data'));
	const filtered = stripAllRenderFn(await getCollection('without-config', (entry) => entry.slug));

	return new Response(
		devalue.stringify({
			withoutConfig,
			withSchemaConfig,
			withSlugConfig,
			withUnionSchema,
			withSymlinkedContent,
			withSymlinkedData,
			filtered,
		}),
	);
}
