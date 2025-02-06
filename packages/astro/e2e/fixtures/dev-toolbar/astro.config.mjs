import preact from '@astrojs/preact';
import { myIntegration } from './custom-integration.js';

export default {
	integrations: [preact(), myIntegration()],
};
