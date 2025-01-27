import * as xml2js from 'xml2js';
import { loadFixture as baseLoadFixture } from '../../../astro/test/test-utils.js';

/**
 * @typedef {import('../../../astro/test/test-utils').Fixture} Fixture
 */

export function loadFixture(inlineConfig) {
	if (!inlineConfig?.root) throw new Error("Must provide { root: './fixtures/...' }");

	// resolve the relative root (i.e. "./fixtures/tailwindcss") to a full filepath
	// without this, the main `loadFixture` helper will resolve relative to `packages/astro/test`
	return baseLoadFixture({
		...inlineConfig,
		root: new URL(inlineConfig.root, import.meta.url).toString(),
	});
}

export function readXML(fileOrPromise) {
	const parseString = xml2js.parseString;
	return Promise.resolve(fileOrPromise).then((xml) => {
		return new Promise((resolve, reject) => {
			parseString(xml, function (err, result) {
				if (err) return reject(err);
				resolve(result);
			});
		});
	});
}
