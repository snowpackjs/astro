import type { PathLike } from 'node:fs';
import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import nodePath from 'node:path';
import { fileURLToPath } from 'node:url';

export async function writeJson<T>(path: PathLike, data: T) {
	await fs.writeFile(path, JSON.stringify(data, null, '\t'), { encoding: 'utf-8' });
}

export async function removeDir(dir: PathLike) {
	await fs.rm(dir, { recursive: true, force: true, maxRetries: 3 });
}

export async function emptyDir(dir: PathLike): Promise<void> {
	await removeDir(dir);
	await fs.mkdir(dir, { recursive: true });
}

export async function getFilesFromFolder(dir: URL) {
	const data = await fs.readdir(dir, { withFileTypes: true });
	let files: URL[] = [];
	for (const item of data) {
		if (item.isDirectory()) {
			const moreFiles = await getFilesFromFolder(new URL(`./${item.name}/`, dir));
			files = files.concat(moreFiles);
		} else {
			files.push(new URL(`./${item.name}`, dir));
		}
	}
	return files;
}

/**
 * Copies files into a folder keeping the folder structure intact.
 * The resulting file tree will start at the common ancestor.
 *
 * @param {URL[]} files A list of files to copy (absolute path).
 * @param {URL} outDir Destination folder where to copy the files to (absolute path).
 * @param {URL[]} [exclude] A list of files to exclude (absolute path).
 * @returns {Promise<string>} The common ancestor of the copied files.
 */
export async function copyFilesToFolder(
	files: URL[],
	outDir: URL,
	exclude: URL[] = [],
): Promise<string> {
	const excludeList = exclude.map((url) => fileURLToPath(url));
	const fileList = files.map((url) => fileURLToPath(url)).filter((f) => !excludeList.includes(f));

	if (files.length === 0) throw new Error('No files found to copy');

	let commonAncestor = nodePath.dirname(fileList[0]);
	for (const file of fileList.slice(1)) {
		while (!file.startsWith(commonAncestor)) {
			commonAncestor = nodePath.dirname(commonAncestor);
		}
	}

	for (const origin of fileList) {
		const dest = new URL(nodePath.relative(commonAncestor, origin), outDir);

		const realpath = await fs.realpath(origin);
		const isSymlink = realpath !== origin;
		const isDir = (await fs.stat(origin)).isDirectory();

		// Create directories recursively
		if (isDir && !isSymlink) {
			await fs.mkdir(new URL('..', dest), { recursive: true });
		} else {
			await fs.mkdir(new URL('.', dest), { recursive: true });
		}

		if (isSymlink) {
			const realdest = fileURLToPath(new URL(nodePath.relative(commonAncestor, realpath), outDir));
			const target = nodePath.relative(fileURLToPath(new URL('.', dest)), realdest);
			// NOTE: when building function per route, dependencies are linked at the first run, then there's no need anymore to do that once more.
			// So we check if the destination already exists. If it does, move on.
			// Symbolic links here are usually dependencies and not user code. Symbolic links exist because of the pnpm strategy.
			if (!existsSync(dest)) {
				await fs.symlink(target, dest, isDir ? 'dir' : 'file');
			}
		} else if (!isDir) {
			await fs.copyFile(origin, dest);
		}
	}

	return commonAncestor;
}
