//  @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  image: {
      experimentalLayout: 'responsive',
	},

  experimental: {
      responsiveImages: true
	},
});
