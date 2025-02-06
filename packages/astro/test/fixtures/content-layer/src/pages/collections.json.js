import { getCollection, getEntry } from 'astro:content';
import * as devalue from 'devalue';

export async function GET() {
	const customLoader = await getCollection('blog', (entry) => {
		return entry.data.id < 6;
	});
	const jsonLoader = await getCollection('dogs');

	const dataEntry = await getEntry('dogs', 'beagle');

	const simpleLoader = await getCollection('cats');

	const entryWithReference = await getEntry('spacecraft', 'columbia-copy');
	const atlantis = await getEntry('spacecraft', 'atlantis');
	const referencedEntry = await getEntry(entryWithReference.data.cat);

	const spacecraft = await getCollection('spacecraft');

	const entryWithImagePath = await getEntry('spacecraft', 'lunar-module');

	const increment = await getEntry('increment', 'value');

	const images = await getCollection('images');

	const simpleLoaderObject = await getCollection('rodents')

	const probes = await getCollection('probes');

	const yamlLoader = await getCollection('fish');

	const tomlLoader = await getCollection('songs');

	const nestedJsonLoader = await getCollection('birds');
	
	const numbers = await getCollection('numbers');

	return new Response(
		devalue.stringify({
			customLoader,
			jsonLoader,
			dataEntry,
			simpleLoader,
			simpleLoaderObject,
			entryWithReference,
			entryWithImagePath,
			referencedEntry,
			increment,
			numbers,
			images, 
			probes,
			yamlLoader,
			tomlLoader,
			nestedJsonLoader,
			atlantis,
			spacecraft: spacecraft.map(({id}) => id).sort((a, b) => a.localeCompare(b)),
		})
	);
}
