import { EventEmitter } from 'node:events';
import path from 'node:path';
import type * as vite from 'vite';
import type { ModuleLoader, ModuleLoaderEventEmitter } from './loader.js';

export function createViteLoader(viteServer: vite.ViteDevServer): ModuleLoader {
	const events = new EventEmitter() as ModuleLoaderEventEmitter;

	let isTsconfigUpdated = false;
	function isTsconfigUpdate(filePath: string) {
		const result = path.basename(filePath) === 'tsconfig.json';
		if (result) isTsconfigUpdated = true;
		return result;
	}

	// Skip event emit on tsconfig change as Vite restarts the server, and we don't
	// want to trigger unnecessary work that will be invalidated shortly.
	viteServer.watcher.on('add', (...args) => {
		if (!isTsconfigUpdate(args[0])) {
			events.emit('file-add', args);
		}
	});
	viteServer.watcher.on('unlink', (...args) => {
		if (!isTsconfigUpdate(args[0])) {
			events.emit('file-unlink', args);
		}
	});
	viteServer.watcher.on('change', (...args) => {
		if (!isTsconfigUpdate(args[0])) {
			events.emit('file-change', args);
		}
	});

	const _wsSend = viteServer.ws.send;
	viteServer.ws.send = function (...args: any) {
		// If the tsconfig changed, Vite will trigger a reload as it invalidates the module.
		// However in Astro, the whole server is restarted when the tsconfig changes. If we
		// do a restart and reload at the same time, the browser will refetch and the server
		// is not ready yet, causing a blank page. Here we block that reload from happening.
		if (isTsconfigUpdated) {
			isTsconfigUpdated = false;
			return;
		}
		const msg = args[0] as vite.HMRPayload;
		if (msg?.type === 'error') {
			events.emit('hmr-error', msg);
		}
		_wsSend.apply(this, args);
	};

	return {
		import(src) {
			return viteServer.ssrLoadModule(src);
		},
		async resolveId(spec, parent) {
			const ret = await viteServer.pluginContainer.resolveId(spec, parent);
			return ret?.id;
		},
		getModuleById(id) {
			return viteServer.moduleGraph.getModuleById(id);
		},
		getModulesByFile(file) {
			return viteServer.moduleGraph.getModulesByFile(file);
		},
		getModuleInfo(id) {
			return viteServer.pluginContainer.getModuleInfo(id);
		},
		eachModule(cb) {
			return viteServer.moduleGraph.idToModuleMap.forEach(cb);
		},
		invalidateModule(mod) {
			viteServer.moduleGraph.invalidateModule(mod as vite.ModuleNode);
		},
		fixStacktrace(err) {
			return viteServer.ssrFixStacktrace(err);
		},
		clientReload() {
			viteServer.ws.send({
				type: 'full-reload',
				path: '*',
			});
		},
		webSocketSend(msg) {
			return viteServer.ws.send(msg);
		},
		isHttps() {
			return !!viteServer.config.server.https;
		},
		events,
	};
}
