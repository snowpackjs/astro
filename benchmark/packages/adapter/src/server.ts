import * as fs from 'node:fs';
import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { applyPolyfills } from 'astro/app/node';

applyPolyfills();

class MyApp extends App {
	#manifest: SSRManifest | undefined;
	constructor(manifest: SSRManifest, streaming = false) {
		super(manifest, streaming);
		this.#manifest = manifest;
	}

	async render(request: Request) {
		const url = new URL(request.url);
		if (this.#manifest?.assets.has(url.pathname)) {
			const filePath = new URL('../../client/' + this.removeBase(url.pathname), import.meta.url);
			const data = await fs.promises.readFile(filePath);
			return new Response(data);
		}

		return super.render(request);
	}
}

export function createExports(manifest: SSRManifest) {
	return {
		manifest,
		createApp: (streaming: boolean) => new MyApp(manifest, streaming),
	};
}
