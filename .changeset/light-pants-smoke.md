---
'astro': minor
---

Adds support for redirecting to external sites with the [`redirects`](https://docs.astro.build/en/reference/configuration-reference/#redirects) configuration option.

Now, you can redirect routes either internally to another path or externally by providing a URL beginning with `http` or `https`:

```js 
// astro.config.mjs
import {defineConfig} from "astro/config"

export default defineConfig({
  redirects: {
    "/blog": "https://example.com/blog",
    "/news": {
      status: 302,
      destination: "https://example.com/news" 
    }
  }
})
```
