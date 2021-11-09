import type { TransformResult } from '@astrojs/compiler';
import type { SourceMapInput } from 'rollup';
import type vite from '../core/vite';
import type { AstroConfig } from '../@types/astro-core';

import esbuild from 'esbuild';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { transform } from '@astrojs/compiler';
import { decode } from 'sourcemap-codec';
import { AstroDevServer } from '../core/dev/index.js';
import { codeFrame } from '../core/util.js';
import { getViteTransform, TransformHook, transformWithVite } from './styles.js';

interface AstroPluginOptions {
  config: AstroConfig;
  devServer?: AstroDevServer;
}

// https://github.com/vitejs/vite/discussions/5109#discussioncomment-1450726
function isSSR(options: undefined | boolean | { ssr: boolean }): boolean {
  if (options === undefined) {
    return false;
  }
  if (typeof options === 'boolean') {
    return options;
  }
  if (typeof options == 'object') {
    return !!options.ssr;
  }
  return false;
}

/** Transform .astro files for Vite */
export default function astro({ config, devServer }: AstroPluginOptions): vite.Plugin {
  let viteTransform: TransformHook;
  return {
    name: '@astrojs/vite-plugin-astro',
    enforce: 'pre', // run transforms before other plugins can
    configResolved(resolvedConfig) {
      viteTransform = getViteTransform(resolvedConfig);
    },
    // note: don’t claim .astro files with resolveId() — it prevents Vite from transpiling the final JS (import.meta.globEager, etc.)
    async load(id, opts) {
      if (!id.endsWith('.astro')) {
        return null;
      }
      // pages and layouts should be transformed as full documents (implicit <head> <body> etc)
      // everything else is treated as a fragment
      const normalizedID = fileURLToPath(new URL(`file://${id}`));
      const isPage = normalizedID.startsWith(fileURLToPath(config.pages)) || id.startsWith(fileURLToPath(config.layouts));
      let source = await fs.promises.readFile(id, 'utf8');
      let tsResult: TransformResult | undefined;

      try {
        // Transform from `.astro` to valid `.ts`
        // use `sourcemap: "both"` so that sourcemap is included in the code
        // result passed to esbuild, but also available in the catch handler.
        tsResult = await transform(source, {
          as: isPage ? 'document' : 'fragment',
          site: config.buildOptions.site,
          sourcefile: id,
          sourcemap: 'both',
          internalURL: 'astro/internal',
          preprocessStyle: async (value: string, attrs: Record<string, string>) => {
            if (!attrs || !attrs.lang) return null;
            const result = await transformWithVite({ value, attrs, id, transformHook: viteTransform, ssr: isSSR(opts) });
            if (!result) {
              // TODO: compiler supports `null`, but types don't yet
              return result as any;
            }
            let map: SourceMapInput | undefined;
            if (result.map) {
              if (typeof result.map === 'string') {
                map = result.map;
              } else if (result.map.mappings) {
                map = result.map.toString();
              }
            }
            return { code: result.code, map };
          },
        });
        // Compile `.ts` to `.js`
        const { code, map } = await esbuild.transform(tsResult.code, { loader: 'ts', sourcemap: 'external', sourcefile: id });

        return {
          code,
          map,
        };
      } catch (err: any) {
        // if esbuild threw the error, find original code source to display (if it’s mapped)
        if (err.errors && tsResult?.map) {
          const json = JSON.parse(tsResult.map);
          const mappings = decode(json.mappings);
          const focusMapping = mappings[err.errors[0].location.line + 1];
          if (Array.isArray(focusMapping) && focusMapping.length) {
            err.sourceLoc = { file: id, line: (focusMapping[0][2] || 0) + 1, column: (focusMapping[0][3] || 0) + 1 };
          }
        }

        let message = '';
        if (typeof err === 'string') message = err;
        if (err && typeof err === 'object') {
          if (err.stack && typeof err.stack === 'object' && err.stack.message) {
            message = err.stack.message;
          } else if (typeof err.toString === 'function') {
            message = err.toString();
          }
        }

        // WASM panic
        if (message && message === 'RuntimeError: unreachable') {
          err.message = 'Syntax error';
          err.sourceLoc = { file: id, line: 0, column: 0 }; // TODO: can WASM show us the last character it erred on?
          throw new Error(`${id}: ${err.message}`);
        }

        throw err;
      }
    },
    async handleHotUpdate(context) {
      if (devServer) {
        return devServer.handleHotUpdate(context);
      }
    },
  };
}
