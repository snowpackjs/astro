import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';

/** Based on https://github.com/actions/toolkit/blob/4e3b068ce116d28cb840033c02f912100b4592b0/packages/core/src/file-command.ts */
export function setOutput(key, value) {
	const filePath = process.env['GITHUB_OUTPUT'] || '';
	if (filePath) {
		return issueFileCommand('OUTPUT', prepareKeyValueMessage(key, value));
	}
	process.stdout.write(os.EOL);
}

function issueFileCommand(command, message) {
	const filePath = process.env[`GITHUB_${command}`];
	if (!filePath) {
		throw new Error(`Unable to find environment variable for file command ${command}`);
	}
	if (!fs.existsSync(filePath)) {
		throw new Error(`Missing file at path: ${filePath}`);
	}

	fs.appendFileSync(filePath, `${toCommandValue(message)}${os.EOL}`, {
		encoding: 'utf8',
	});
}

function prepareKeyValueMessage(key, value) {
	const delimiter = `gh-delimiter-${crypto.randomUUID()}`;
	const convertedValue = toCommandValue(value);

	// These should realistically never happen, but just in case someone finds a
	// way to exploit uuid generation let's not allow keys or values that contain
	// the delimiter.
	if (key.includes(delimiter)) {
		throw new Error(`Unexpected input: name should not contain the delimiter "${delimiter}"`);
	}

	if (convertedValue.includes(delimiter)) {
		throw new Error(`Unexpected input: value should not contain the delimiter "${delimiter}"`);
	}

	return `${key}<<${delimiter}${os.EOL}${convertedValue}${os.EOL}${delimiter}`;
}

function toCommandValue(input) {
	if (input === null || input === undefined) {
		return '';
	} else if (typeof input === 'string' || input instanceof String) {
		return input;
	}
	return JSON.stringify(input);
}
