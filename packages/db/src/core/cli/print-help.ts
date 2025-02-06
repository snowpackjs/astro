import { bgGreen, bgWhite, black, bold, dim, green } from 'kleur/colors';

/**
 * Uses implementation from Astro core
 * @see https://github.com/withastro/astro/blob/main/packages/astro/src/core/messages.ts#L303
 */
export function printHelp({
	commandName,
	headline,
	usage,
	tables,
	description,
}: {
	commandName: string;
	headline?: string;
	usage?: string;
	tables?: Record<string, [command: string, help: string][]>;
	description?: string;
}) {
	const linebreak = () => '';
	const title = (label: string) => `  ${bgWhite(black(` ${label} `))}`;
	const table = (rows: [string, string][], { padding }: { padding: number }) => {
		const split = process.stdout.columns < 60;
		let raw = '';

		for (const row of rows) {
			if (split) {
				raw += `    ${row[0]}\n    `;
			} else {
				raw += `${`${row[0]}`.padStart(padding)}`;
			}
			raw += '  ' + dim(row[1]) + '\n';
		}

		return raw.slice(0, -1); // remove latest \n
	};

	let message = [];

	if (headline) {
		message.push(
			linebreak(),
			`  ${bgGreen(black(` ${commandName} `))} ${green(
				`v${process.env.PACKAGE_VERSION ?? ''}`,
			)} ${headline}`,
		);
	}

	if (usage) {
		message.push(linebreak(), `  ${green(commandName)} ${bold(usage)}`);
	}

	if (tables) {
		function calculateTablePadding(rows: [string, string][]) {
			return rows.reduce((val, [first]) => Math.max(val, first.length), 0) + 2;
		}
		const tableEntries = Object.entries(tables);
		const padding = Math.max(...tableEntries.map(([, rows]) => calculateTablePadding(rows)));
		for (const [tableTitle, tableRows] of tableEntries) {
			message.push(linebreak(), title(tableTitle), table(tableRows, { padding }));
		}
	}

	if (description) {
		message.push(linebreak(), `${description}`);
	}

	console.log(message.join('\n') + '\n');
}
