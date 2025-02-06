import { isCSSRequest } from 'vite';

const rawRE = /(?:\?|&)raw(?:&|$)/;
const inlineRE = /(?:\?|&)inline\b/;

export { isCSSRequest };

export const isBuildableCSSRequest = (request: string): boolean =>
	isCSSRequest(request) && !rawRE.test(request) && !inlineRE.test(request);
