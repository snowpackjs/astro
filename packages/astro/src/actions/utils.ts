import type fsMod from 'node:fs';
import * as eslexer from 'es-module-lexer';
import type { APIContext } from '../types/public/context.js';
import { ACTION_API_CONTEXT_SYMBOL, type ActionAPIContext, type Locals } from './runtime/utils.js';
import { deserializeActionResult, getActionQueryString } from './runtime/virtual/shared.js';

export function hasActionPayload(locals: APIContext['locals']): locals is Locals {
	return '_actionPayload' in locals;
}

export function createGetActionResult(locals: APIContext['locals']): APIContext['getActionResult'] {
	return (actionFn): any => {
		if (
			!hasActionPayload(locals) ||
			actionFn.toString() !== getActionQueryString(locals._actionPayload.actionName)
		) {
			return undefined;
		}
		return deserializeActionResult(locals._actionPayload.actionResult);
	};
}

export function createCallAction(context: ActionAPIContext): APIContext['callAction'] {
	return (baseAction, input) => {
		Reflect.set(context, ACTION_API_CONTEXT_SYMBOL, true);
		const action = baseAction.bind(context);
		return action(input) as any;
	};
}

let didInitLexer = false;

/**
 * Check whether the Actions config file is present.
 */
export async function isActionsFilePresent(fs: typeof fsMod, srcDir: URL) {
	if (!didInitLexer) await eslexer.init;

	const actionsFile = search(fs, srcDir);
	if (!actionsFile) return false;

	let contents: string;
	try {
		contents = fs.readFileSync(actionsFile, 'utf-8');
	} catch {
		return false;
	}

	// Check if `server` export is present.
	// If not, the user may have an empty `actions` file,
	// or may be using the `actions` file for another purpose
	// (possible since actions are non-breaking for v4.X).
	const [, exports] = eslexer.parse(contents, actionsFile.pathname);
	for (const exp of exports) {
		if (exp.n === 'server') {
			return true;
		}
	}
	return false;
}

function search(fs: typeof fsMod, srcDir: URL) {
	const paths = [
		'actions.mjs',
		'actions.js',
		'actions.mts',
		'actions.ts',
		'actions/index.mjs',
		'actions/index.js',
		'actions/index.mts',
		'actions/index.ts',
	].map((p) => new URL(p, srcDir));
	for (const file of paths) {
		if (fs.existsSync(file)) {
			return file;
		}
	}
	return undefined;
}
