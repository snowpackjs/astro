/**
  *
  * @returns {import('../../../../../src/types/public/integrations.js').AstroIntegration}
  */
export default function () {
  return {
    name: '@test/ssr-prerender-chunks-test-adapter',
    hooks: {
      'astro:config:setup': ({ updateConfig, config }) => {
        updateConfig({
          build: {
            client: config.outDir,
            server: new URL('./_worker.js/', config.outDir),
            serverEntry: 'index.js',
            redirects: false,
          }
        });
      },
      'astro:config:done': ({ setAdapter }) => {
        setAdapter({
          name: '@test/ssr-prerender-chunks-test-adapter',
          serverEntrypoint: '@test/ssr-prerender-chunks-test-adapter/server.js',
          exports: ['default'],
          supportedAstroFeatures: {
            serverOutput: 'stable',
          },
        });
      },
      'astro:build:setup': ({ vite, target }) => {
        if (target === 'server') {
          vite.resolve ||= {};
          vite.resolve.alias ||= {};

          const aliases = [
            {
              find: 'react-dom/server',
              replacement: 'react-dom/server.browser',
            },
          ];

          if (Array.isArray(vite.resolve.alias)) {
            vite.resolve.alias = [...vite.resolve.alias, ...aliases];
          } else {
            for (const alias of aliases) {
              (vite.resolve.alias)[alias.find] = alias.replacement;
            }
          }

          vite.resolve.conditions ||= [];
          // We need those conditions, previous these conditions where applied at the esbuild step which we removed
          // https://github.com/withastro/astro/pull/7092
          vite.resolve.conditions.push('workerd', 'worker');

          vite.ssr ||= {};
          vite.ssr.target = 'webworker';
          vite.ssr.noExternal = true;

          vite.build ||= {};
          vite.build.rollupOptions ||= {};
          vite.build.rollupOptions.output ||= {};
          vite.build.rollupOptions.output.banner ||=
            'globalThis.process ??= {}; globalThis.process.env ??= {};';

          // Cloudflare env is only available per request. This isn't feasible for code that access env vars
          // in a global way, so we shim their access as `process.env.*`. This is not the recommended way for users to access environment variables. But we'll add this for compatibility for chosen variables. Mainly to support `@astrojs/db`
          vite.define = {
            'process.env': 'process.env',
            ...vite.define,
          };
        }
        // we thought that vite config inside `if (target === 'server')` would not apply for client
        // but it seems like the same `vite` reference is used for both
        // so we need to reset the previous conflicting setting
        // in the future we should look into a more robust solution
        if (target === 'client') {
          vite.resolve ||= {};
          vite.resolve.conditions ||= [];
          vite.resolve.conditions = vite.resolve.conditions.filter(
            (c) => c !== 'workerd' && c !== 'worker'
          );
        }
      },
    },
  };
}
