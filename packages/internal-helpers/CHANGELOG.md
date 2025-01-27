# @astrojs/internal-helpers

## 0.4.2

### Patch Changes

- [#12559](https://github.com/withastro/astro/pull/12559) [`1dc8f5e`](https://github.com/withastro/astro/commit/1dc8f5eb7c515c89aadc85cfa0a300d4f65e8671) Thanks [@delucis](https://github.com/delucis)! - Fixes usage of `fileURLToPath()` to anticipate the changed signature of this method in Node 22.1.0

## 0.4.1

### Patch Changes

- [#11323](https://github.com/withastro/astro/pull/11323) [`41064ce`](https://github.com/withastro/astro/commit/41064cee78c1cccd428f710a24c483aeb275fd95) Thanks [@ascorbic](https://github.com/ascorbic)! - Extracts fs helpers into shared internal-helpers module

## 0.4.0

### Minor Changes

- [#10596](https://github.com/withastro/astro/pull/10596) [`20463a6c1e1271d8dc3cb0ab3419ee5c72abd218`](https://github.com/withastro/astro/commit/20463a6c1e1271d8dc3cb0ab3419ee5c72abd218) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add `removeBase` function

## 0.3.0

### Minor Changes

- [#10189](https://github.com/withastro/astro/pull/10189) [`1ea0a25b94125e4f6f2ac82b42f638e22d7bdffd`](https://github.com/withastro/astro/commit/1ea0a25b94125e4f6f2ac82b42f638e22d7bdffd) Thanks [@peng](https://github.com/peng)! - Adds the option to pass an object to `build.assetsPrefix`. This allows for the use of multiple CDN prefixes based on the target file type.

  When passing an object to `build.assetsPrefix`, you must also specify a `fallback` domain to be used for all other file types not specified.

  Specify a file extension as the key (e.g. 'js', 'png') and the URL serving your assets of that file type as the value:

  ```js
  // astro.config.mjs
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    build: {
      assetsPrefix: {
        js: 'https://js.cdn.example.com',
        mjs: 'https://js.cdn.example.com', // if you have .mjs files, you must add a new entry like this
        png: 'https://images.cdn.example.com',
        fallback: 'https://generic.cdn.example.com',
      },
    },
  });
  ```

## 0.2.1

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

## 0.2.0

### Minor Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Patch Changes

- [#8062](https://github.com/withastro/astro/pull/8062) [`2aa6d8ace`](https://github.com/withastro/astro/commit/2aa6d8ace398a41c2dec5473521d758816b08191) Thanks [@bluwy](https://github.com/bluwy)! - Trigger re-release to fix `collapseDuplicateSlashes` export

## 0.2.0-rc.2

### Minor Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 0.2.0-beta.1

### Patch Changes

- [#8062](https://github.com/withastro/astro/pull/8062) [`2aa6d8ace`](https://github.com/withastro/astro/commit/2aa6d8ace398a41c2dec5473521d758816b08191) Thanks [@bluwy](https://github.com/bluwy)! - Trigger re-release to fix `collapseDuplicateSlashes` export

## 0.2.0-beta.0

### Minor Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 0.1.2

### Patch Changes

- [#7935](https://github.com/withastro/astro/pull/7935) [`6035bb35f`](https://github.com/withastro/astro/commit/6035bb35f222fc6a80b418f13998b21c59da85b6) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Add `collapseDuplicateSlashes` helper

## 0.1.1

### Patch Changes

- [#7440](https://github.com/withastro/astro/pull/7440) [`2b7539952`](https://github.com/withastro/astro/commit/2b75399520bebfc537cca8204e483f0df3373904) Thanks [@bluwy](https://github.com/bluwy)! - Add `slash` path utility
