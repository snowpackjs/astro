import { defineConfig } from 'astro/config';

const MODULE_ID = 'virtual:test';
const RESOLVED_MODULE_ID = '\0virtual:test';

export default defineConfig({
  integrations: [
    {
      name: 'astro-test-invalid-transform',
      hooks: {
        'astro:config:setup': ({ updateConfig }) => {
          updateConfig({
            vite: {
              plugins: [
                // -----------------------------------
                {
                  name: 'vite-test-invalid-transform',
                  resolveId(id) {
                    if (id === MODULE_ID) {
                      // Astro tries to transform this import because the query params can end with '.astro'
                      return `${RESOLVED_MODULE_ID}?importer=index.astro`;
                    }
                  },
                  load(id) {
                    if (id.startsWith(RESOLVED_MODULE_ID)) {
                      return `export default 'true';`;
                    }
                  },
                },
                // -----------------------------------
              ],
            },
          });
        },
      },
    },
  ],
});
