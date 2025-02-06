// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [
      function myRemarkPlugin() {
        return function transformer(tree, file) {
					tree.children.push({
						type: 'paragraph',
						children: [{ type: 'text', value: file?.data?.astro?.frontmatter?.addedByTransformer ? "Transformed" : "Not transformed" }],
					});
        };
      },
      function addFrontmatter() {
        return function (tree, file) {
          if (file.data.astro?.frontmatter) {
          file.data.astro.frontmatter.customProperty =
            'Generated property via remark plugin!';
          }
        };
      }
    ],
  },
});
