import { providers } from 'unifont';
import { defineFontProvider } from '../helpers.js';

export const LOCAL_PROVIDER_NAME = 'local';

export function local() {
	return defineFontProvider({
		name: LOCAL_PROVIDER_NAME,
		entrypoint: 'astro/assets/fonts/providers/local',
	});
}

// TODO: implement
export const provider = () =>
	Object.assign(providers.google(), {
		_name: 'local',
	});
