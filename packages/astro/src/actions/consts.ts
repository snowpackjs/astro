export const VIRTUAL_MODULE_ID = 'astro:actions';
export const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;
export const ACTIONS_TYPES_FILE = 'actions.d.ts';
export const VIRTUAL_INTERNAL_MODULE_ID = 'astro:internal-actions';
export const RESOLVED_VIRTUAL_INTERNAL_MODULE_ID = '\0astro:internal-actions';
export const NOOP_ACTIONS = '\0noop-actions';

export const ACTION_QUERY_PARAMS = {
	actionName: '_action',
	actionPayload: '_astroActionPayload',
};

export const ACTION_RPC_ROUTE_PATTERN = '/_actions/[...path]';
