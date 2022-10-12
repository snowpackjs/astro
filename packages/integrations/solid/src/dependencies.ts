import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

function containsSolidField(fields: Record<string, any>) {
	const keys = Object.keys(fields);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key === 'solid') return true;
		if (typeof fields[key] === 'object' && containsSolidField(fields[key])) return true;
	}
	return false;
}

export function getSolidDeps(root: URL) {
	const pkgPath = path.join(fileURLToPath(root), 'package.json');
	if (!fs.existsSync(pkgPath)) {
		console.log('No package.json found at project root');
		return [];
	}
	const require = createRequire(pkgPath);
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
	const deps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
	const pkgs = deps.map((dep) => {
		try {
			return require(`${dep}/package.json`);
		} catch (e) {
			try {
				let dir = path.dirname(require.resolve(dep));
				while (dir) {
					const pkgPath = path.join(dir, 'package.json');
					if (fs.existsSync(pkgPath)) {
						const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
						if (pkg && pkg.name === dep) return pkg;
					}
					const parent = path.dirname(dir);
					if (parent === dir) {
						break;
					}
					dir = parent;
				}
			} catch (e) {
				console.log("Couldn't find package.json for", dep, e);
			}
		}
	});
	return deps.reduce<string[]>((acc, dep, i) => {
		if (pkgs[i] && pkgs[i].exports && containsSolidField(pkgs[i].exports)) acc.push(dep);
		return acc;
	}, []);
}
