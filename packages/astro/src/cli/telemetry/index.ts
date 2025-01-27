import * as msg from '../../core/messages.js';
import { telemetry } from '../../events/index.js';
import { type Flags, createLoggerFromFlags } from '../flags.js';

interface TelemetryOptions {
	flags: Flags;
}

export async function notify() {
	await telemetry.notify(() => {
		console.log(msg.telemetryNotice() + '\n');
		return true;
	});
}

export async function update(subcommand: string, { flags }: TelemetryOptions) {
	const isValid = ['enable', 'disable', 'reset'].includes(subcommand);
	const logger = createLoggerFromFlags(flags);

	if (flags.help || flags.h || !isValid) {
		msg.printHelp({
			commandName: 'astro telemetry',
			usage: '[command]',
			tables: {
				Commands: [
					['enable', 'Enable anonymous data collection.'],
					['disable', 'Disable anonymous data collection.'],
					['reset', 'Reset anonymous data collection settings.'],
				],
			},
		});
		return;
	}

	switch (subcommand) {
		case 'enable': {
			telemetry.setEnabled(true);
			logger.info('SKIP_FORMAT', msg.telemetryEnabled());
			return;
		}
		case 'disable': {
			telemetry.setEnabled(false);
			logger.info('SKIP_FORMAT', msg.telemetryDisabled());
			return;
		}
		case 'reset': {
			telemetry.clear();
			logger.info('SKIP_FORMAT', msg.telemetryReset());
			return;
		}
	}
}
