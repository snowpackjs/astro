import { expect } from 'chai';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Custom 404 Markdown', () => {
	let fixture;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/custom-404-md/',
		});
	});

	describe('dev', () => {
		let devServer;
		let $;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('renders /', async () => {
			const html = await fixture.fetch('/').then((res) => res.text());
			$ = cheerio.load(html);

			expect($('h1').text()).to.equal('Home');
		});

		it('renders 404 for /abc', async () => {
			const res = await fixture.fetch('/a');
			expect(res.status).to.equal(404);

			const html = await res.text();
			$ = cheerio.load(html);

			expect($('h1').text()).to.equal('Page not found');
		});
	});
});
