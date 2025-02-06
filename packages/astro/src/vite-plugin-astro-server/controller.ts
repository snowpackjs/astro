import type { LoaderEvents, ModuleLoader } from '../core/module-loader/index.js';
import type { ServerState } from './server-state.js';

import {
	clearRouteError,
	createServerState,
	setRouteError,
	setServerError,
} from './server-state.js';

type ReloadFn = () => void;

export interface DevServerController {
	state: ServerState;
	onFileChange: LoaderEvents['file-change'];
	onHMRError: LoaderEvents['hmr-error'];
}

export type CreateControllerParams =
	| {
			loader: ModuleLoader;
	  }
	| {
			reload: ReloadFn;
	  };

export function createController(params: CreateControllerParams): DevServerController {
	if ('loader' in params) {
		return createLoaderController(params.loader);
	} else {
		return createBaseController(params);
	}
}

function createBaseController({ reload }: { reload: ReloadFn }): DevServerController {
	const serverState = createServerState();

	const onFileChange: LoaderEvents['file-change'] = () => {
		if (serverState.state === 'error') {
			reload();
		}
	};

	const onHMRError: LoaderEvents['hmr-error'] = (payload) => {
		let msg = payload?.err?.message ?? 'Unknown error';
		let stack = payload?.err?.stack ?? 'Unknown stack';
		let error = new Error(msg);
		Object.defineProperty(error, 'stack', {
			value: stack,
		});
		setServerError(serverState, error);
	};

	return {
		state: serverState,
		onFileChange,
		onHMRError,
	};
}

function createLoaderController(loader: ModuleLoader): DevServerController {
	const controller = createBaseController({
		reload() {
			loader.clientReload();
		},
	});
	const baseOnFileChange = controller.onFileChange;
	controller.onFileChange = (...args) => {
		if (controller.state.state === 'error') {
			// If we are in an error state, check if there are any modules with errors
			// and if so invalidate them so that they will be updated on refresh.
			loader.eachModule((mod) => {
				if (mod.ssrError) {
					loader.invalidateModule(mod);
				}
			});
		}
		baseOnFileChange(...args);
	};

	loader.events.on('file-change', controller.onFileChange);
	loader.events.on('hmr-error', controller.onHMRError);

	return controller;
}

export interface RunWithErrorHandlingParams {
	controller: DevServerController;
	pathname: string;
	run: () => Promise<any>;
	onError: (error: unknown) => Error;
}

export async function runWithErrorHandling({
	controller: { state },
	pathname,
	run,
	onError,
}: RunWithErrorHandlingParams) {
	try {
		await run();
		clearRouteError(state, pathname);
	} catch (err) {
		const error = onError(err);
		setRouteError(state, pathname, error);
	}
}
