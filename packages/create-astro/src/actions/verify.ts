import type { Context } from './context.js';

import dns from 'node:dns/promises';
import { color } from '@astrojs/cli-kit';
import { verifyTemplate } from '@bluwy/giget-core';
import { bannerAbort, error, info, log } from '../messages.js';
import { getTemplateTarget } from './template.js';

export async function verify(
	ctx: Pick<Context, 'version' | 'dryRun' | 'template' | 'ref' | 'exit'>,
) {
	if (!ctx.dryRun) {
		const online = await isOnline();
		if (!online) {
			bannerAbort();
			log('');
			error('error', `Unable to connect to the internet.`);
			ctx.exit(1);
		}
	}

	if (ctx.template) {
		const target = getTemplateTarget(ctx.template, ctx.ref);
		const ok = await verifyTemplate(target);
		if (!ok) {
			bannerAbort();
			log('');
			error('error', `Template ${color.reset(ctx.template)} ${color.dim('could not be found!')}`);
			await info('check', 'https://astro.build/examples');
			ctx.exit(1);
		}
	}
}

function isOnline(): Promise<boolean> {
	return dns.lookup('github.com').then(
		() => true,
		() => false,
	);
}
