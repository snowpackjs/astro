---
'astro': patch
---

The problem solved by this PR is that after setting the base, when pnpm runs dev, the src address of the generated script type="module" tag is incorrect and still starts with/node_modules. It should start with the value of base. I found that modifying the base of root does not work. I need to set vite.base so that it can parse correctly
