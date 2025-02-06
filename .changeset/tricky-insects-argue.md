---
'astro': minor
---

:warning: **BREAKING CHANGE FOR EXPERIMENTAL SESSIONS ONLY** :warning:

Changes the `experimental.session` option to a boolean flag and moves session config to a top-level value. This change is to allow the new automatic session driver support. You now need to separately enable the `experimental.session` flag, and then configure the session driver using the top-level `session` key if providing manual configuration.

```diff
defineConfig({
  // ...
  experimental: {
-    session: {
-      driver: 'fs',
-    },
+    session: true,
  },
+  session: {
+    driver: 'fs',
+  },
});
```

You do not need to configure the session driver if you are using the Node or Netlify adapters and want to use the default session drivers for each adapter. The default session driver for the Node adapter is `fs`, and the default session driver for the Netlify adapter is `netlify-blobs`.

For example, if you are using the Node adapter, you can just enable the flag:

```js
defineConfig({
  // ...
  adapter: node({
    mode: 'standalone',
  }),
  experimental: {
    session: true,
  },
});
```
This will configure the session driver to use the default `fs` driver for the Node adapter. See the release notes for `@astrojs/node` and `@astrojs/netlify` for more information on the default session drivers for each adapter.

If you enable the flag but are using an adapter that does not have a default session driver, you will need to configure the session driver manually or the build will fail.
