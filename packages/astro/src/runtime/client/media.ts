import type { ClientDirective } from '../../types/public/integrations.js';

/**
 * Hydrate this component when a matching media query is found
 */
const mediaDirective: ClientDirective = (load, options) => {
	const cb = async () => {
		const hydrate = await load();
		await hydrate();
	};

	if (options.value) {
		const mql = matchMedia(options.value);
		if (mql.matches) {
			cb();
		} else {
			mql.addEventListener('change', cb, { once: true });
		}
	}
};

export default mediaDirective;
