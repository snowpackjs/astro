#!/usr/bin/env node
export default async function run() {
	const [cmd, ...args] = process.argv.slice(2);
	switch (cmd) {
		case 'dev':
		case 'build': {
			const { default: build } = await import('./cmd/build.js');
			await build(...args, cmd === 'dev' ? 'IS_DEV' : undefined);
			break;
		}
		case 'prebuild': {
			const { default: prebuild } = await import('./cmd/prebuild.js');
			await prebuild(...args);
			break;
		}
		case 'test': {
			const { default: test } = await import('./cmd/test.js');
			await test(...args);
			break;
		}
	}
}

run();
