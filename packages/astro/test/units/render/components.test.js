import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { createFixture, createRequestAndResponse, runInContainer } from '../test-utils.js';

describe('core/render components', () => {
	it('should sanitize dynamic tags', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `
				---
				const TagA = 'p style=color:red;'
				const TagB = 'p><script id="pwnd">console.log("pwnd")</script>'
				---
				<html>
					<head><title>testing</title></head>
					<body>
						<TagA id="target" />
						<TagB />
					</body>
				</html>
			`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					logLevel: 'silent',
					integrations: [],
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);

				await done;
				const html = await text();
				const $ = cheerio.load(html);
				const target = $('#target');

				assert.ok(target);
				assert.equal(target.attr('id'), 'target');
				assert.equal(typeof target.attr('style'), 'undefined');

				assert.equal($('#pwnd').length, 0);
			},
		);
	});

	it('should merge `class` and `class:list`', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `
				---
				import Class from '../components/Class.astro';
				import ClassList from '../components/ClassList.astro';
				import BothLiteral from '../components/BothLiteral.astro';
				import BothFlipped from '../components/BothFlipped.astro';
				import BothSpread from '../components/BothSpread.astro';
				---
				<Class class="red blue" />
				<ClassList class:list={{ red: true, blue: true }} />
				<BothLiteral class="red" class:list={{ blue: true }} />
				<BothFlipped class:list={{ blue: true }} class="red" />
				<BothSpread class:list={{ blue: true }} { ...{ class: "red" }} />
			`,
			'/src/components/Class.astro': `<pre id="class" set:html={JSON.stringify(Astro.props)} />`,
			'/src/components/ClassList.astro': `<pre id="class-list" set:html={JSON.stringify(Astro.props)} />`,
			'/src/components/BothLiteral.astro': `<pre id="both-literal" set:html={JSON.stringify(Astro.props)} />`,
			'/src/components/BothFlipped.astro': `<pre id="both-flipped" set:html={JSON.stringify(Astro.props)} />`,
			'/src/components/BothSpread.astro': `<pre id="both-spread" set:html={JSON.stringify(Astro.props)} />`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					logLevel: 'silent',
					integrations: [],
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);

				await done;
				const html = await text();
				const $ = cheerio.load(html);

				const check = (name) => JSON.parse($(name).text() || '{}');

				const Class = check('#class');
				const ClassList = check('#class-list');
				const BothLiteral = check('#both-literal');
				const BothFlipped = check('#both-flipped');
				const BothSpread = check('#both-spread');

				assert.deepEqual(Class, { class: 'red blue' }, '#class');
				assert.deepEqual(ClassList, { class: 'red blue' }, '#class-list');
				assert.deepEqual(BothLiteral, { class: 'red blue' }, '#both-literal');
				assert.deepEqual(BothFlipped, { class: 'red blue' }, '#both-flipped');
				assert.deepEqual(BothSpread, { class: 'red blue' }, '#both-spread');
			},
		);
	});

	it('should render component with `null` response', async () => {
		const fixture = await createFixture({
			'/src/pages/index.astro': `
				---
				import NullComponent from '../components/NullComponent.astro';
				---
				<NullComponent />
			`,
			'/src/components/NullComponent.astro': `
				---
				return null;
				---
			`,
		});

		await runInContainer(
			{
				inlineConfig: {
					root: fixture.path,
					logLevel: 'silent',
				},
			},
			async (container) => {
				const { req, res, done, text } = createRequestAndResponse({
					method: 'GET',
					url: '/',
				});
				container.handle(req, res);

				await done;
				const html = await text();
				const $ = cheerio.load(html);

				assert.equal($('body').text(), '');
				assert.equal(res.statusCode, 200);
			},
		);
	});
});
