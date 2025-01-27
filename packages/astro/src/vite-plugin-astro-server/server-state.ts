export type ErrorState = 'fresh' | 'error';

export interface RouteState {
	state: ErrorState;
	error?: Error;
}

export interface ServerState {
	routes: Map<string, RouteState>;
	state: ErrorState;
	error?: Error;
}

export function createServerState(): ServerState {
	return {
		routes: new Map(),
		state: 'fresh',
	};
}

export function hasAnyFailureState(serverState: ServerState) {
	return serverState.state !== 'fresh';
}

export function setRouteError(serverState: ServerState, pathname: string, error: Error) {
	if (serverState.routes.has(pathname)) {
		const routeState = serverState.routes.get(pathname)!;
		routeState.state = 'error';
		routeState.error = error;
	} else {
		const routeState: RouteState = {
			state: 'error',
			error: error,
		};
		serverState.routes.set(pathname, routeState);
	}
	serverState.state = 'error';
	serverState.error = error;
}

export function setServerError(serverState: ServerState, error: Error) {
	serverState.state = 'error';
	serverState.error = error;
}

export function clearRouteError(serverState: ServerState, pathname: string) {
	if (serverState.routes.has(pathname)) {
		serverState.routes.delete(pathname);
	}
	serverState.state = 'fresh';
	serverState.error = undefined;
}
