import assert from 'node:assert/strict';
import { promises as fs, existsSync } from 'node:fs';
import { sep } from 'node:path';
import { sep as posixSep } from 'node:path/posix';
import { Writable } from 'node:stream';
import { after, before, describe, it } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import * as cheerio from 'cheerio';
import * as devalue from 'devalue';
import { Logger } from '../dist/core/logger/core.js';

import { loadFixture } from './test-utils.js';
describe('Content Layer', () => {
	/** @type {import("./test-utils.js").Fixture} */
	let fixture;

	before(async () => {
		fixture = await loadFixture({ root: './fixtures/content-layer/' });
	});

	describe('Build', () => {
		let json;
		let $;
		before(async () => {
			fixture = await loadFixture({ root: './fixtures/content-layer/' });
			await fs
				.unlink(new URL('./node_modules/.astro/data-store.json', fixture.config.root))
				.catch(() => {});
			await fixture.build({ force: true });
			const rawJson = await fixture.readFile('/collections.json');
			const html = await fixture.readFile('/spacecraft/lunar-module/index.html');
			$ = cheerio.load(html);
			json = devalue.parse(rawJson);
		});

		it('Returns custom loader collection', async () => {
			assert.ok(json.hasOwnProperty('customLoader'));
			assert.ok(Array.isArray(json.customLoader));

			const item = json.customLoader[0];
			assert.deepEqual(item, {
				id: '1',
				collection: 'blog',
				data: {
					userId: 1,
					id: 1,
					title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
					body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
				},
			});
		});

		it('filters collection items', async () => {
			assert.ok(json.hasOwnProperty('customLoader'));
			assert.ok(Array.isArray(json.customLoader));
			assert.equal(json.customLoader.length, 5);
		});

		it('Returns json `file()` loader collection', async () => {
			assert.ok(json.hasOwnProperty('jsonLoader'));
			assert.ok(Array.isArray(json.jsonLoader));

			const ids = json.jsonLoader.map((item) => item.data.id);
			assert.deepEqual(ids, [
				'labrador-retriever',
				'german-shepherd',
				'golden-retriever',
				'french-bulldog',
				'bulldog',
				'beagle',
				'poodle',
				'rottweiler',
				'german-shorthaired-pointer',
				'yorkshire-terrier',
				'boxer',
				'dachshund',
				'siberian-husky',
				'great-dane',
				'doberman-pinscher',
				'australian-shepherd',
				'miniature-schnauzer',
				'cavalier-king-charles-spaniel',
				'shih-tzu',
				'boston-terrier',
				'bernese-mountain-dog',
				'pomeranian',
				'havanese',
				'english-springer-spaniel',
				'shetland-sheepdog',
			]);
		});

		it('handles negative matches in glob() loader', async () => {
			assert.ok(json.hasOwnProperty('probes'));
			assert.ok(Array.isArray(json.probes));
			assert.equal(json.probes.length, 5);
			assert.ok(
				json.probes.every(({ id }) => !id.startsWith('voyager')),
				'Voyager probes should not be included',
			);
		});

		it('Returns nested json `file()` loader collection', async () => {
			assert.ok(json.hasOwnProperty('nestedJsonLoader'));
			assert.ok(Array.isArray(json.nestedJsonLoader));

			const ids = json.nestedJsonLoader.map((item) => item.data.id);
			assert.deepEqual(ids, ['bluejay', 'robin', 'sparrow', 'cardinal', 'goldfinch']);
		});

		it('Returns yaml `file()` loader collection', async () => {
			assert.ok(json.hasOwnProperty('yamlLoader'));
			assert.ok(Array.isArray(json.yamlLoader));

			const ids = json.yamlLoader.map((item) => item.id);
			assert.deepEqual(ids, [
				'bubbles',
				'finn',
				'shadow',
				'spark',
				'splash',
				'nemo',
				'angel-fish',
				'gold-stripe',
				'blue-tail',
				'bubble-buddy',
			]);
		});

		it('Returns toml `file()` loader collection', async () => {
			assert.ok(json.hasOwnProperty('tomlLoader'));
			assert.ok(Array.isArray(json.tomlLoader));

			const ids = json.tomlLoader.map((item) => item.data.id);
			assert.deepEqual(ids, [
				'crown',
				'nikes-on-my-feet',
				'stars',
				'never-let-me-down',
				'no-church-in-the-wild',
				'family-ties',
				'somebody',
				'honest',
			]);
		});

		it('Returns nested json `file()` loader collection', async () => {
			assert.ok(json.hasOwnProperty('nestedJsonLoader'));
			assert.ok(Array.isArray(json.nestedJsonLoader));

			const ids = json.nestedJsonLoader.map((item) => item.data.id);
			assert.deepEqual(ids, ['bluejay', 'robin', 'sparrow', 'cardinal', 'goldfinch']);
		});

		it('Returns data entry by id', async () => {
			assert.ok(json.hasOwnProperty('dataEntry'));
			assert.equal(json.dataEntry.filePath?.split(sep).join(posixSep), 'src/data/dogs.json');
			delete json.dataEntry.filePath;
			assert.deepEqual(json.dataEntry, {
				id: 'beagle',
				collection: 'dogs',
				data: {
					breed: 'Beagle',
					id: 'beagle',
					size: 'Small to Medium',
					origin: 'England',
					lifespan: '12-15 years',
					temperament: ['Friendly', 'Curious', 'Merry'],
				},
			});
		});

		it('returns collection from a simple loader', async () => {
			assert.ok(json.hasOwnProperty('simpleLoader'));
			assert.ok(Array.isArray(json.simpleLoader));

			const item = json.simpleLoader[0];
			assert.deepEqual(item, {
				id: 'siamese',
				collection: 'cats',
				data: {
					breed: 'Siamese',
					id: 'siamese',
					size: 'Medium',
					origin: 'Thailand',
					lifespan: '15 years',
					temperament: ['Active', 'Affectionate', 'Social', 'Playful'],
				},
			});
		});

		it('returns a collection from a simple loader that uses an object', async () => {
			assert.ok(json.hasOwnProperty('simpleLoaderObject'));
			assert.ok(Array.isArray(json.simpleLoaderObject));
			assert.deepEqual(json.simpleLoaderObject[0], {
				id: 'capybara',
				collection: 'rodents',
				data: {
					name: 'Capybara',
					scientificName: 'Hydrochoerus hydrochaeris',
					lifespan: 10,
					weight: 50000,
					diet: ['grass', 'aquatic plants', 'bark', 'fruits'],
					nocturnal: false,
				},
			});
		});

		it('transforms a reference id to a reference object', async () => {
			assert.ok(json.hasOwnProperty('entryWithReference'));
			assert.deepEqual(json.entryWithReference.data.cat, { collection: 'cats', id: 'tabby' });
		});

		it('can store Date objects', async () => {
			assert.ok(json.entryWithReference.data.publishedDate instanceof Date);
		});

		it('loads images in frontmatter', async () => {
			assert.ok(json.entryWithReference.data.heroImage.src.startsWith('/_astro'));
			assert.equal(json.entryWithReference.data.heroImage.format, 'jpg');
		});

		it('loads images with uppercase extensions', async () => {
			assert.ok(json.atlantis.data.heroImage.src.startsWith('/_astro'));
			assert.ok(json.atlantis.data.heroImage.src.endsWith('.JPG'));
			assert.equal(json.atlantis.data.heroImage.format, 'jpg');
		});

		it('loads images from custom loaders', async () => {
			assert.ok(json.images[0].data.image.src.startsWith('/_astro'));
			assert.equal(json.images[0].data.image.format, 'jpg');
		});

		it('loads images with absolute paths', async () => {
			assert.ok(json.entryWithImagePath.data.heroImage.src.startsWith('/_astro'));
			assert.equal(json.entryWithImagePath.data.heroImage.format, 'jpg');
		});

		it('handles remote images in custom loaders', async () => {
			assert.ok(json.images[1].data.image.startsWith('https://'));
		});

		it('renders images from frontmatter', async () => {
			assert.ok($('img[alt="Lunar Module"]').attr('src').startsWith('/_astro'));
		});

		it('displays public images unchanged', async () => {
			assert.equal($('img[alt="buzz"]').attr('src'), '/buzz.jpg');
		});

		it('renders local images', async () => {
			assert.ok($('img[alt="shuttle"]').attr('src').startsWith('/_astro'));
		});

		it('returns a referenced entry', async () => {
			assert.ok(json.hasOwnProperty('referencedEntry'));
			assert.deepEqual(json.referencedEntry, {
				collection: 'cats',
				data: {
					breed: 'Tabby',
					id: 'tabby',
					size: 'Medium',
					origin: 'Egypt',
					lifespan: '15 years',
					temperament: ['Curious', 'Playful', 'Independent'],
				},
				id: 'tabby',
			});
		});

		it('allows "slug" as a field', async () => {
			assert.equal(json.increment.data.slug, 'slimy');
		});

		it('updates the store on new builds', async () => {
			assert.equal(json.increment.data.lastValue, 1);
			assert.equal(json.entryWithReference.data.something?.content, 'transform me');
			await fixture.build();
			const newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 2);
			assert.equal(newJson.entryWithReference.data.something?.content, 'transform me');
		});

		it('clears the store on new build with force flag', async () => {
			let newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 2);
			assert.equal(newJson.entryWithReference.data.something?.content, 'transform me');
			await fixture.build({ force: true }, {});
			newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 1);
			assert.equal(newJson.entryWithReference.data.something?.content, 'transform me');
		});

		it('clears the store on new build if the content config has changed', async () => {
			let newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 1);
			await fixture.editFile('src/content.config.ts', (prev) => {
				return `${prev}\nexport const foo = 'bar';`;
			});
			await fixture.build();
			newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 1);
			await fixture.resetAllFiles();
		});

		it('clears the store on new build if the Astro config has changed', async () => {
			let newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 1);
			await fixture.editFile('astro.config.mjs', (prev) => {
				return prev.replace('Astro content layer', 'Astro more content layer');
			});
			await fixture.build();
			newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.equal(newJson.increment.data.lastValue, 1);
			await fixture.resetAllFiles();
		});

		it('can handle references being renamed after a build', async () => {
			let newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.deepEqual(newJson.entryWithReference.data.cat, { collection: 'cats', id: 'tabby' });
			await fixture.editFile('src/data/cats.json', (prev) => {
				return prev.replace('tabby', 'tabby-cat');
			});
			await fixture.editFile('src/content/space/columbia-copy.md', (prev) => {
				return prev.replace('cat: tabby', 'cat: tabby-cat');
			});
			await fixture.build();
			newJson = devalue.parse(await fixture.readFile('/collections.json'));
			assert.deepEqual(newJson.entryWithReference.data.cat, {
				collection: 'cats',
				id: 'tabby-cat',
			});
			await fixture.resetAllFiles();
		});
	});

	describe('Dev', () => {
		let devServer;
		let json;
		const logs = [];
		before(async () => {
			devServer = await fixture.startDevServer({
				force: true,
				logger: new Logger({
					level: 'info',
					dest: new Writable({
						objectMode: true,
						write(event, _, callback) {
							logs.push(event);
							callback();
						},
					}),
				}),
			});
			// Vite may not have noticed the saved data store yet. Wait a little just in case.
			await fixture.onNextDataStoreChange(1000).catch(() => {
				// Ignore timeout, because it may have saved before we get here.
			});
			const rawJsonResponse = await fixture.fetch('/collections.json');
			const rawJson = await rawJsonResponse.text();
			json = devalue.parse(rawJson);
		});

		after(async () => {
			devServer?.stop();
		});

		it("warns about missing directory in glob() loader's path", async () => {
			assert.ok(logs.find((log) => log.level === 'warn' && log.message.includes('does not exist')));
		});

		it("warns about missing files in glob() loader's path", async () => {
			assert.ok(
				logs.find((log) => log.level === 'warn' && log.message.includes('No files found matching')),
			);
		});

		it('Generates content types files', async () => {
			assert.ok(existsSync(new URL('./.astro/content.d.ts', fixture.config.root)));
			const data = await fs.readFile(new URL('./.astro/types.d.ts', fixture.config.root), 'utf-8');
			assert.match(data, /<reference path="content.d.ts"/);
		});

		it('Returns custom loader collection', async () => {
			assert.ok(json.hasOwnProperty('customLoader'));
			assert.ok(Array.isArray(json.customLoader));

			const item = json.customLoader[0];
			assert.deepEqual(item, {
				id: '1',
				collection: 'blog',
				data: {
					userId: 1,
					id: 1,
					title: 'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
					body: 'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto',
				},
			});
		});

		it('Returns `file()` loader collection', async () => {
			assert.ok(json.hasOwnProperty('jsonLoader'));
			assert.ok(Array.isArray(json.jsonLoader));

			const ids = json.jsonLoader.map((item) => item.data.id);
			assert.deepEqual(ids, [
				'labrador-retriever',
				'german-shepherd',
				'golden-retriever',
				'french-bulldog',
				'bulldog',
				'beagle',
				'poodle',
				'rottweiler',
				'german-shorthaired-pointer',
				'yorkshire-terrier',
				'boxer',
				'dachshund',
				'siberian-husky',
				'great-dane',
				'doberman-pinscher',
				'australian-shepherd',
				'miniature-schnauzer',
				'cavalier-king-charles-spaniel',
				'shih-tzu',
				'boston-terrier',
				'bernese-mountain-dog',
				'pomeranian',
				'havanese',
				'english-springer-spaniel',
				'shetland-sheepdog',
			]);
		});

		it('Returns data entry by id', async () => {
			assert.ok(json.hasOwnProperty('dataEntry'));
			assert.equal(json.dataEntry.filePath?.split(sep).join(posixSep), 'src/data/dogs.json');
			delete json.dataEntry.filePath;
			assert.deepEqual(json.dataEntry, {
				id: 'beagle',
				collection: 'dogs',
				data: {
					breed: 'Beagle',
					id: 'beagle',
					size: 'Small to Medium',
					origin: 'England',
					lifespan: '12-15 years',
					temperament: ['Friendly', 'Curious', 'Merry'],
				},
			});
		});

		it('reloads data when an integration triggers a content refresh', async () => {
			const rawJsonResponse = await fixture.fetch('/collections.json');
			const initialJson = devalue.parse(await rawJsonResponse.text());
			assert.equal(initialJson.increment.data.lastValue, 1);
			const now = new Date().toISOString();

			const refreshResponse = await fixture.fetch('/_refresh', {
				method: 'POST',
				body: JSON.stringify({ now }),
			});
			const refreshData = await refreshResponse.json();
			assert.equal(refreshData.message, 'Content refreshed successfully');
			const updatedJsonResponse = await fixture.fetch('/collections.json');
			const updated = devalue.parse(await updatedJsonResponse.text());
			assert.equal(updated.increment.data.lastValue, 2);
			assert.deepEqual(updated.increment.data.refreshContextData, { webhookBody: { now } });
		});

		it('updates collection when data file is changed', async () => {
			const rawJsonResponse = await fixture.fetch('/collections.json');
			const initialJson = devalue.parse(await rawJsonResponse.text());
			assert.equal(initialJson.jsonLoader[0].data.temperament.includes('Bouncy'), false);

			await fixture.editFile('/src/data/dogs.json', (prev) => {
				const data = JSON.parse(prev);
				data[0].temperament.push('Bouncy');
				return JSON.stringify(data, null, 2);
			});

			await fixture.onNextDataStoreChange();
			const updatedJsonResponse = await fixture.fetch('/collections.json');
			const updated = devalue.parse(await updatedJsonResponse.text());
			assert.ok(updated.jsonLoader[0].data.temperament.includes('Bouncy'));
			await fixture.resetAllFiles();
		});

		it('removes old entry when slug is changed', async () => {
			const rawJsonResponse = await fixture.fetch('/collections.json');
			const initialJson = devalue.parse(await rawJsonResponse.text());

			assert.ok(initialJson.spacecraft.includes('exomars'));
			assert.ok(!initialJson.spacecraft.includes('rosalind-franklin-rover'));

			await fixture.editFile('/src/content/space/exomars.md', (prev) => {
				return prev.replace('# slug', 'slug');
			});

			await fixture.onNextDataStoreChange();
			const updatedJsonResponse = await fixture.fetch('/collections.json');
			const updated = devalue.parse(await updatedJsonResponse.text());
			assert.ok(!updated.spacecraft.includes('exomars'));
			assert.ok(updated.spacecraft.includes('rosalind-franklin-rover'));

			await fixture.editFile('/src/content/space/exomars.md', (prev) => {
				return prev.replace('rosalind-franklin-rover', 'rosalind-franklin');
			});

			await fixture.onNextDataStoreChange();
			const updatedJsonResponse2 = await fixture.fetch('/collections.json');
			const updated2 = devalue.parse(await updatedJsonResponse2.text());
			assert.ok(!updated2.spacecraft.includes('rosalind-franklin-rover'));
			assert.ok(updated2.spacecraft.includes('rosalind-franklin'));

			await fixture.resetAllFiles();
		});

		it('returns an error if we render an undefined entry', async () => {
			const res = await fixture.fetch('/missing');
			const text = await res.text();
			assert.equal(res.status, 500);
			assert.ok(text.includes('RenderUndefinedEntryError'));
		});

		it('update the store when a file is renamed', async () => {
			const rawJsonResponse = await fixture.fetch('/collections.json');
			const initialJson = devalue.parse(await rawJsonResponse.text());
			assert.equal(initialJson.numbers.map((e) => e.id).includes('src/data/glob-data/three'), true);

			const oldPath = new URL('./data/glob-data/three.json', fixture.config.srcDir);
			const newPath = new URL('./data/glob-data/four.json', fixture.config.srcDir);

			await fs.rename(oldPath, newPath);
			await fixture.onNextDataStoreChange();

			try {
				const updatedJsonResponse = await fixture.fetch('/collections.json');
				const updated = devalue.parse(await updatedJsonResponse.text());
				assert.equal(updated.numbers.map((e) => e.id).includes('src/data/glob-data/three'), false);
				assert.equal(updated.numbers.map((e) => e.id).includes('src/data/glob-data/four'), true);
			} finally {
				await fs.rename(newPath, oldPath);
			}
		});

		it('still updates collection when data file is changed after server has restarted via config change', async () => {
			await fixture.editFile('astro.config.mjs', (prev) =>
				prev.replace("'Astro content layer'", "'Astro content layer edited'"),
			);
			logs.length = 0;

			// Give time for the server to restart
			await setTimeout(5000);

			const rawJsonResponse = await fixture.fetch('/collections.json');
			const initialJson = devalue.parse(await rawJsonResponse.text());
			assert.equal(initialJson.jsonLoader[0].data.temperament.includes('Bouncy'), false);

			await fixture.editFile('/src/data/dogs.json', (prev) => {
				const data = JSON.parse(prev);
				data[0].temperament.push('Bouncy');
				return JSON.stringify(data, null, 2);
			});

			await fixture.onNextDataStoreChange();
			const updatedJsonResponse = await fixture.fetch('/collections.json');
			const updated = devalue.parse(await updatedJsonResponse.text());
			assert.ok(updated.jsonLoader[0].data.temperament.includes('Bouncy'));
			logs.length = 0;

			await fixture.resetAllFiles();
			// Give time for the server to restart again
			await setTimeout(5000);
		});
	});
});
