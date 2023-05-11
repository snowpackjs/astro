import { build } from 'esbuild';

/**
 * Build a client directive entrypoint into code that can directly run in a `<script>` tag.
 */
export async function buildClientDirectiveEntrypoint(name: string, entrypoint: string) {
	const stringifiedName = JSON.stringify(name);
	const stringifiedEntrypoint = JSON.stringify(entrypoint);

	// NOTE: when updating this stdin code, make sure to also update `packages/astro/scripts/prebuild.ts`
	// that prebuilds the client directive with a similar code too.
	const output = await build({
		stdin: {
			contents: `\
import directive from ${stringifiedEntrypoint};

(self.Astro || (self.Astro = {}))[${stringifiedName}] = directive;

window.dispatchEvent(new Event('astro:' + ${stringifiedName}));`,
			loader: 'js',
		},
		entryPoints: [entrypoint],
		absWorkingDir: process.cwd(),
		format: 'iife',
		minify: true,
		bundle: true,
		write: false,
	});

	const outputFile = output.outputFiles?.[0];
	if (!outputFile) return '';

	return outputFile.text;
}
