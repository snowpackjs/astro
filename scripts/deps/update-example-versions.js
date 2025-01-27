import fs from 'node:fs/promises';
import path from 'node:path';
import { globby as glob } from 'globby';

/*
  This file updates the dependencies' versions in `examples/*` to match the workspace packages' versions.
  This should be run after `changeset version` so the release PR updates all the versions together.
*/

const rootUrl = new URL('../..', import.meta.url);
const rootPackageJson = JSON.parse(await fs.readFile(new URL('./package.json', rootUrl), 'utf-8'));

// get all workspace package name to versions
/** @type {Map<string, string>} */
const packageToVersions = new Map();

// Changeset detects workspace packages to publish via `workspaces` in package.json.
// Although this conflicts with the `pnpm-workspace.yaml` config, it's easier to configure what gets
// published through this field, so this file also respects this field when updating the versions.
const workspaceDirs = await glob(rootPackageJson.workspaces, {
	onlyDirectories: true,
	cwd: rootUrl,
});
for (const workspaceDir of workspaceDirs) {
	const packageJsonPath = path.join(workspaceDir, './package.json');
	const packageJson = await readAndParsePackageJson(packageJsonPath);
	if (!packageJson) continue;

	if (packageJson.private === true) continue;

	if (!packageJson.name) {
		throw new Error(`${packageJsonPath} does not contain a "name" field.`);
	}
	if (!packageJson.version) {
		throw new Error(`${packageJsonPath} does not contain a "version" field.`);
	}

	packageToVersions.set(packageJson.name, packageJson.version);
}

// Update all examples' package.json
const exampleDirs = await glob('examples/*', {
	onlyDirectories: true,
	cwd: rootUrl,
});
for (const exampleDir of exampleDirs) {
	const packageJsonPath = path.join(exampleDir, './package.json');
	const packageJson = await readAndParsePackageJson(packageJsonPath);
	if (!packageJson) continue;

	// Update dependencies
	for (const depName of Object.keys(packageJson.dependencies ?? [])) {
		if (packageToVersions.has(depName)) {
			packageJson.dependencies[depName] = `^${packageToVersions.get(depName)}`;
		}
	}

	// Update devDependencies
	for (const depName of Object.keys(packageJson.devDependencies ?? [])) {
		if (packageToVersions.has(depName)) {
			packageJson.devDependencies[depName] = `^${packageToVersions.get(depName)}`;
		}
	}

	await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * @param {string} packageJsonPath
 * @returns {Promise<Record<string, any> | undefined>}
 */
async function readAndParsePackageJson(packageJsonPath) {
	try {
		return JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
	} catch {}
}
