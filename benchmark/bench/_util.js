import { createRequire } from 'node:module';
import path from 'node:path';

const astroPkgPath = createRequire(import.meta.url).resolve('astro/package.json');

export const astroBin = path.resolve(astroPkgPath, '../astro.js');

/** @typedef {{ avg: number, stdev: number, max: number }} Stat */

/**
 * @param {number[]} numbers
 * @returns {Stat}
 */
export function calculateStat(numbers) {
	const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
	const stdev = Math.sqrt(
		numbers.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / numbers.length,
	);
	const max = Math.max(...numbers);
	return { avg, stdev, max };
}

export async function makeProject(name) {
	console.log('Making project:', name);
	const projectDir = new URL(`../projects/${name}/`, import.meta.url);

	const makeProjectMod = await import(`../make-project/${name}.js`);
	await makeProjectMod.run(projectDir);

	console.log('Finished making project:', name);
	return projectDir;
}
