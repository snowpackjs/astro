import * as assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';

const LOCALES = ['en_US', 'sv_SE', 'es_419.UTF-8', 'es_ES@euro', 'C'];

describe('logger - dateTimeFormat', () => {
	const originalLang = process.env.LANG;

	after(() => {
		process.env.LANG = originalLang;
	});

	LOCALES.forEach((locale, i) => {
		it(`works with process.env.LANG="${locale}"`, async () => {
			process.env.LANG = locale;
			const { dateTimeFormat } = await import('../../../dist/core/logger/core.js?cachebust=' + i);
			assert.doesNotThrow(() => {
				dateTimeFormat.format(new Date());
			});
		});
	});
});
