export function preventNodeBuiltinDependencyPlugin() {
	// Verifies that `astro:content` does not have a hard dependency on Node builtins.
	// This is to verify it will run on Cloudflare and Deno
	return {
		name: 'verify-no-node-stuff',
		generateBundle() {
			const nodeModules = ['node:fs', 'node:url', 'node:worker_threads', 'node:path'];
			nodeModules.forEach((name) => {
				const mod = this.getModuleInfo(name);
				if (mod) {
					throw new Error(`Node builtins snuck in: ${name}`);
				}
			});
		},
	};
}
