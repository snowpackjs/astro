import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { parseHTML } from 'linkedom';
import { loadFixture } from '../../../astro/test/test-utils.js';

async function getFixture(name) {
	return await loadFixture({
		root: new URL(`./fixtures/${name}/`, import.meta.url),
	});
}

describe('Markdoc - render html', () => {
	let fixture;

	before(async () => {
		fixture = await getFixture('render-html');
	});

	describe('dev', () => {
		let devServer;

		before(async () => {
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('renders content - simple', async () => {
			const res = await fixture.fetch('/simple');
			const html = await res.text();

			renderSimpleChecks(html);
		});

		it('renders content - nested-html', async () => {
			const res = await fixture.fetch('/nested-html');
			const html = await res.text();

			renderNestedHTMLChecks(html);
		});

		it('renders content - components interleaved with html', async () => {
			const res = await fixture.fetch('/components');
			const html = await res.text();

			renderComponentsHTMLChecks(html);
		});

		it('renders content - randomly cased html attributes', async () => {
			const res = await fixture.fetch('/randomly-cased-html-attributes');
			const html = await res.text();

			renderRandomlyCasedHTMLAttributesChecks(html);
		});

		it('renders content - html within partials', async () => {
			const res = await fixture.fetch('/with-partial');
			const html = await res.text();

			renderHTMLWithinPartialChecks(html);
		});
	});

	describe('build', () => {
		before(async () => {
			await fixture.build();
		});

		it('renders content - simple', async () => {
			const html = await fixture.readFile('/simple/index.html');

			renderSimpleChecks(html);
		});

		it('renders content - nested-html', async () => {
			const html = await fixture.readFile('/nested-html/index.html');

			renderNestedHTMLChecks(html);
		});

		it('renders content - components interleaved with html', async () => {
			const html = await fixture.readFile('/components/index.html');

			renderComponentsHTMLChecks(html);
		});

		it('renders content - randomly cased html attributes', async () => {
			const html = await fixture.readFile('/randomly-cased-html-attributes/index.html');

			renderRandomlyCasedHTMLAttributesChecks(html);
		});

		it('renders content - html within partials', async () => {
			const html = await fixture.readFile('/with-partial/index.html');

			renderHTMLWithinPartialChecks(html);
		});
	});
});

/** @param {string} html */
function renderSimpleChecks(html) {
	const { document } = parseHTML(html);

	const h2 = document.querySelector('h2');
	assert.equal(h2.textContent, 'Simple post header');

	const spanInsideH2 = document.querySelector('h2 > span');
	assert.equal(spanInsideH2.textContent, 'post');
	assert.equal(spanInsideH2.className, 'inside-h2');
	assert.equal(spanInsideH2.style.color, 'fuscia');

	const p1 = document.querySelector('article > p:nth-of-type(1)');
	assert.equal(p1.children.length, 1);
	assert.equal(p1.textContent, 'This is a simple Markdoc post.');

	const p2 = document.querySelector('article > p:nth-of-type(2)');
	assert.equal(p2.children.length, 0);
	assert.equal(p2.textContent, 'This is a paragraph!');

	const p3 = document.querySelector('article > p:nth-of-type(3)');
	assert.equal(p3.children.length, 1);
	assert.equal(p3.textContent, 'This is a span inside a paragraph!');

	const video = document.querySelector('video');
	assert.ok(video, 'A video element should exist');
	assert.ok(video.hasAttribute('autoplay'), 'The video element should have the autoplay attribute');
	assert.ok(video.hasAttribute('muted'), 'The video element should have the muted attribute');
}

/** @param {string} html */
function renderNestedHTMLChecks(html) {
	const { document } = parseHTML(html);

	const p1 = document.querySelector('p:nth-of-type(1)');
	assert.equal(p1.id, 'p1');
	assert.equal(p1.textContent, 'before inner after');
	assert.equal(p1.children.length, 1);

	const p1Span1 = p1.querySelector('span');
	assert.equal(p1Span1.textContent, 'inner');
	assert.equal(p1Span1.id, 'inner1');
	assert.equal(p1Span1.className, 'inner-class');
	assert.equal(p1Span1.style.color, 'hotpink');

	const p2 = document.querySelector('p:nth-of-type(2)');
	assert.equal(p2.id, 'p2');
	assert.equal(p2.textContent, '\n  before\n  inner\n  after\n');
	assert.equal(p2.children.length, 1);

	const divL1 = document.querySelector('div:nth-of-type(1)');
	assert.equal(divL1.id, 'div-l1');
	assert.equal(divL1.children.length, 2);

	const divL2_1 = divL1.querySelector('div:nth-of-type(1)');
	assert.equal(divL2_1.id, 'div-l2-1');
	assert.equal(divL2_1.children.length, 1);

	const p3 = divL2_1.querySelector('p:nth-of-type(1)');
	assert.equal(p3.id, 'p3');
	assert.equal(p3.textContent, 'before inner after');
	assert.equal(p3.children.length, 1);

	const divL2_2 = divL1.querySelector('div:nth-of-type(2)');
	assert.equal(divL2_2.id, 'div-l2-2');
	assert.equal(divL2_2.children.length, 2);

	const p4 = divL2_2.querySelector('p:nth-of-type(1)');
	assert.equal(p4.id, 'p4');
	assert.equal(p4.textContent, 'before inner after');
	assert.equal(p4.children.length, 1);

	const p5 = divL2_2.querySelector('p:nth-of-type(2)');
	assert.equal(p5.id, 'p5');
	assert.equal(p5.textContent, 'before inner after');
	assert.equal(p5.children.length, 1);
}

/**
 *
 * @param {string} html */
function renderRandomlyCasedHTMLAttributesChecks(html) {
	const { document } = parseHTML(html);

	const td1 = document.querySelector('#td1');
	const td2 = document.querySelector('#td1');
	const td3 = document.querySelector('#td1');
	const td4 = document.querySelector('#td1');

	// all four <td>'s which had randomly cased variants of colspan/rowspan should all be rendered lowercased at this point

	assert.equal(td1.getAttribute('colspan'), '3');
	assert.equal(td1.getAttribute('rowspan'), '2');

	assert.equal(td2.getAttribute('colspan'), '3');
	assert.equal(td2.getAttribute('rowspan'), '2');

	assert.equal(td3.getAttribute('colspan'), '3');
	assert.equal(td3.getAttribute('rowspan'), '2');

	assert.equal(td4.getAttribute('colspan'), '3');
	assert.equal(td4.getAttribute('rowspan'), '2');
}

/**
 * @param {string} html
 */
function renderHTMLWithinPartialChecks(html) {
	const { document } = parseHTML(html);

	const li = document.querySelector('ul > li#partial');
	assert.equal(li.textContent, 'List item');
}

/**
 * Asserts that the rendered HTML tags with interleaved Markdoc tags (both block and inline) rendered in the expected nested graph of elements
 *
 * @param {string} html */
function renderComponentsHTMLChecks(html) {
	const { document } = parseHTML(html);

	const naturalP1 = document.querySelector('article > p:nth-of-type(1)');
	assert.equal(naturalP1.textContent, 'This is a inline mark in regular Markdown markup.');
	assert.equal(naturalP1.children.length, 1);

	const p1 = document.querySelector('article > p:nth-of-type(2)');
	assert.equal(p1.id, 'p1');
	assert.equal(p1.textContent, 'This is a inline mark under some HTML');
	assert.equal(p1.children.length, 1);
	assertInlineMark(p1.children[0]);

	const div1p1 = document.querySelector('article > #div1 > p:nth-of-type(1)');
	assert.equal(div1p1.id, 'div1-p1');
	assert.equal(div1p1.textContent, 'This is a inline mark under some HTML');
	assert.equal(div1p1.children.length, 1);
	assertInlineMark(div1p1.children[0]);

	const div1p2 = document.querySelector('article > #div1 > p:nth-of-type(2)');
	assert.equal(div1p2.id, 'div1-p2');
	assert.equal(div1p2.textContent, 'This is a inline mark under some HTML');
	assert.equal(div1p2.children.length, 1);

	const div1p2span1 = div1p2.querySelector('span');
	assert.equal(div1p2span1.id, 'div1-p2-span1');
	assert.equal(div1p2span1.textContent, 'inline mark');
	assert.equal(div1p2span1.children.length, 1);
	assertInlineMark(div1p2span1.children[0]);

	const aside1 = document.querySelector('article > aside:nth-of-type(1)');
	const aside1Title = aside1.querySelector('p.title');
	assert.equal(aside1Title.textContent.trim(), 'Aside One');
	const aside1Section = aside1.querySelector('section');
	const aside1SectionP1 = aside1Section.querySelector('p:nth-of-type(1)');
	assert.equal(
		aside1SectionP1.textContent,
		"I'm a Markdown paragraph inside an top-level aside tag",
	);
	const aside1H2_1 = aside1Section.querySelector('h2:nth-of-type(1)');
	assert.equal(aside1H2_1.id, 'im-an-h2-via-markdown-markup'); // automatic slug
	assert.equal(aside1H2_1.textContent, "I'm an H2 via Markdown markup");
	const aside1H2_2 = aside1Section.querySelector('h2:nth-of-type(2)');
	assert.equal(aside1H2_2.id, 'h-two');
	assert.equal(aside1H2_2.textContent, "I'm an H2 via HTML markup");
	const aside1SectionP2 = aside1Section.querySelector('p:nth-of-type(2)');
	assert.equal(aside1SectionP2.textContent, 'Markdown bold vs HTML bold');
	assert.equal(aside1SectionP2.children.length, 2);
	const aside1SectionP2Strong1 = aside1SectionP2.querySelector('strong:nth-of-type(1)');
	assert.equal(aside1SectionP2Strong1.textContent, 'Markdown bold');
	const aside1SectionP2Strong2 = aside1SectionP2.querySelector('strong:nth-of-type(2)');
	assert.equal(aside1SectionP2Strong2.textContent, 'HTML bold');

	const article = document.querySelector('article');
	assert.equal(article.textContent.includes('RENDERED'), true);
	assert.notEqual(article.textContent.includes('NOT RENDERED'), true);

	const section1 = document.querySelector('article > #section1');
	const section1div1 = section1.querySelector('#div1');
	const section1Aside1 = section1div1.querySelector('aside:nth-of-type(1)');
	const section1Aside1Title = section1Aside1.querySelector('p.title');
	assert.equal(section1Aside1Title.textContent.trim(), 'Nested un-indented Aside');
	const section1Aside1Section = section1Aside1.querySelector('section');
	const section1Aside1SectionP1 = section1Aside1Section.querySelector('p:nth-of-type(1)');
	assert.equal(section1Aside1SectionP1.textContent, 'regular Markdown markup');
	const section1Aside1SectionP4 = section1Aside1Section.querySelector('p:nth-of-type(2)');
	assert.equal(section1Aside1SectionP4.textContent, 'nested inline mark content');
	assert.equal(section1Aside1SectionP4.children.length, 1);
	assertInlineMark(section1Aside1SectionP4.children[0]);

	const section1div2 = section1.querySelector('#div2');
	const section1Aside2 = section1div2.querySelector('aside:nth-of-type(1)');
	const section1Aside2Title = section1Aside2.querySelector('p.title');
	assert.equal(section1Aside2Title.textContent.trim(), 'Nested indented Aside 💀');
	const section1Aside2Section = section1Aside2.querySelector('section');
	const section1Aside2SectionP1 = section1Aside2Section.querySelector('p:nth-of-type(1)');
	assert.equal(section1Aside2SectionP1.textContent, 'regular Markdown markup');
	const section1Aside1SectionP5 = section1Aside2Section.querySelector('p:nth-of-type(2)');
	assert.equal(section1Aside1SectionP5.id, 'p5');
	assert.equal(section1Aside1SectionP5.children.length, 1);
	const section1Aside1SectionP5Span1 = section1Aside1SectionP5.children[0];
	assert.equal(section1Aside1SectionP5Span1.textContent, 'inline mark');
	assert.equal(section1Aside1SectionP5Span1.children.length, 1);
	const section1Aside1SectionP5Span1Span1 = section1Aside1SectionP5Span1.children[0];
	assert.equal(section1Aside1SectionP5Span1Span1.textContent, ' mark');
}

/** @param {HTMLElement | null | undefined} el */

function assertInlineMark(el) {
	assert.ok(el);
	assert.equal(el.children.length, 0);
	assert.equal(el.textContent, 'inline mark');
	assert.equal(el.className, 'mark');
	assert.equal(el.style.color, 'hotpink');
}
