import { expect } from '@playwright/test';
import { testFactory, waitForHydrate } from './test-utils.js';

const test = testFactory(import.meta.url, { root: './fixtures/view-transitions/' });

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

function collectLoads(page) {
	const loads = [];
	page.on('load', async () => {
		const url = page.url();
		if (url !== 'about:blank') loads.push(await page.title());
	});
	return loads;
}
function scrollToBottom(page) {
	return page.evaluate(() => {
		window.scrollY = document.documentElement.scrollHeight;
		window.dispatchEvent(new Event('scroll'));
	});
}

function collectPreloads(page) {
	return page.evaluate(() => {
		window.preloads = [];
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) =>
				mutation.addedNodes.forEach((node) => {
					if (node.nodeName === 'LINK' && node.rel === 'preload') preloads.push(node.href);
				}),
			);
		});
		observer.observe(document.head, { childList: true });
	});
}

async function nativeViewTransition(page) {
	return page.evaluate(() => document.startViewTransition !== undefined);
}

test.describe('View Transitions', () => {
	test('Moving from page 1 to page 2', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Back button is captured', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// Back to page 1
		await page.goBack();
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Clicking on a link with nested content', async ({ page, astro }) => {
		const loads = collectLoads(page);
		// Go to page 4
		await page.goto(astro.resolveUrl('/four'));
		let p = page.locator('#four');
		await expect(p, 'should have content').toHaveText('Page 4');

		// Go to page 1
		await page.click('#click-one');
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Clicking on a link to a page with non-recommended headers', async ({ page, astro }) => {
		const loads = collectLoads(page);
		// Go to page 4
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Go to page 1
		await page.click('#click-seven');
		p = page.locator('#seven');
		await expect(p, 'should have content').toHaveText('Page 7');

		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Moving to a page without ClientRouter triggers a full page navigation', async ({
		page,
		astro,
	}) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Go to page 3 which does *not* have ClientRouter enabled
		await page.click('#click-three');
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		expect(
			loads.length,
			'There should be 2 page loads. The original, then going from 3 to 2',
		).toEqual(2);
	});

	test('Moving within a page without ClientRouter does not trigger a full page navigation', async ({
		page,
		astro,
	}) => {
		const loads = collectLoads(page);
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Go to page 3 which does *not* have ClientRouter enabled
		await page.click('#click-three');
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		// click a hash link to navigate further down the page
		await page.click('#click-hash');
		// still on page 3
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		// check that we are further down the page
		const Y = await page.evaluate(() => window.scrollY);
		expect(Y, 'The target is further down the page').toBeGreaterThan(0);

		expect(
			loads.length,
			'There should be only 2 page loads (for page one & three), but no additional loads for the hash change',
		).toEqual(2);
	});

	test('Moving from a page without ClientRouter w/ back button', async ({ page, astro }) => {
		const loads = collectLoads(page);
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Go to page 3 which does *not* have ClientRouter enabled
		await page.click('#click-three');
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		// Back to page 1
		await page.goBack();
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
		expect(
			loads.length,
			'There should be 3 page loads (for page one & three), and an additional loads for the back navigation',
		).toEqual(3);
	});

	test('Stylesheets in the head are waited on', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		await collectPreloads(page);

		// Go to page 2
		await page.click('#click-two');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');
		await expect(p, 'imported CSS updated').toHaveCSS('font-size', '24px');
		const preloads = await page.evaluate(() => window.preloads);
		expect(preloads.length === 1 && preloads[0].endsWith('/two.css')).toBeTruthy();
	});

	test('astro:page-load event fires when navigating to new page', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		const p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		const article = page.locator('#twoarticle');
		await expect(article, 'should have script content').toHaveText('works');
	});

	test('astro:page-load event fires when navigating directly to a page', async ({
		page,
		astro,
	}) => {
		// Go to page 2
		await page.goto(astro.resolveUrl('/two'));
		const article = page.locator('#twoarticle');
		await expect(article, 'should have script content').toHaveText('works');
	});

	test('astro:after-swap event fires right after the swap', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		p = page.locator('#two');
		const h = page.locator('html');
		await expect(h, 'imported CSS updated').toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
	});

	test('No page rendering during swap()', async ({ page, astro }) => {
		// This has been a problem with theme switchers (e.g. for darkmode)
		// Swap() should not trigger any page renders and give users the chance to
		// correct attributes in the astro:after-swap handler before they become visible

		// This test uses a CSS animation to detect page rendering
		// The test succeeds if no additional animation beside those of the
		// view transition is triggered during swap()

		// Only works for browsers with native view transitions
		if (!(await nativeViewTransition(page))) return;

		await page.goto(astro.resolveUrl('/listener-one'));
		let p = page.locator('#totwo');
		await expect(p, 'should have content').toHaveText('Go to listener two');

		// setting the blue class on the html element triggers a CSS animation
		let animations = await page.evaluate(async () => {
			document.documentElement.classList.add('blue');
			return document.getAnimations();
		});
		expect(animations.length).toEqual(1);

		// go to page 2
		await page.click('#totwo');
		p = page.locator('#toone');
		await expect(p, 'should have content').toHaveText('Go to listener one');
		// swap() resets the "blue" class, as it is not set in the static html of page 2
		// The astro:after-swap listener (defined in the layout) sets it to "blue" again.
		// The temporarily missing class must not trigger page rendering.

		// When the after-swap listener starts, no animations should be running
		// after-swap listener sets animations to document.getAnimations().length
		// and we expect this to be zero
		await expect(page.locator('html')).toHaveAttribute('animations', '0');
	});

	test('click hash links does not do navigation', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		const p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Clicking 1 stays put
		await page.click('#click-one');
		await expect(p, 'should have content').toHaveText('Page 1');
	});

	test('click self link (w/o hash) does not do navigation', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		const p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Clicking href="" stays on page
		await page.click('#click-self');
		await expect(p, 'should have content').toHaveText('Page 1');
		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Scroll position restored on back button', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/long-page'));
		let article = page.locator('#longpage');
		await expect(article, 'should have script content').toBeVisible('exists');

		await scrollToBottom(page);
		const oldScrollY = await page.evaluate(() => window.scrollY);

		// go to page long-page
		await page.click('#click-one');
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// Back to page 1
		await page.goBack();

		const newScrollY = await page.evaluate(() => window.scrollY);
		expect(oldScrollY).toEqual(newScrollY);
	});

	test('Fragment scroll position restored on back button', async ({ page, astro }) => {
		// Go to the long page
		await page.goto(astro.resolveUrl('/long-page'));
		let locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();

		// Scroll down to middle fragment
		await page.click('#click-scroll-down');
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();

		// Scroll up to top fragment
		await page.click('#click-scroll-up');
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();

		// Back to middle of the page
		await page.goBack();
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();
	});

	test('Scroll position restored when transitioning back to fragment', async ({ page, astro }) => {
		// Go to the long page
		await page.goto(astro.resolveUrl('/long-page'));
		let locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();

		// Scroll down to middle fragment
		await page.click('#click-scroll-down');
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();

		// goto page 1
		await page.click('#click-one-again');
		locator = page.locator('#one');
		await expect(locator).toHaveText('Page 1');

		// Back to middle of the previous page
		await page.goBack();
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();
	});

	test('Scroll position restored on forward button', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page long-page
		await page.click('#click-longpage');
		let article = page.locator('#longpage');
		await expect(article, 'should have script content').toBeVisible('exists');

		await scrollToBottom(page);
		const oldScrollY = await page.evaluate(() => window.scrollY);

		// Back to page 1
		await page.goBack();

		// Go forward
		await page.goForward();
		article = page.locator('#longpage');
		await expect(article, 'should have script content').toBeVisible('exists');

		const newScrollY = await page.evaluate(() => window.scrollY);
		expect(oldScrollY).toEqual(newScrollY);
	});

	test('Fragment scroll position restored on forward button', async ({ page, astro }) => {
		// Go to the long page
		await page.goto(astro.resolveUrl('/long-page'));
		let locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();

		// Scroll down to middle fragment
		await page.click('#click-scroll-down');
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();

		// Scroll back to top
		await page.goBack();
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();

		// Forward to middle of page
		await page.goForward();
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();
	});

	test('View Transitions Rule', async ({ page, astro }) => {
		let consoleCount = 0;
		page.on('console', (msg) => {
			// This count is used for transition events
			if (msg.text() === 'ready') consoleCount++;
		});
		// Don't test back and forward '' to '', because They are not stored in the history.
		// click '' to '' (transition)
		await page.goto(astro.resolveUrl('/long-page'));
		let locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		let consolePromise = page.waitForEvent('console');
		await page.click('#click-self');
		await consolePromise;
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// click '' to 'hash' (no transition)
		await page.click('#click-scroll-down');
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// back 'hash' to '' (no transition)
		await page.goBack();
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// forward '' to 'hash' (no transition)
		// NOTE: the networkidle below is needed for Firefox to consistently
		// pass the `#longpage` viewport check below
		await page.goForward({ waitUntil: 'networkidle' });
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// click 'hash' to 'hash' (no transition)
		await page.click('#click-scroll-up');
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// back 'hash' to 'hash' (no transition)
		await page.goBack();
		locator = page.locator('#click-one-again');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// forward 'hash' to 'hash' (no transition)
		await page.goForward();
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(1);

		// click 'hash' to '' (transition)
		consolePromise = page.waitForEvent('console');
		await page.click('#click-self');
		await consolePromise;
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(2);

		// back '' to 'hash' (transition)
		consolePromise = page.waitForEvent('console');
		await page.goBack();
		await consolePromise;
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(3);

		// forward 'hash' to '' (transition)
		consolePromise = page.waitForEvent('console');
		await page.goForward();
		await consolePromise;
		locator = page.locator('#longpage');
		await expect(locator).toBeInViewport();
		expect(consoleCount).toEqual(4);
	});

	test('<Image /> component forwards transitions to the <img>', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/image-one'));
		const img = page.locator('img[data-astro-transition-scope]');
		await expect(img).toBeVisible('The image tag should have the transition scope attribute.');
	});

	test('<video> can persist using transition:persist', async ({ page, astro, browserName }) => {
		// NOTE: works locally but fails on CI
		test.skip(browserName === 'firefox', 'Firefox has issues playing the video. Errors on play()');

		const getTime = () => document.querySelector('video').currentTime;

		// Go to page 1
		await page.goto(astro.resolveUrl('/video-one'));
		const vid = page.locator('video');
		await expect(vid).toBeVisible();
		// Mute the video before playing, otherwise there's actually sounds when testing
		await vid.evaluate((el) => (el.muted = true));
		// Browser blocks autoplay, so we manually play it here. For some reason,
		// you need to click and play it manually for it to actually work.
		await vid.click();
		await vid.evaluate((el) => el.play());
		const firstTime = await page.evaluate(getTime);

		// Navigate to page 2
		await page.click('#click-two');
		const vid2 = page.locator('#video-two');
		await expect(vid2).toBeVisible();
		// Use a very short timeout so we can ensure there's always a video playtime gap
		await page.waitForTimeout(50);
		const secondTime = await page.evaluate(getTime);

		expect(secondTime).toBeGreaterThan(firstTime);
	});

	test('React Islands can persist using transition:persist', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/island-one'));
		let cnt = page.locator('.counter pre');
		await expect(cnt).toHaveText('5');

		await page.click('.increment');
		await expect(cnt).toHaveText('6');

		// Navigate to page 2
		await page.click('#click-two');
		const p = page.locator('#island-two');
		await expect(p).toBeVisible();
		cnt = page.locator('.counter pre');
		// Count should remain
		await expect(cnt).toHaveText('6');

		// Props should have changed
		const pageTitle = page.locator('.page');
		await expect(pageTitle).toHaveText('Island 2');
	});

	test('Solid Islands can persist using transition:persist', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/island-solid-one'));
		let cnt = page.locator('.counter pre');
		await expect(cnt).toHaveText('A0');

		await page.click('.increment');
		await expect(cnt).toHaveText('A1');

		// Navigate to page 2
		await page.click('#click-two');
		let p = page.locator('#island-two');
		await expect(p).toBeVisible();
		cnt = page.locator('.counter pre');
		// Count should remain, but the prefix should be updated
		await expect(cnt).toHaveText('B1!');

		await page.click('#click-one');
		p = page.locator('#island-one');
		await expect(p).toBeVisible();
		cnt = page.locator('.counter pre');
		// Count should remain, but the postfix should be removed again (to test unsetting props)
		await expect(cnt).toHaveText('A1');
	});

	test('Svelte Islands can persist using transition:persist', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/island-svelte-one'));
		let cnt = page.locator('.counter pre');
		await expect(cnt).toHaveText('A0');

		await page.click('.increment');
		await expect(cnt).toHaveText('A1');

		// Navigate to page 2
		await page.click('#click-two');
		let p = page.locator('#island-two');
		await expect(p).toBeVisible();
		cnt = page.locator('.counter pre');
		// Count should remain, but the prefix should be updated
		await expect(cnt).toHaveText('B1');
	});

	test('Vue Islands can persist using transition:persist', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/island-vue-one'));
		let cnt = page.locator('.counter pre');
		await expect(cnt).toHaveText('AA0');

		await page.click('.increment');
		await expect(cnt).toHaveText('AA1');

		// Navigate to page 2
		await page.click('#click-two');
		const p = page.locator('#island-two');
		await expect(p).toBeVisible();
		cnt = page.locator('.counter pre');
		// Count should remain, but the prefix should be updated
		await expect(cnt).toHaveText('BB1');
	});

	test('transition:persist-props prevents props from changing', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/island-one?persist'));

		// Navigate to page 2
		await page.click('#click-two');
		const p = page.locator('#island-two');
		await expect(p).toBeVisible();

		// Props should have changed
		const pageTitle = page.locator('.page');
		await expect(pageTitle).toHaveText('Island 1');
	});

	test('transition:persist-props=false makes props update', async ({ page, astro }) => {
		// Go to page 2
		await page.goto(astro.resolveUrl('/island-two'));

		// Navigate to page 1
		await page.click('#click-one');
		const p = page.locator('#island-one');
		await expect(p).toBeVisible();

		// Props should have changed
		const pageTitle = page.locator('.page');
		await expect(pageTitle).toHaveText('Island 1');
	});

	test('Scripts are only executed once', async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		const p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		const article = page.locator('#twoarticle');
		await expect(article, 'should have script content').toHaveText('works');

		const meta = page.locator('[name="script-executions"]');
		await expect(meta).toHaveAttribute('content', '0');
	});

	test('Navigating to the same path but with different query params should result in transition', async ({
		page,
		astro,
	}) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/query'));
		let p = page.locator('#query-page');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		p = page.locator('#query-page');
		await expect(p, 'should have content').toHaveText('Page 2');

		await expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Importing ClientRouter w/o using the component must not mess with history', async ({
		page,
		astro,
	}) => {
		const loads = collectLoads(page);

		// Go to the half bakeed page
		await page.goto(astro.resolveUrl('/half-baked'));
		let p = page.locator('#half-baked');
		await expect(p, 'should have content').toHaveText('Half Baked');

		// click a hash link to navigate further down the page
		await page.click('#click-hash');
		// still on page
		p = page.locator('#half-baked');
		await expect(p, 'should have content').toHaveText('Half Baked');

		// go back within same page without reloading
		await page.goBack();
		p = page.locator('#half-baked');
		await expect(p, 'should have content').toHaveText('Half Baked');

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for going back on same page',
		).toEqual(1);
	});

	test('Navigation also swaps the attributes of the document root', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/some-attributes'));
		let p = page.locator('#heading');
		await expect(p, 'should have content').toHaveText('Page with some attributes');

		let h = page.locator('html');
		await expect(h, 'should have content').toHaveAttribute('lang', 'en');

		await page.click('#click-other-attributes');
		p = page.locator('#heading');
		await expect(p, 'should have content').toHaveText('Page with other attributes');

		h = page.locator('html');
		await expect(h, 'should have content').toHaveAttribute('lang', 'es');
		await expect(h, 'should have content').toHaveAttribute('style', 'background-color: green');
		await expect(h, 'should have content').toHaveAttribute('data-other-name', 'value');
		await expect(h, 'should have content').toHaveAttribute('data-astro-fake', 'value');
		await expect(h, 'should have content').toHaveAttribute('data-astro-transition', 'forward');
		await expect(h, 'should be absent').not.toHaveAttribute('class', /.*/);
	});

	test('Link with data-astro-reload attribute should trigger page load, no transition', async ({
		page,
		astro,
	}) => {
		const loads = collectLoads(page);

		// Go to page 4
		await page.goto(astro.resolveUrl('/four'));
		let p = page.locator('#four');
		await expect(p, 'should have content').toHaveText('Page 4');

		// go to page 2
		await page.click('#click-two');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// go to next page
		await page.click('#click-longpage');

		expect(loads.length, 'There should be 2 page load').toEqual(2);
	});

	test('Link with download attribute should trigger download, no transition', async ({
		page,
		astro,
	}) => {
		// Go to page 4
		await page.goto(astro.resolveUrl('/four'));
		let p = page.locator('#four');
		await expect(p, 'should have content').toHaveText('Page 4');

		// Start waiting for download before clicking. Note no await.
		const downloadPromise = page.waitForEvent('download', { timeout: 4000 });
		await page.click('#click-logo');
		await downloadPromise;
	});

	test('data-astro-reload not required for non-html content', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 4
		await page.goto(astro.resolveUrl('/four'));
		let p = page.locator('#four');
		await expect(p, 'should have content').toHaveText('Page 4');

		await page.click('#click-svg');
		p = page.locator('svg');
		await expect(p).toBeVisible();
		expect(loads.length, 'There should be 2 page load').toEqual(2);
	});

	test('Scroll position is restored on back navigation from page w/o ClientRouter', async ({
		page,
		astro,
	}) => {
		// Go to middle of long page
		await page.goto(astro.resolveUrl('/long-page#click-external'));

		let locator = page.locator('#click-external');
		await expect(locator).toBeInViewport();

		// Go to a page that has not enabled ClientRouter
		await page.click('#click-external');
		locator = page.locator('#three');
		await expect(locator).toHaveText('Page 3');

		// Scroll back to long page
		await page.goBack();
		locator = page.locator('#click-external');
		await expect(locator).toBeInViewport();
	});

	test("Non transition navigation doesn't loose handlers", async ({ page, astro }) => {
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 3
		await page.click('#click-three');
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		// go to page 5
		await page.click('#click-five');
		p = page.locator('#five');
		await expect(p, 'should have content').toHaveText('Page 5');

		await page.goBack();
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		await page.goBack();
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
	});

	test('Moving to a page which redirects to another', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-redirect-two');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// go back
		await page.goBack();
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		expect(
			loads.length,
			'There should only be the initial page load and two normal transitions',
		).toEqual(1);
	});

	test('Redirect to external site causes page load', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to external page
		await page.click('#click-redirect-external');
		// doesn't work for playwright when we are too fast

		await page.waitForURL('http://example.com');
		await expect(page.locator('h1'), 'should have content').toHaveText('Example Domain');
		expect(loads.length, 'There should be 2 page loads').toEqual(2);
	});

	test('Cross origin redirects do not raise errors', async ({ page, astro }) => {
		let consoleErrors = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});
		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		await page.click('#click-redirect');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		expect(consoleErrors.length, 'There should be no errors').toEqual(0);
	});

	test('client:only styles are retained on transition (1/2)', async ({ page, astro }) => {
		const totalExpectedStyles = 9;

		await page.goto(astro.resolveUrl('/client-only-one'));
		let msg = page.locator('.counter-message');
		await expect(msg).toHaveText('message here');

		let styles = await page.locator('style').all();
		expect(styles.length).toEqual(totalExpectedStyles);

		await page.click('#click-two');

		let pageTwo = page.locator('#page-two');
		await expect(pageTwo, 'should have content').toHaveText('Page 2');

		styles = await page.locator('style').all();
		expect(styles.length).toEqual(totalExpectedStyles, 'style count has not changed');
	});

	test('client:only styles are retained on transition (2/2)', async ({ page, astro }) => {
		const totalExpectedStyles_page_three = 11;
		const totalExpectedStyles_page_four = 9;

		await page.goto(astro.resolveUrl('/client-only-three'));
		let msg = page.locator('#name');
		await expect(msg).toHaveText('client-only-three');
		await waitForHydrate(page, page.getByText('Vue'));
		await waitForHydrate(page, page.getByText('Svelte'));

		let styles = await page.locator('style').all();
		expect(styles.length).toEqual(totalExpectedStyles_page_three);

		await page.click('#click-four');

		let pageTwo = page.locator('#page-four');
		await expect(pageTwo, 'should have content').toHaveText('Page 4');

		styles = await page.locator('style').all();
		expect(styles.length).toEqual(totalExpectedStyles_page_four, 'style count has not changed');
	});

	test('Horizontal scroll position restored on back button', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/wide-page'));
		let article = page.locator('#widepage');
		await expect(article, 'should have script content').toBeVisible('exists');

		let locator = page.locator('#click-one');
		await expect(locator).not.toBeInViewport();

		await page.click('#click-right');
		locator = page.locator('#click-one');
		await expect(locator).toBeInViewport();
		locator = page.locator('#click-top');
		await expect(locator).toBeInViewport();

		await page.click('#click-one');
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		await page.goBack();
		locator = page.locator('#click-one');
		await expect(locator).toBeInViewport();

		locator = page.locator('#click-top');
		await expect(locator).toBeInViewport();

		await page.click('#click-top');
		locator = page.locator('#click-one');
		await expect(locator).not.toBeInViewport();
	});

	test('Use the client side router', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/six'));
		// page six loads the router and automatically uses the router to navigate to page 1
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// nudge to jump to page 2
		await page.evaluate(() => {
			window.dispatchEvent(new Event('jumpToTwo'));
		});
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// jump to page 3
		await page.evaluate(() => {
			// get the router from its fixture park position
			const navigate = window.clientSideRouterForTestsParkedHere;
			navigate('/three');
		});
		p = page.locator('#three');
		await expect(p, 'should have content').toHaveText('Page 3');

		// go back
		await page.goBack();
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// no bad things happen when we revisit redirecting to page 6
		await page.goto(astro.resolveUrl('/six'));
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
	});

	test('Use the client side router in framework components', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/client-load'));

		// the button is set to navigate() to /two
		const button = page.locator('#react-client-load-navigate-button');

		await expect(button, 'should have content').toHaveText('Navigate to `/two`');

		await button.click();

		const p = page.locator('#two');

		await expect(p, 'should have content').toHaveText('Page 2');
	});

	test('body inline scripts do not re-execute on navigation', async ({ page, astro }) => {
		const errors = [];
		page.addListener('pageerror', (err) => {
			errors.push(err);
		});

		await page.goto(astro.resolveUrl('/inline-script-one'));
		let article = page.locator('#counter');
		await expect(article, 'should have script content').toBeVisible('exists');

		await page.click('#click-one');

		article = page.locator('#counter');
		await expect(article, 'should have script content').toHaveText('Count: 3');

		expect(errors).toHaveLength(0);
	});

	test('replace history', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/one'));

		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to page 2
		await page.click('#click-two');
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// replace with long page
		await page.click('#click-longpage');
		let article = page.locator('#longpage');
		await expect(article, 'should have script content').toBeVisible('exists');

		// one step back == #1
		await page.goBack();
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
	});

	test('CSR replace history', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/six'));
		// page six loads the router and automatically uses the router to navigate to page 1
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// goto #2
		await page.evaluate(() => {
			window.clientSideRouterForTestsParkedHere('/two', { history: 'auto' });
		});
		p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');

		// replace with long page
		await page.evaluate(() => {
			window.clientSideRouterForTestsParkedHere('/long-page', { history: 'replace' });
		});
		let article = page.locator('#longpage');
		await expect(article, 'should have script content').toBeVisible('exists');

		// one step back == #1
		await page.goBack();
		p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
	});

	test('Keep focus on transition', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/page-with-persistent-form'));
		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Form 1');

		locator = page.locator('#input');
		await locator.type('Hello');
		await expect(locator).toBeFocused();
		await locator.press('Enter');

		await page.waitForURL(/.*name=Hello/);
		locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Form 1');
		locator = page.locator('#input');
		await expect(locator).toBeFocused();

		await locator.type(' World');
		await expect(locator).toHaveValue('Hello World');
	});

	test('form POST that redirects to another page is handled', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/form-one'));

		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Contact Form');

		// Submit the form
		await page.click('#submit');
		const span = page.locator('#contact-name');
		await expect(span, 'should have content').toHaveText('Testing');

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for the form submission',
		).toEqual(1);
	});

	test('form POST that action for cross-origin is opt-out', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/form-five'));
		page.on('request', (request) => expect(request.method()).toBe('POST'));
		// Submit the form
		await page.click('#submit');
	});

	test('form GET that redirects to another page is handled', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/form-one?method=get'));

		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Contact Form');

		// Submit the form
		await page.click('#submit');
		const span = page.locator('#contact-name');
		await expect(span, 'should have content').toHaveText('Testing');

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for the form submission',
		).toEqual(1);
	});

	test('form POST when there is an error shows the error', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/form-one?throw'));

		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Contact Form');

		// Submit the form
		await page.click('#submit');
		const overlay = page.locator('vite-error-overlay');
		await expect(overlay).toBeVisible();

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for the form submission',
		).toEqual(1);
	});

	test('form POST defaults to multipart/form-data (Astro 4.x compatibility)', async ({
		page,
		astro,
	}) => {
		const loads = collectLoads(page);

		const postedEncodings = [];

		await page.route('**/contact', async (route) => {
			const request = route.request();

			if (request.method() === 'POST') {
				postedEncodings.push(request.headers()['content-type'].split(';')[0]);
			}

			await route.continue();
		});

		await page.goto(astro.resolveUrl('/form-one'));

		// Submit the form
		await page.click('#submit');

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for the form submission',
		).toEqual(1);

		expect(
			postedEncodings,
			'There should be 1 POST, with encoding set to `multipart/form-data`',
		).toEqual(['multipart/form-data']);
	});

	test('form POST respects enctype attribute', async ({ page, astro }) => {
		const loads = collectLoads(page);

		const postedEncodings = [];

		await page.route('**/contact', async (route) => {
			const request = route.request();

			if (request.method() === 'POST') {
				postedEncodings.push(request.headers()['content-type'].split(';')[0]);
			}

			await route.continue();
		});

		await page.goto(
			astro.resolveUrl(
				`/form-one?${new URLSearchParams({ enctype: 'application/x-www-form-urlencoded' })}`,
			),
		);

		// Submit the form
		await page.click('#submit');

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for the form submission',
		).toEqual(1);

		expect(
			postedEncodings,
			'There should be 1 POST, with encoding set to `multipart/form-data`',
		).toEqual(['application/x-www-form-urlencoded']);
	});

	test('form POST that includes an input with name action should not override action', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/form-six'));
		page.on('request', (request) => {
			expect(request.url()).toContain('/bar');
		});
		// Submit the form
		await page.click('#submit');
	});

	test('form without method that includes an input with name method should not override default method', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/form-seven'));
		page.on('request', (request) => {
			expect(request.method()).toBe('GET');
		});
		// Submit the form
		await page.click('#submit');
	});

	test('Route announcer is invisible on page transition', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/no-directive-one'));

		let locator = page.locator('#one');
		await expect(locator, 'should have content').toHaveText('One');

		await page.click('a');
		locator = page.locator('#two');
		await expect(locator, 'should have content').toHaveText('Two');

		let announcer = page.locator('.astro-route-announcer');
		await expect(announcer, 'should have content').toHaveCSS('width', '1px');
	});

	test('should prefetch on hover by default', async ({ page, astro }) => {
		/** @type {string[]} */
		const reqUrls = [];
		page.on('request', (req) => {
			reqUrls.push(new URL(req.url()).pathname);
		});
		await page.goto(astro.resolveUrl('/prefetch'));
		expect(reqUrls).not.toContainEqual('/one');
		await Promise.all([
			page.waitForEvent('request'), // wait prefetch request
			page.locator('#prefetch-one').hover(),
		]);
		expect(reqUrls).toContainEqual('/one');
	});

	test('form POST with no action handler', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/form-two'));

		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Contact Form');

		// Submit the form
		await page.click('#submit');
		const span = page.locator('#contact-name');
		await expect(span, 'should have content').toHaveText('Testing');

		expect(
			loads.length,
			'There should be only 1 page load. No additional loads for the form submission',
		).toEqual(1);
	});

	test('forms are overridden by formmethod and formaction', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/form-three'));

		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Contact Form');

		// Submit the form
		await page.click('#submit');
		const result = page.locator('#three-result');
		await expect(result, 'should have content').toHaveText('Got: Testing');
	});

	test('click on an svg anchor should trigger navigation', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/non-html-anchor'));
		let locator = page.locator('#insidesvga');
		await expect(locator, 'should have attribute').toHaveAttribute('x', '10');
		await page.click('#svga');
		const p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');
		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('click inside an svg anchor should trigger navigation', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/non-html-anchor'));
		let locator = page.locator('#insidesvga');
		await expect(locator, 'should have content').toHaveText('text within a svga');
		await page.click('#insidesvga');
		const p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');
		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('click on an area in an image map should trigger navigation', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/non-html-anchor'));
		let locator = page.locator('#area');
		await expect(locator, 'should have attribute').toHaveAttribute('shape', 'default');
		await page.click('#logo');
		const p = page.locator('#two');
		await expect(p, 'should have content').toHaveText('Page 2');
		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('Submitter with a name property is included in form data', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/form-four'));

		let locator = page.locator('h2');
		await expect(locator, 'should have content').toHaveText('Voting Form');

		// Submit the form
		const expected = page.url() + '?stars=3';
		await page.click('#three');
		await expect(page).toHaveURL(expected);
	});

	test('Dialog using form with method of "dialog" should not trigger navigation', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/dialog'));

		let requests = [];
		page.on('request', (request) => requests.push(`${request.method()} ${request.url()}`));

		await page.click('#open');
		await expect(page.locator('dialog')).toHaveAttribute('open');
		await page.click('#close');
		await expect(page.locator('dialog')).not.toHaveAttribute('open');

		expect(requests).toHaveLength(0);
	});

	test('view transition should also work with 404 page', async ({ page, astro }) => {
		const loads = collectLoads(page);

		// Go to page 1
		await page.goto(astro.resolveUrl('/one'));
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');

		// go to 404
		await page.click('#click-404');
		p = page.locator('#FourOhFour');
		await expect(p, 'should have content').toHaveText('Page not found');

		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('custom elements can trigger a view transition', async ({ page, astro }) => {
		const loads = collectLoads(page);

		await page.goto(astro.resolveUrl('/one'));
		await expect(page.locator('#one'), 'should have content').toHaveText('Page 1');
		// go to page 2
		await page.click('#custom-click-two');
		await expect(page.locator('#two'), 'should have content').toHaveText('Page 2');

		expect(loads.length, 'There should only be 1 page load').toEqual(1);
	});

	test('transition:name should be escaped correctly', async ({ page, astro }) => {
		// view-transition-name errors on browser w/o native support
		if (!(await nativeViewTransition(page))) return;
		const expectedAnimations = new Set();
		const checkName = async (selector, name) => {
			expectedAnimations.add(name);
			expect(page.locator(selector), 'should be escaped correctly').toHaveCSS(
				'view-transition-name',
				name,
			);
		};

		page.on('console', (msg) => {
			if (msg.text().startsWith('anim: ')) {
				const split = msg.text().split(' ', 2);
				expectedAnimations.delete(split[1]);
			}
		});

		await page.goto(astro.resolveUrl('/transition-name'));

		await checkName('#one', 'front-end');
		await checkName('#two', '开源');
		await checkName('#three', '开a源');
		await checkName('#four', 'c开a源c');
		await checkName('#five', 'オープンソース');
		await checkName('#six', '开_24源');
		await checkName('#seven', '开_2e源');
		await checkName('#eight', '🐎👱❤');
		await checkName('#nine', '_--9');
		await checkName('#ten', '_10');
		await checkName('#eleven', '_-11');
		await checkName('#twelve', '__23_21_20_2f');
		await checkName('#thirteen', '___01____02______');
		await checkName(
			'#batch0',
			'__00_01_02_03_04_05_06_07_08_09_0a_0b_0c_0d_0e_0f_10_11_12_13_14_15_16_17_18_19_1a_1b_1c_1d_1e_1f',
		);
		await checkName(
			'#batch1',
			'__20_21_22_23_24_25_26_27_28_29_2a_2b_2c-_2e_2f0123456789_3a_3b_3c_3d_3e_3f',
		);
		await checkName('#batch2', '__40ABCDEFGHIJKLMNOPQRSTUVWXYZ_5b_5c_5d_5e__');
		await checkName('#batch3', '__60abcdefghijklmnopqrstuvwxyz_7b_7c_7d_7e_7f');
		await checkName(
			'#batch4',
			'\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f',
		);
		await checkName(
			'#batch5',
			'\xa0\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf',
		);
		await checkName(
			'#batch6',
			'\xc0\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf',
		);
		await checkName(
			'#batch7',
			'\xe0\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff',
		);

		await page.click('#navigate');
		await page.waitForTimeout(400); // yes, I dislike this, too. Might fix later.
		expect(
			expectedAnimations.size,
			'all animations for transition:names should have been found',
		).toEqual(0);
	});

	test('transition:persist persists selection', async ({ page, astro }) => {
		let text = '';
		page.on('console', (msg) => {
			text = msg.text();
		});
		await page.goto(astro.resolveUrl('/persist-1'));
		await expect(page.locator('#one'), 'should have content').toHaveText('Persist 1');
		// go to page 2
		await page.press('input[name="name"]', 'Enter');
		await expect(page.locator('#two'), 'should have content').toHaveText('Persist 2');
		expect(text).toBe('true some cool text 5 9');

		await page.goBack();
		await expect(page.locator('#one'), 'should have content').toHaveText('Persist 1');
		expect(text).toBe('true true');
	});

	test('it should be easy to define a data-theme preserving swap function', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/keep-theme-one'));
		await expect(page.locator('#name'), 'should have content').toHaveText('Keep Theme');
		await page.$eval(':root', (element) => element.setAttribute('data-theme', 'purple'));

		await page.click('#click');
		await expect(page.locator('#name'), 'should have content').toHaveText('Keep 2');

		const attributeValue = await page.$eval(
			':root',
			(element, attributeName) => element.getAttribute(attributeName),
			'data-theme',
		);
		expect(attributeValue).toBe('purple');
	});

	test('it should be easy to define a swap function that preserves a dynamically generated style sheet', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/keep-style-one'));
		await expect(page.locator('#name'), 'should have content').toHaveText('Keep Style');
		await page.evaluate(() => {
			const style = document.createElement('style');
			style.textContent = 'body { background-color: purple; }';
			document.head.insertAdjacentElement('afterbegin', style);
		});

		await page.click('#click');
		await expect(page.locator('#name'), 'should have content').toHaveText('Keep 2');

		const styleElement = await page.$('head > style:nth-child(1)');
		const styleContent = await page.evaluate((style) => style.innerHTML, styleElement);
		expect(styleContent).toBe('body { background-color: purple; }');
	});

	test('it should be easy to define a swap function that only swaps the main area', async ({
		page,
		astro,
	}) => {
		await page.goto(astro.resolveUrl('/replace-main-one'));
		await expect(page.locator('#name'), 'should have content').toHaveText('Replace Main Section');

		await page.click('#click');
		// name inside <main> should have changed
		await expect(page.locator('#name'), 'should have content').toHaveText('Keep 2');

		// link outside <main> should still be there
		const link = await page.$('#click');
		expect(link).toBeTruthy();
	});

	test('chaining should execute in the expected order', async ({ page, astro }) => {
		let lines = [];
		page.on('console', (msg) => {
			msg.text().startsWith('[test]') && lines.push(msg.text().slice('[test]'.length + 1));
		});

		await page.goto(astro.resolveUrl('/chaining'));
		await expect(page.locator('#name'), 'should have content').toHaveText('Chaining');
		await page.click('#click');
		await expect(page.locator('#one'), 'should have content').toHaveText('Page 1');
		expect(lines.join('..')).toBe('5..4..3..2..1..0');
	});

	test('Navigation should be interruptible', async ({ page, astro }) => {
		await page.goto(astro.resolveUrl('/abort'));
		// implemented in /abort:
		// clicks on slow loading page two
		// after short delay clicks on fast loading page one
		// even after some delay /two should not show up
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
	});

	test('animation get canceled when view transition is interrupted', async ({ page, astro }) => {
		let lines = [];
		page.on('console', (msg) => {
			msg.text().startsWith('[test]') && lines.push(msg.text());
		});
		await page.goto(astro.resolveUrl('/abort2'));
		// implemented in /abort2:
		// Navigate to self with a 10 second animation
		// shortly after starting that, change your mind an navigate to /one
		// check that animations got canceled
		let p = page.locator('#one');
		await expect(p, 'should have content').toHaveText('Page 1');
		// This test would be more important for a browser without native view transitions
		// as those do not have automatic cancelation of transitions.
		// For simulated view transitions, the last line would be missing
		// as enter and exit animations don't run in parallel.

		let expected = '[test] navigate to "."\n[test] navigate to /one\n[test] cancel astroFadeOut';
		const native = await nativeViewTransition(page);
		if (native) {
			expected += '\n[test] cancel astroFadeIn';
		}
		await page.click('#click-two');
		expect(lines.join('\n')).toBe(expected);
	});
});
