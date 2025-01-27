import { type Metric, onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { WEB_VITALS_ENDPOINT_PATH } from './constants.js';
import type { ClientMetric } from './schemas.js';

const pathname = location.pathname.replace(/(?<=.)\/$/, '');
const route =
	document
		.querySelector<HTMLMetaElement>('meta[name="x-astro-vitals-route"]')
		?.getAttribute('content') || pathname;

const queue = new Set<Metric>();
const addToQueue = (metric: Metric) => queue.add(metric);
function flushQueue() {
	if (!queue.size) return;
	const rawBody: ClientMetric[] = [...queue].map(({ name, id, value, rating }) => ({
		pathname,
		route,
		name,
		id,
		value,
		rating,
	}));
	const body = JSON.stringify(rawBody);
	if (navigator.sendBeacon) navigator.sendBeacon(WEB_VITALS_ENDPOINT_PATH, body);
	else fetch(WEB_VITALS_ENDPOINT_PATH, { body, method: 'POST', keepalive: true });
	queue.clear();
}

for (const listener of [onCLS, onLCP, onINP, onFCP, onTTFB]) {
	listener(addToQueue);
}

addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'hidden') flushQueue();
});
addEventListener('pagehide', flushQueue);
