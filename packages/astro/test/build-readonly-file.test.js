import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import testAdapter from './test-adapter.js';
import { loadFixture } from './test-utils.js';

describe('When a read-only file exists in /public (static)', () => {
	let fixture;
	let testFilePath;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/build-readonly-file/',
		});

		testFilePath = fileURLToPath(fixture.config.publicDir) + 'test.txt';
		fs.chmodSync(testFilePath, 0o444);
	});

	it('Gets successfully build', async () => {
		await fixture.build();
	});

	after(() => {
		fs.chmodSync(testFilePath, 0o666);
		fixture.clean();
	});
});

describe('When a read-only file exists in /public (server)', () => {
	let fixture;
	let testFilePath;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/build-readonly-file/',
			adapter: testAdapter(),
		});

		testFilePath = fileURLToPath(fixture.config.publicDir) + 'test.txt';
		fs.chmodSync(testFilePath, 0o444);
	});

	it('Gets successfully build', async () => {
		await fixture.build();
	});

	after(() => {
		fs.chmodSync(testFilePath, 0o666);
		fixture.clean();
	});
});
