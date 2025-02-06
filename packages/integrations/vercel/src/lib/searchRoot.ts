// Taken from: https://github.com/vitejs/vite/blob/1a76300cd16827f0640924fdc21747ce140c35fb/packages/vite/src/node/server/searchRoot.ts
// MIT license
// See https://github.com/vitejs/vite/blob/1a76300cd16827f0640924fdc21747ce140c35fb/LICENSE
import fs from 'node:fs';
import { dirname, join } from 'node:path';

// https://github.com/vitejs/vite/issues/2820#issuecomment-812495079
const ROOT_FILES = [
	// '.git',

	// https://pnpm.io/workspaces/
	'pnpm-workspace.yaml',

	// https://rushjs.io/pages/advanced/config_files/
	// 'rush.json',

	// https://nx.dev/latest/react/getting-started/nx-setup
	// 'workspace.json',
	// 'nx.json',

	// https://github.com/lerna/lerna#lernajson
	'lerna.json',
];

export function tryStatSync(file: string): fs.Stats | undefined {
	try {
		// The "throwIfNoEntry" is a performance optimization for cases where the file does not exist
		return fs.statSync(file, { throwIfNoEntry: false });
	} catch {
		// Ignore errors
	}
}

export function isFileReadable(filename: string): boolean {
	if (!tryStatSync(filename)) {
		return false;
	}

	try {
		// Check if current process has read permission to the file
		fs.accessSync(filename, fs.constants.R_OK);

		return true;
	} catch {
		return false;
	}
}

// npm: https://docs.npmjs.com/cli/v7/using-npm/workspaces#installing-workspaces
// yarn: https://classic.yarnpkg.com/en/docs/workspaces/#toc-how-to-use-it
function hasWorkspacePackageJSON(root: string): boolean {
	const path = join(root, 'package.json');
	if (!isFileReadable(path)) {
		return false;
	}
	try {
		const content = JSON.parse(fs.readFileSync(path, 'utf-8')) || {};
		return !!content.workspaces;
	} catch {
		return false;
	}
}

function hasRootFile(root: string): boolean {
	return ROOT_FILES.some((file) => fs.existsSync(join(root, file)));
}

function hasPackageJSON(root: string) {
	const path = join(root, 'package.json');
	return fs.existsSync(path);
}

/**
 * Search up for the nearest `package.json`
 */
export function searchForPackageRoot(current: string, root = current): string {
	if (hasPackageJSON(current)) return current;

	const dir = dirname(current);
	// reach the fs root
	if (!dir || dir === current) return root;

	return searchForPackageRoot(dir, root);
}

/**
 * Search up for the nearest workspace root
 */
export function searchForWorkspaceRoot(
	current: string,
	root = searchForPackageRoot(current)
): string {
	if (hasRootFile(current)) return current;
	if (hasWorkspacePackageJSON(current)) return current;

	const dir = dirname(current);
	// reach the fs root
	if (!dir || dir === current) return root;

	return searchForWorkspaceRoot(dir, root);
}
