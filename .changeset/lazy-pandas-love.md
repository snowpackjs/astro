---
'@astrojs/markdown-remark': minor
---

Adds support for TOML frontmatter in `.md` and `.mdx` files

Astro 5.2 automatically identifies the format of your Markdown and MDX frontmatter based on the delimiter used.  With `+++` as a delimiter (instead of the `---` YAML code fence), your frontmatter will automatically be recognized and parsed as [TOML](https://toml.io). 

This is useful for adding existing content files with TOML frontmatter to your project from another framework such as Hugo.

TOML frontmatter can also be used with [content collections](https://docs.astro.build/guides/content-collections/), and files with different frontmatter languages can live together in the same project.

No configuration is required to use TOML frontmatter in your content files. Your delimiter will indicate your chosen frontmatter language:

```md
+++
date = 2025-01-30
title = 'Use TOML frontmatter in Astro!'
[author]
name = 'Colin Bate'
+++

# Support for TOML frontmatter is here!
```
