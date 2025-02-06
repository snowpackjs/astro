import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import * as cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('react-jsx-export', () => {
	let fixture;
	let logs = [];

	const ids = [
		'anonymous_arrow_default_export',
		'anonymous_function_default_export',
		'named_arrow_default_export',
		'named_Function_default_export',
		'export_const_declaration',
		'export_let_declaration',
		'export_function_declaration',
		'default_list_export',
		'renamed_list_export',
		'list_as_default_export',
		'list_export_test_component',
		'hoc_default_export',
	];

	const reactInvalidHookWarning =
		'Warning: Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons';
	before(async () => {
		const logging = {
			dest: {
				write(chunk) {
					logs.push(chunk);
				},
			},
			level: 'warn',
		};
		fixture = await loadFixture({
			root: './fixtures/react-jsx-export/',
		});
		await fixture.build({ logging });
	});

	it('Can load all JSX components', async () => {
		const html = await fixture.readFile('/index.html');
		const $ = cheerio.load(html);

		for (const id of ids) {
			assert.equal($(`#${id}`).text(), 'Example');
		}
	});

	it('Cannot output React Invalid Hook warning', async () => {
		assert.equal(
			logs.every((log) => log.message.indexOf(reactInvalidHookWarning) === -1),
			true,
		);
	});
});
