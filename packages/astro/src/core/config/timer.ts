import fs from 'node:fs';

// Type used by `bench-memory.js`
export interface Stat {
	elapsedTime: number;
	heapUsedChange: number;
	heapUsedTotal: number;
}

interface OngoingStat {
	startTime: number;
	startHeap: number;
}

/**
 * Timer to track certain operations' performance. Used by Astro's scripts only.
 * Set `process.env.ASTRO_TIMER_PATH` truthy to enable.
 */
export class AstroTimer {
	private enabled: boolean;
	private ongoingTimers = new Map<string, OngoingStat>();
	private stats: Record<string, Stat> = {};

	constructor() {
		this.enabled = !!process.env.ASTRO_TIMER_PATH;
	}

	/**
	 * Start a timer for a scope with a given name.
	 */
	start(name: string) {
		if (!this.enabled) return;
		globalThis.gc?.();
		this.ongoingTimers.set(name, {
			startTime: performance.now(),
			startHeap: process.memoryUsage().heapUsed,
		});
	}

	/**
	 * End a timer for a scope with a given name.
	 */
	end(name: string) {
		if (!this.enabled) return;
		const stat = this.ongoingTimers.get(name);
		if (!stat) return;
		globalThis.gc?.();
		const endHeap = process.memoryUsage().heapUsed;
		this.stats[name] = {
			elapsedTime: performance.now() - stat.startTime,
			heapUsedChange: endHeap - stat.startHeap,
			heapUsedTotal: endHeap,
		};
		this.ongoingTimers.delete(name);
	}

	/**
	 * Write stats to `process.env.ASTRO_TIMER_PATH`
	 */
	writeStats() {
		if (!this.enabled) return;
		// @ts-expect-error
		fs.writeFileSync(process.env.ASTRO_TIMER_PATH, JSON.stringify(this.stats, null, 2));
	}
}
