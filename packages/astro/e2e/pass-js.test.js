import { expect } from '@playwright/test';
import { testFactory } from './test-utils.js';

const test = testFactory(import.meta.url, {
	root: './fixtures/pass-js/',
});

let devServer;

test.beforeAll(async ({ astro }) => {
	devServer = await astro.startDevServer();
});

test.afterAll(async () => {
	await devServer.stop();
});

test.describe('Passing JS into client components', () => {
	test('Primitive values', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		// undefined
		const undefinedType = page.locator('#undefined-type');
		await expect(undefinedType, 'is visible').toBeVisible();
		await expect(undefinedType).toHaveText('[object Undefined]');

		// null
		const nullType = page.locator('#null-type');
		await expect(nullType, 'is visible').toBeVisible();
		await expect(nullType).toHaveText('[object Null]');

		// boolean
		const booleanType = page.locator('#boolean-type');
		await expect(booleanType, 'is visible').toBeVisible();
		await expect(booleanType).toHaveText('[object Boolean]');

		const booleanValue = page.locator('#boolean-value');
		await expect(booleanValue, 'is visible').toBeVisible();
		await expect(booleanValue).toHaveText('true');

		// number
		const numberType = page.locator('#number-type');
		await expect(numberType, 'is visible').toBeVisible();
		await expect(numberType).toHaveText('[object Number]');

		const numberValue = page.locator('#number-value');
		await expect(numberValue, 'is visible').toBeVisible();
		await expect(numberValue).toHaveText('16');

		const infinityType = page.locator('#infinity-type');
		await expect(infinityType, 'is visible').toBeVisible();
		await expect(infinityType).toHaveText('[object Number]');

		const negativeInfinityType = page.locator('#negative-infinity-type');
		await expect(negativeInfinityType, 'is visible').toBeVisible();
		await expect(negativeInfinityType).toHaveText('[object Number]');

		const infinityValue = page.locator('#infinity-value');
		await expect(infinityValue, 'is visible').toBeVisible();
		await expect(infinityValue).toHaveText('Infinity');

		const negativeInfinityValue = page.locator('#negative-infinity-value');
		await expect(negativeInfinityValue, 'is visible').toBeVisible();
		await expect(negativeInfinityValue).toHaveText('-Infinity');

		// string
		const stringType = page.locator('#string-type');
		await expect(stringType, 'is visible').toBeVisible();
		await expect(stringType).toHaveText('[object String]');

		const stringValue = page.locator('#string-value');
		await expect(stringValue, 'is visible').toBeVisible();
		await expect(stringValue).toHaveText('abc');
	});

	test('BigInts', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const bigIntType = page.locator('#bigint-type');
		await expect(bigIntType, 'is visible').toBeVisible();
		await expect(bigIntType).toHaveText('[object BigInt]');

		const bigIntValue = page.locator('#bigint-value');
		await expect(bigIntValue, 'is visible').toBeVisible();
		await expect(bigIntValue).toHaveText('11');
	});

	test('Complex nested objects', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		// Date
		const dateType = page.locator('#date-type');
		await expect(dateType, 'is visible').toBeVisible();
		await expect(dateType).toHaveText('[object Date]');

		const dateValue = page.locator('#date-value');
		await expect(dateValue, 'is visible').toBeVisible();
		await expect(dateValue).toHaveText('Thu, 09 Jun 2022 14:18:27 GMT');

		// RegExp
		const regExpType = page.locator('#regexp-type');
		await expect(regExpType, 'is visible').toBeVisible();
		await expect(regExpType).toHaveText('[object RegExp]');

		const regExpValue = page.locator('#regexp-value');
		await expect(regExpValue, 'is visible').toBeVisible();
		await expect(regExpValue).toHaveText('ok');
	});

	test('Arrays that look like the serialization format', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		const arrayType = page.locator('#array-type');
		await expect(arrayType, 'is visible').toBeVisible();
		await expect(arrayType).toHaveText('[object Array]');

		const arrayValue = page.locator('#array-value');
		await expect(arrayValue, 'is visible').toBeVisible();
		await expect(arrayValue).toHaveText('0,foo');
	});

	test('Maps and Sets', async ({ astro, page }) => {
		await page.goto(astro.resolveUrl('/'));

		// Map
		const mapType = page.locator('#map-type');
		await expect(mapType, 'is visible').toBeVisible();
		await expect(mapType).toHaveText('[object Map]');

		const mapValues = page.locator('#map-items li');
		expect(await mapValues.count()).toEqual(2);

		const texts = await mapValues.allTextContents();
		expect(texts).toEqual(['test1: test2', 'test3: test4']);

		// Set
		const setType = page.locator('#set-type');
		await expect(setType, 'is visible').toBeVisible();
		await expect(setType).toHaveText('[object Set]');

		const setValue = page.locator('#set-value');
		await expect(setValue, 'is visible').toBeVisible();
		await expect(setValue).toHaveText('test1,test2');
	});
});
