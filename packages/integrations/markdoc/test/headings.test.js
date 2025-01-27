import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

async function getFixture(name) {
	return await loadFixture({
		root: new URL(`./fixtures/${name}/`, import.meta.url),
	});
}

describe('Markdoc - Headings', () => {
	let fixture;

	before(async () => {
		fixture = await getFixture('headings');
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('applies IDs to headings', async () => {
			const res = await fixture.fetch('/headings');
			const html = await res.text();
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates the same IDs for other documents with the same headings', async () => {
			const res = await fixture.fetch('/headings-stale-cache-check');
			const html = await res.text();
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates a TOC with correct info', async () => {
			const res = await fixture.fetch('/headings');
			const html = await res.text();
			const { document } = parseHTML(html);

			tocTest(document);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('applies IDs to headings', async () => {
			const html = await fixture.readFile('/headings/index.html');
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates the same IDs for other documents with the same headings', async () => {
			const html = await fixture.readFile('/headings-stale-cache-check/index.html');
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates a TOC with correct info', async () => {
			const html = await fixture.readFile('/headings/index.html');
			const { document } = parseHTML(html);

			tocTest(document);
		});
	});
});

describe('Markdoc - Headings with custom Astro renderer', () => {
	let fixture;

	before(async () => {
		fixture = await getFixture('headings-custom');
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('applies IDs to headings', async () => {
			const res = await fixture.fetch('/headings');
			const html = await res.text();
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates the same IDs for other documents with the same headings', async () => {
			const res = await fixture.fetch('/headings-stale-cache-check');
			const html = await res.text();
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates a TOC with correct info', async () => {
			const res = await fixture.fetch('/headings');
			const html = await res.text();
			const { document } = parseHTML(html);

			tocTest(document);
		});

		it('renders Astro component for each heading', async () => {
			const res = await fixture.fetch('/headings');
			const html = await res.text();
			const { document } = parseHTML(html);

			astroComponentTest(document);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('applies IDs to headings', async () => {
			const html = await fixture.readFile('/headings/index.html');
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates the same IDs for other documents with the same headings', async () => {
			const html = await fixture.readFile('/headings-stale-cache-check/index.html');
			const { document } = parseHTML(html);

			idTest(document);
		});

		it('generates a TOC with correct info', async () => {
			const html = await fixture.readFile('/headings/index.html');
			const { document } = parseHTML(html);

			tocTest(document);
		});

		it('renders Astro component for each heading', async () => {
			const html = await fixture.readFile('/headings/index.html');
			const { document } = parseHTML(html);

			astroComponentTest(document);
		});
	});
});

const depthToHeadingMap = {
	1: {
		slug: 'level-1-heading',
		text: 'Level 1 heading',
	},
	2: {
		slug: 'level-2-heading',
		text: 'Level 2 heading',
	},
	3: {
		slug: 'level-3-heading',
		text: 'Level 3 heading',
	},
	4: {
		slug: 'level-4-heading',
		text: 'Level 4 heading',
	},
	5: {
		slug: 'id-override',
		text: 'Level 5 heading with override',
	},
	6: {
		slug: 'level-6-heading',
		text: 'Level 6 heading',
	},
};

/** @param {Document} document */
function idTest(document) {
	for (const [depth, info] of Object.entries(depthToHeadingMap)) {
		assert.equal(document.querySelector(`h${depth}`)?.getAttribute('id'), info.slug);
	}
}

/** @param {Document} document */
function tocTest(document) {
	const toc = document.querySelector('[data-toc] > ul');
	assert.equal(toc.children.length, Object.keys(depthToHeadingMap).length);

	for (const [depth, info] of Object.entries(depthToHeadingMap)) {
		const linkEl = toc.querySelector(`a[href="#${info.slug}"]`);
		assert.ok(linkEl);
		assert.equal(linkEl.getAttribute('data-depth'), depth);
		assert.equal(linkEl.textContent.trim(), info.text);
	}
}

/** @param {Document} document */
function astroComponentTest(document) {
	const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

	for (const heading of headings) {
		assert.equal(heading.hasAttribute('data-custom-heading'), true);
	}
}
