import idlePrebuilt from '../../runtime/client/idle.prebuilt.js';
import loadPrebuilt from '../../runtime/client/load.prebuilt.js';
import mediaPrebuilt from '../../runtime/client/media.prebuilt.js';
import onlyPrebuilt from '../../runtime/client/only.prebuilt.js';
import visiblePrebuilt from '../../runtime/client/visible.prebuilt.js';

export function getDefaultClientDirectives() {
	return new Map([
		['idle', idlePrebuilt],
		['load', loadPrebuilt],
		['media', mediaPrebuilt],
		['only', onlyPrebuilt],
		['visible', visiblePrebuilt],
	]);
}
