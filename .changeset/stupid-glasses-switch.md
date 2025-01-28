---
'astro': minor
---

Adds a new experimental virtual module `astro:config` that exposes a type-safe subset of your `astro.config.mjs` configuration

The virtual module exposes two sub-paths for controlled access to your configuration:
- `astro:config/client`: exposes config information that is safe to expose to the client.
- `astro:config/server`: exposes additional information that is safe to expose to the server, such as file/dir paths.

To enable this new virtual module, add the `experimental.serializeManifest` feature flag to your Astro config:

```js
// astro.config.mjs
import {defineConfig} from "astro/config"
export default defineConfig({
  experimental: {
    serializeManifest: true
  }
})
```

Then, you can access the module in any file inside your project to import and use values from your Astro config:

```js
// src/utils.js
import { trailingSlash } from "astro:config/client";

function addForwardSlash(path) {
  if (trailingSlash === "always") {
    return path.endsWith("/") ? path : path + "/"
  } else {
    return path
  }
}

```

For a complete overview, and to give feedback on this experimental API, see the [Serialized Manifest RFC](https://github.com/withastro/roadmap/blob/feat/serialised-config/proposals/0051-serialized-manifest.md).
