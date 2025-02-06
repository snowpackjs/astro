import { fileURLToPath } from 'node:url';
import react from "@astrojs/react";
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [astroClientClickDirective(), astroClientPasswordDirective(), astroHasOptionsDirective(), react()],
});

function astroClientClickDirective() {
  return {
    name: 'astro-client-click',
    hooks: {
      'astro:config:setup': (opts) => {
        opts.addClientDirective({
          name: 'click',
          entrypoint: fileURLToPath(new URL('./client-click.js', import.meta.url))
        });
      }
    }
  };
}

function astroClientPasswordDirective() {
  return {
    name: 'astro-client-click',
    hooks: {
      'astro:config:setup': (opts) => {
        opts.addClientDirective({
          name: 'password',
          entrypoint: fileURLToPath(new URL('./client-password.js', import.meta.url))
        });
      }
    }
  };
}

function astroHasOptionsDirective() {
	return {
		name: 'astro-options',
		hooks: {
			'astro:config:setup': (opts) => {
				opts.addClientDirective({
					name: 'options',
					entrypoint: fileURLToPath(new URL('./client-options.js', import.meta.url))
				});
			}
		}
	};
}
