import type vite from '../core/vite';
import type { AstroConfig } from '../@types/astro';

import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { AstroDevServer } from '../core/dev/index.js';
import { getViteTransform, TransformHook } from './styles.js';
import { parseAstroRequest } from './query.js';
import { cachedCompilation, invalidateCompilation } from './compile.js';

const FRONTMATTER_PARSE_REGEXP = /^\-\-\-(.*)^\-\-\-/ms;
interface AstroPluginOptions {
  config: AstroConfig;
  devServer?: AstroDevServer;
}

/** Transform .astro files for Vite */
export default function astro({ config }: AstroPluginOptions): vite.Plugin {
  let viteTransform: TransformHook;
  return {
    name: '@astrojs/vite-plugin-astro',
    enforce: 'pre', // run transforms before other plugins can
    configResolved(resolvedConfig) {
      viteTransform = getViteTransform(resolvedConfig);
    },
    // note: don’t claim .astro files with resolveId() — it prevents Vite from transpiling the final JS (import.meta.globEager, etc.)
    async resolveId(id) {
      // serve sub-part requests (*?astro) as virtual modules
      if (parseAstroRequest(id).query.astro) {
        return id;
      }
    },
    async load(id, opts) {
      let { filename, query } = parseAstroRequest(id);
      if (query.astro) {
        console.log('TODO REMOVE [LOAD]', filename);
        if (query.type === 'style') {
          if (filename.startsWith('/') && !filename.startsWith(config.projectRoot.pathname)) {
            filename = new URL('.' + filename, config.projectRoot).pathname;
          }
          const transformResult = await cachedCompilation(config, filename, null, viteTransform, opts);

          if (typeof query.index === 'undefined') {
            throw new Error(`Requests for Astro CSS must include an index.`);
          }

          const csses = transformResult.css;
          const code = csses[query.index];

          return {
            code,
          };
        }
      }

      return null;
    },
    async transform(source, id, opts) {
      if (!id.endsWith('.astro')) {
        return;
      }

      try {
        const transformResult = await cachedCompilation(config, id, source, viteTransform, opts);

        // Compile all TypeScript to JavaScript.
        // Also, catches invalid JS/TS in the compiled output before returning.
        const { code, map } = await esbuild.transform(transformResult.code, {
          loader: 'ts',
          sourcemap: 'external',
          sourcefile: id,
        });

        return {
          code,
          map,
        };
      } catch (err: any) {
        // Verify frontmatter: a common reason that this plugin fails is that
        // the user provided invalid JS/TS in the component frontmatter.
        // If the frontmatter is invalid, the `err` object may be a compiler
        // panic or some other vague/confusing compiled error message.
        //
        // Before throwing, it is better to verify the frontmatter here, and
        // let esbuild throw a more specific exception if the code is invalid.
        // If frontmatter is valid or cannot be parsed, then continue.
        const scannedFrontmatter = FRONTMATTER_PARSE_REGEXP.exec(source);
        if (scannedFrontmatter) {
          try {
            await esbuild.transform(scannedFrontmatter[1], { loader: 'ts', sourcemap: false, sourcefile: id });
          } catch (frontmatterErr: any) {
            // Improve the error by replacing the phrase "unexpected end of file"
            // with "unexpected end of frontmatter" in the esbuild error message.
            if (frontmatterErr && frontmatterErr.message) {
              frontmatterErr.message = frontmatterErr.message.replace('end of file', 'end of frontmatter');
            }
            throw frontmatterErr;
          }
        }

        // improve compiler errors
        if (err.stack.includes('wasm-function')) {
          const search = new URLSearchParams({
            labels: 'compiler',
            title: '🐛 BUG: `@astrojs/compiler` panic',
            body: `### Describe the Bug
    
    \`@astrojs/compiler\` encountered an unrecoverable error when compiling the following file.
    
    **${id.replace(fileURLToPath(config.projectRoot), '')}**
    \`\`\`astro
    ${source}
    \`\`\`
    `,
          });
          err.url = `https://github.com/withastro/astro/issues/new?${search.toString()}`;
          err.message = `Error: Uh oh, the Astro compiler encountered an unrecoverable error!
    
    Please open
    a GitHub issue using the link below:
    ${err.url}`;
          // TODO: remove stack replacement when compiler throws better errors
          err.stack = `    at ${id}`;
        }

        throw err;
      }
    },
    async handleHotUpdate(context) {
      // Invalidate the compilation cache so it recompiles
      invalidateCompilation(config, context.file);
    },
  };
}
