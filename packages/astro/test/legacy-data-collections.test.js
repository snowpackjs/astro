import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { loadFixture } from './test-utils.js';

const authorIds = ['Ben Holmes', 'Fred K Schott', 'Nate Moore'];
const translationIds = ['en', 'es', 'fr'];

describe('Content Collections - legacy data collections', () => {
	let fixture;
	before(async () => {
		fixture = await loadFixture({ root: './fixtures/legacy-data-collections/' });
		await fixture.build({ force: true });
	});

	describe('Authors Collection', () => {
		let json;
		before(async () => {
			const rawJson = await fixture.readFile('/authors/all.json');
			json = JSON.parse(rawJson);
		});

		it('Returns', async () => {
			assert.equal(Array.isArray(json), true);
			assert.equal(json.length, 3);
		});

		it('Generates correct ids', async () => {
			const ids = json.map((item) => item.id).sort();
			assert.deepEqual(ids, ['Ben Holmes', 'Fred K Schott', 'Nate Moore']);
		});

		it('Generates correct data', async () => {
			const names = json.map((item) => item.data.name);
			assert.deepEqual(names, ['Ben J Holmes', 'Fred K Schott', 'Nate Something Moore']);

			const twitterUrls = json.map((item) => item.data.twitter);
			assert.deepEqual(twitterUrls, [
				'https://twitter.com/bholmesdev',
				'https://twitter.com/FredKSchott',
				'https://twitter.com/n_moore',
			]);
		});
	});

	describe('getDataEntryById', () => {
		let json;
		before(async () => {
			const rawJson = await fixture.readFile('/translations/by-id.json');
			json = JSON.parse(rawJson);
		});
		it('Grabs the item by the base file name', () => {
			assert.equal(json.id, 'en');
		});
	});

	describe('Authors Entry', () => {
		for (const authorId of authorIds) {
			let json;
			before(async () => {
				const rawJson = await fixture.readFile(`/authors/${authorId}.json`);
				json = JSON.parse(rawJson);
			});

			it(`Returns ${authorId}`, async () => {
				assert.equal(json.hasOwnProperty('id'), true);
				assert.equal(json.id, authorId);
			});

			it(`Generates correct data for ${authorId}`, async () => {
				assert.equal(json.hasOwnProperty('data'), true);
				assert.equal(json.data.hasOwnProperty('name'), true);
				assert.equal(json.data.hasOwnProperty('twitter'), true);

				switch (authorId) {
					case 'Ben Holmes':
						assert.equal(json.data.name, 'Ben J Holmes');
						assert.equal(json.data.twitter, 'https://twitter.com/bholmesdev');
						break;
					case 'Fred K Schott':
						assert.equal(json.data.name, 'Fred K Schott');
						assert.equal(json.data.twitter, 'https://twitter.com/FredKSchott');
						break;
					case 'Nate Moore':
						assert.equal(json.data.name, 'Nate Something Moore');
						assert.equal(json.data.twitter, 'https://twitter.com/n_moore');
						break;
				}
			});
		}
	});

	describe('Translations Collection', () => {
		let json;
		before(async () => {
			const rawJson = await fixture.readFile('/translations/all.json');
			json = JSON.parse(rawJson);
		});

		it('Returns', async () => {
			assert.equal(Array.isArray(json), true);
			assert.equal(json.length, 3);
		});

		it('Generates correct ids', async () => {
			const ids = json.map((item) => item.id).sort();
			assert.deepEqual(ids, translationIds);
		});

		it('Generates correct data', async () => {
			const sorted = json.sort((a, b) => a.id.localeCompare(b.id));
			const homepageGreetings = sorted.map((item) => item.data.homepage?.greeting);
			assert.deepEqual(homepageGreetings, ['Hello World!', '¡Hola Mundo!', 'Bonjour le monde!']);

			const homepagePreambles = sorted.map((item) => item.data.homepage?.preamble);
			assert.deepEqual(homepagePreambles, [
				'Welcome to the future of content.',
				'Bienvenido al futuro del contenido.',
				'Bienvenue dans le futur du contenu.',
			]);
		});
	});

	describe('Translations Entry', () => {
		for (const translationId of translationIds) {
			let json;
			before(async () => {
				const rawJson = await fixture.readFile(`/translations/${translationId}.json`);
				json = JSON.parse(rawJson);
			});

			it(`Returns ${translationId}`, async () => {
				assert.equal(json.hasOwnProperty('id'), true);
				assert.equal(json.id, translationId);
			});

			it(`Generates correct data for ${translationId}`, async () => {
				assert.equal(json.hasOwnProperty('data'), true);
				assert.equal(json.data.hasOwnProperty('homepage'), true);
				assert.equal(json.data.homepage.hasOwnProperty('greeting'), true);
				assert.equal(json.data.homepage.hasOwnProperty('preamble'), true);

				switch (translationId) {
					case 'en':
						assert.equal(json.data.homepage.greeting, 'Hello World!');
						assert.equal(json.data.homepage.preamble, 'Welcome to the future of content.');
						break;
					case 'es':
						assert.equal(json.data.homepage.greeting, '¡Hola Mundo!');
						assert.equal(json.data.homepage.preamble, 'Bienvenido al futuro del contenido.');
						break;
					case 'fr':
						assert.equal(json.data.homepage.greeting, 'Bonjour le monde!');
						assert.equal(json.data.homepage.preamble, 'Bienvenue dans le futur du contenu.');
						break;
				}
			});
		}
	});
});
