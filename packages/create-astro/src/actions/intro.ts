import type { Context } from './context.js';

import { color, label } from '@astrojs/cli-kit';
import { banner, say } from '../messages.js';

export async function intro(
	ctx: Pick<Context, 'skipHouston' | 'welcome' | 'hat' | 'tie' | 'version' | 'username' | 'fancy'>,
) {
	banner();

	if (!ctx.skipHouston) {
		const { welcome, hat, tie } = ctx;
		await say(
			[
				[
					'Welcome',
					'to',
					label('astro', color.bgGreen, color.black),
					Promise.resolve(ctx.version).then(
						(version) => (version ? color.green(`v${version}`) : '') + ',',
					),
					Promise.resolve(ctx.username).then((username) => `${username}!`),
				],
				welcome ?? "Let's build something awesome!",
			] as string[],
			{ clear: true, hat, tie },
		);
	}
}
