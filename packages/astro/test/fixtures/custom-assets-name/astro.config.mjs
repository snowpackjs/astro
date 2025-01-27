import path from "path";
import { defineConfig } from 'astro/config';

// https://astro.build/config
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  vite: {
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          
          entryFileNames: 'assets/script/a.[hash].js',
          assetFileNames: (option) => {
            const { ext, dir, base } = path.parse(option.name);

            if (ext == ".css") return path.join(dir, "assets/css", 'a.css');
            return "assets/img/[name].[ext]";
          }
        }
      }
    }
  },
  build: {
    assets: 'assets'
  },
  output: "server",
  adapter: node({
    mode: "standalone"
  })
});
