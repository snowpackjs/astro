import one from '@test/astro-renderer-one';
import two from '@test/astro-renderer-two';

export default {
	integrations: [one(), two()]
};
