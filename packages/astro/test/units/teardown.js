import fs from 'node:fs';

export default function teardown(testPassed) {
	// Delete all directories within `_temp-fixtures` directory if all test passed
	if (testPassed) {
		try {
			const tempFixturesDir = new URL('./_temp-fixtures/', import.meta.url);
			const entries = fs.readdirSync(tempFixturesDir);
			for (const entry of entries) {
				if (entry === 'package.json' || entry === 'node_modules') continue;
				const dir = new URL(entry, tempFixturesDir);
				fs.rmSync(dir, { recursive: true });
			}
		} catch (e) {
			console.error('Failed to delete temp fixtures');
			throw e;
		}
	}
}
