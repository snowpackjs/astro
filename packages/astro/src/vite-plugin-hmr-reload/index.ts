import type { EnvironmentModuleNode, Plugin } from 'vite';

/**
 * The very last Vite plugin to reload the browser if any SSR-only module are updated
 * which will require a full page reload. This mimics the behaviour of Vite 5 where
 * it used to unconditionally reload for us.
 */
export default function hmrReload(): Plugin {
	return {
		name: 'astro:hmr-reload',
		enforce: 'post',
		hotUpdate: {
			order: 'post',
			handler({ modules, server, timestamp }) {
				if (this.environment.name !== 'ssr') return;

				let hasSsrOnlyModules = false;

				const invalidatedModules = new Set<EnvironmentModuleNode>();
				for (const mod of modules) {
					if (mod.id == null) continue;
					const clientModule = server.environments.client.moduleGraph.getModuleById(mod.id);
					if (clientModule != null) continue;

					this.environment.moduleGraph.invalidateModule(mod, invalidatedModules, timestamp, true);
					hasSsrOnlyModules = true;
				}

				if (hasSsrOnlyModules) {
					server.ws.send({ type: 'full-reload' });
					return [];
				}
			},
		},
	};
}
