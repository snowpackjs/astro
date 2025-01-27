import { defineConfig } from 'astro/config';

// in a real-world scenario, this would be provided a separate package
import customRenderer from './src/custom-renderer';

// https://astro.build/config
export default defineConfig({
  integrations: [customRenderer()]
});
