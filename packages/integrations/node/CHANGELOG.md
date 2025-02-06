# @astrojs/node

## 9.0.2

### Patch Changes

- [#514](https://github.com/withastro/adapters/pull/514) [`ea4297b`](https://github.com/withastro/adapters/commit/ea4297b7bdb72ef0202e9f547625e7fa71a6a73e) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes a bug that caused the preview server to ignore wildcard host options

## 9.0.1

### Patch Changes

- [#454](https://github.com/withastro/adapters/pull/454) [`83cedad`](https://github.com/withastro/adapters/commit/83cedad780bf7a23ae9f6ca0c44a7b7f1c1767e1) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Improves Astro 5 support

## 9.0.0

### Major Changes

- [#375](https://github.com/withastro/adapters/pull/375) [`e7881f7`](https://github.com/withastro/adapters/commit/e7881f7928c6ca62d43c763033f9ed065a907f3b) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code to works with Astro 5 changes to hybrid rendering. No changes are necessary to your project, apart from using Astro 5

- [#397](https://github.com/withastro/adapters/pull/397) [`776a266`](https://github.com/withastro/adapters/commit/776a26670cf483e37ec0e6eba27a0bde09db0146) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

- [#392](https://github.com/withastro/adapters/pull/392) [`3a49eb7`](https://github.com/withastro/adapters/commit/3a49eb7802c44212ccfab06034b7dc5f2b060e94) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code for Astro 5 changes. No changes is required to your project, apart from using Astro 5

- [#451](https://github.com/withastro/adapters/pull/451) [`167b369`](https://github.com/withastro/adapters/commit/167b369a0a1612c792af8846f6ea167e999e1abb) Thanks [@ematipico](https://github.com/ematipico)! - Updates `send` dependency to v1.1.0

### Minor Changes

- [#385](https://github.com/withastro/adapters/pull/385) [`bb725b7`](https://github.com/withastro/adapters/commit/bb725b7a430a01a3cd197e3e84381be4fa0c945c) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Cleans up `astro:env` support

## 9.0.0-beta.3

### Major Changes

- [`167b369`](https://github.com/withastro/adapters/commit/167b369a0a1612c792af8846f6ea167e999e1abb) Thanks [@bluwy](https://github.com/bluwy)! - Updates `send` dependency to v1.1.0

## 9.0.0-beta.2

### Major Changes

- [#375](https://github.com/withastro/adapters/pull/375) [`e7881f7`](https://github.com/withastro/adapters/commit/e7881f7928c6ca62d43c763033f9ed065a907f3b) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code to works with Astro 5 changes to hybrid rendering. No changes are necessary to your project, apart from using Astro 5

- [#397](https://github.com/withastro/adapters/pull/397) [`776a266`](https://github.com/withastro/adapters/commit/776a26670cf483e37ec0e6eba27a0bde09db0146) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

- [#392](https://github.com/withastro/adapters/pull/392) [`3a49eb7`](https://github.com/withastro/adapters/commit/3a49eb7802c44212ccfab06034b7dc5f2b060e94) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code for Astro 5 changes. No changes is required to your project, apart from using Astro 5

### Minor Changes

- [#385](https://github.com/withastro/adapters/pull/385) [`bb725b7`](https://github.com/withastro/adapters/commit/bb725b7a430a01a3cd197e3e84381be4fa0c945c) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Cleans up `astro:env` support

## 9.0.0-alpha.1

### Major Changes

- [#11679](https://github.com/withastro/astro/pull/11679) [`ea71b90`](https://github.com/withastro/astro/commit/ea71b90c9c08ddd1d3397c78e2e273fb799f7dbd) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds stable support for `astro:env`

- [#11770](https://github.com/withastro/astro/pull/11770) [`cfa6a47`](https://github.com/withastro/astro/commit/cfa6a47ac7a541f99fdad46a68d0cca6e5816cd5) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Removed support for the Squoosh image service. As the underlying library `libsquoosh` is no longer maintained, and the image service sees very little usage we have decided to remove it from Astro.

  Our recommendation is to use the base Sharp image service, which is more powerful, faster, and more actively maintained.

  ```diff
  - import { squooshImageService } from "astro/config";
  import { defineConfig } from "astro/config";

  export default defineConfig({
  -  image: {
  -    service: squooshImageService()
  -  }
  });
  ```

  If you are using this service, and cannot migrate to the base Sharp image service, a third-party extraction of the previous service is available here: https://github.com/Princesseuh/astro-image-service-squoosh

## 9.0.0-alpha.0

### Patch Changes

- Updated dependencies [[`b6fbdaa`](https://github.com/withastro/astro/commit/b6fbdaa94a9ecec706a99e1938fbf5cd028c72e0), [`89bab1e`](https://github.com/withastro/astro/commit/89bab1e70786123fbe933a9d7a1b80c9334dcc5f), [`d74617c`](https://github.com/withastro/astro/commit/d74617cbd3278feba05909ec83db2d73d57a153e), [`e90f559`](https://github.com/withastro/astro/commit/e90f5593d23043579611452a84b9e18ad2407ef9), [`2df49a6`](https://github.com/withastro/astro/commit/2df49a6fb4f6d92fe45f7429430abe63defeacd6), [`8a53517`](https://github.com/withastro/astro/commit/8a5351737d6a14fc55f1dafad8f3b04079e81af6)]:
  - astro@5.0.0-alpha.0

## 8.3.4

### Patch Changes

- [#398](https://github.com/withastro/adapters/pull/398) [`0cf7e91`](https://github.com/withastro/adapters/commit/0cf7e912607fcd76072bf710b8f857dc8cc07a33) Thanks [@bluwy](https://github.com/bluwy)! - Updates `send` dependency to 0.19.0

## 8.3.4

### Patch Changes

- [#398](https://github.com/withastro/adapters/pull/398) [`0cf7e91`](https://github.com/withastro/adapters/commit/0cf7e912607fcd76072bf710b8f857dc8cc07a33) Thanks [@bluwy](https://github.com/bluwy)! - Updates `send` dependency to 0.19.0

## 8.3.3

### Patch Changes

- [#11535](https://github.com/withastro/astro/pull/11535) [`932bd2e`](https://github.com/withastro/astro/commit/932bd2eb07f1d7cb2c91e7e7d31fe84c919e302b) Thanks [@matthewp](https://github.com/matthewp)! - Move polyfills up before awaiting the env module in the Node.js adapter.

  Previously the env setting was happening before the polyfills were applied. This means that if the Astro env code (or any dependencies) depended on `crypto`, it would not be polyfilled in time.

  Polyfills should be applied ASAP to prevent races. This moves it to the top of the Node adapter.

## 8.3.2

### Patch Changes

- [#11296](https://github.com/withastro/astro/pull/11296) [`5848d97`](https://github.com/withastro/astro/commit/5848d9786768d1290de982670bcc7773280ef08d) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Fixes `astro:env` getSecret compatibility

## 8.3.1

### Patch Changes

- [#11261](https://github.com/withastro/astro/pull/11261) [`f5f8ed2`](https://github.com/withastro/astro/commit/f5f8ed275b76adfb11b7c3c1e800753a25416498) Thanks [@matthewp](https://github.com/matthewp)! - Fix backwards compat with Astro <= 4.9

- [#11263](https://github.com/withastro/astro/pull/11263) [`7d59750`](https://github.com/withastro/astro/commit/7d597506615fa5a34327304e8321be7b9c4b799d) Thanks [@wackbyte](https://github.com/wackbyte)! - Refactor to use Astro's integration logger for logging

## 8.3.0

### Minor Changes

- [#11199](https://github.com/withastro/astro/pull/11199) [`2bdca27`](https://github.com/withastro/astro/commit/2bdca27ff4002efd330667b0b4ca3e00d5b7a2db) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds support for experimental `astro:env` released in Astro 4.10

## 8.2.6

### Patch Changes

- [#11202](https://github.com/withastro/astro/pull/11202) [`d0248bc`](https://github.com/withastro/astro/commit/d0248bc083dff713b66d44bcefbf389cdf67e22d) Thanks [@dkobierski](https://github.com/dkobierski)! - Fixes suppressed logs when error occurs

## 8.2.5

### Patch Changes

- [#10491](https://github.com/withastro/astro/pull/10491) [`28e33a2f9c04373eae5da2e6edb0dc2981bce790`](https://github.com/withastro/astro/commit/28e33a2f9c04373eae5da2e6edb0dc2981bce790) Thanks [@castarco](https://github.com/castarco)! - Fixes a bug where the preview server wrongly appends trailing slashes to subresource URLs.

## 8.2.4

### Patch Changes

- [#10454](https://github.com/withastro/astro/pull/10454) [`83f9105cd50e2756d02ca2be73ab84f9d582d3f8`](https://github.com/withastro/astro/commit/83f9105cd50e2756d02ca2be73ab84f9d582d3f8) Thanks [@lilnasy](https://github.com/lilnasy)! - Prevents crashes caused by rejections of offshoot promises.

## 8.2.3

### Patch Changes

- [#10285](https://github.com/withastro/astro/pull/10285) [`d5277df5a4d1e9a8a7b6c8d7b87912e13a163f7f`](https://github.com/withastro/astro/commit/d5277df5a4d1e9a8a7b6c8d7b87912e13a163f7f) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes an issue where malformed requests could cause the server to error in certain cases.

## 8.2.2

### Patch Changes

- [#10282](https://github.com/withastro/astro/pull/10282) [`b47dcaa25968ec85ba96fce23381c94a94e389f6`](https://github.com/withastro/astro/commit/b47dcaa25968ec85ba96fce23381c94a94e389f6) Thanks [@SatanshuMishra](https://github.com/SatanshuMishra)! - Fixes the `server.host` option to properly listen on all network interfaces when set to `true`

## 8.2.1

### Patch Changes

- [#10208](https://github.com/withastro/astro/pull/10208) [`8cd38f02456640c063552aef00b2b8a216b3935d`](https://github.com/withastro/astro/commit/8cd38f02456640c063552aef00b2b8a216b3935d) Thanks [@log101](https://github.com/log101)! - Fixes custom headers are not added to the Node standalone server responses in preview mode

## 8.2.0

### Minor Changes

- [#9143](https://github.com/withastro/astro/pull/9143) [`041fdd5c89920f7ccf944b095f29e451f78b0e28`](https://github.com/withastro/astro/commit/041fdd5c89920f7ccf944b095f29e451f78b0e28) Thanks [@ematipico](https://github.com/ematipico)! - Adds experimental support for internationalization domains

## 8.1.0

### Minor Changes

- [#9080](https://github.com/withastro/astro/pull/9080) [`a12196d6b59e39f5d405734ecdbf6f6b42b39a93`](https://github.com/withastro/astro/commit/a12196d6b59e39f5d405734ecdbf6f6b42b39a93) Thanks [@msxdan](https://github.com/msxdan)! - Add trailingSlash support to NodeJS adapter

## 8.0.0

### Major Changes

- [#9661](https://github.com/withastro/astro/pull/9661) [`d6edc7540864cf5d294d7b881eb886a3804f6d05`](https://github.com/withastro/astro/commit/d6edc7540864cf5d294d7b881eb886a3804f6d05) Thanks [@ematipico](https://github.com/ematipico)! - If host is unset in standalone mode, the server host will now fallback to `localhost` instead of `127.0.0.1`. When `localhost` is used, the operating system can decide to use either `::1` (ipv6) or `127.0.0.1` (ipv4) itself. This aligns with how the Astro dev and preview server works by default.

  If you relied on `127.0.0.1` (ipv4) before, you can set the `HOST` environment variable to `127.0.0.1` to explicitly use ipv4. For example, `HOST=127.0.0.1 node ./dist/server/entry.mjs`.

- [#9661](https://github.com/withastro/astro/pull/9661) [`d6edc7540864cf5d294d7b881eb886a3804f6d05`](https://github.com/withastro/astro/commit/d6edc7540864cf5d294d7b881eb886a3804f6d05) Thanks [@ematipico](https://github.com/ematipico)! - **Breaking**: Minimum required Astro version is now 4.2.0.
  Reorganizes internals to be more maintainable.

### Patch Changes

- [#9661](https://github.com/withastro/astro/pull/9661) [`d6edc7540864cf5d294d7b881eb886a3804f6d05`](https://github.com/withastro/astro/commit/d6edc7540864cf5d294d7b881eb886a3804f6d05) Thanks [@ematipico](https://github.com/ematipico)! - Fixes an issue where the preview server appeared to be ready to serve requests before binding to a port.

## 7.0.4

### Patch Changes

- [#9533](https://github.com/withastro/astro/pull/9533) [`48f47b50a0f8bc0fa51760215def36640f79050d`](https://github.com/withastro/astro/commit/48f47b50a0f8bc0fa51760215def36640f79050d) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes a bug where an error while serving response stopped the server.

## 7.0.3

### Patch Changes

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 7.0.2

### Patch Changes

- [#9471](https://github.com/withastro/astro/pull/9471) [`6bf470cfb`](https://github.com/withastro/astro/commit/6bf470cfb87e853c0a1f69bceb09246801bc8bdc) Thanks [@alexnguyennz](https://github.com/alexnguyennz)! - Fix typo in @astrojs/node README

## 7.0.1

### Patch Changes

- [#9366](https://github.com/withastro/astro/pull/9366) [`1b4e91898`](https://github.com/withastro/astro/commit/1b4e91898116f75b02b66ec402385cf44e559118) Thanks [@lilnasy](https://github.com/lilnasy)! - Updates NPM package to refer to the stable Astro version instead of a beta.

## 7.0.0

### Major Changes

- [#9199](https://github.com/withastro/astro/pull/9199) [`49aa215a0`](https://github.com/withastro/astro/commit/49aa215a01ee1c4805316c85bb0aea6cfbc25a31) Thanks [@lilnasy](https://github.com/lilnasy)! - The internals of the integration have been updated to support Astro 4.0. Make sure to upgrade your Astro version as Astro 3.0 is no longer supported.

## 7.0.0-beta.1

### Major Changes

- [#9199](https://github.com/withastro/astro/pull/9199) [`49aa215a0`](https://github.com/withastro/astro/commit/49aa215a01ee1c4805316c85bb0aea6cfbc25a31) Thanks [@lilnasy](https://github.com/lilnasy)! - The internals of the integration have been updated to support Astro 4.0. Make sure to upgrade your Astro version as Astro 3.0 is no longer supported.

## 7.0.0-beta.0

### Patch Changes

- Updated dependencies [[`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3), [`6201bbe96`](https://github.com/withastro/astro/commit/6201bbe96c2a083fb201e4a43a9bd88499821a3e), [`cdabf6ef0`](https://github.com/withastro/astro/commit/cdabf6ef02be7220fd2b6bdcef924ceca089381e), [`1c48ed286`](https://github.com/withastro/astro/commit/1c48ed286538ab9e354eca4e4dcd7c6385c96721), [`37697a2c5`](https://github.com/withastro/astro/commit/37697a2c5511572dc29c0a4ea46f90c2f62be8e6), [`bd0c2e9ae`](https://github.com/withastro/astro/commit/bd0c2e9ae3389a9d3085050c1e8134ae98dff299), [`0fe3a7ed5`](https://github.com/withastro/astro/commit/0fe3a7ed5d7bb1a9fce1623e84ba14104b51223c), [`710be505c`](https://github.com/withastro/astro/commit/710be505c9ddf416e77a75343d8cae9c497d72c6), [`153a5abb9`](https://github.com/withastro/astro/commit/153a5abb905042ac68b712514dc9ec387d3e6b17)]:
  - astro@4.0.0-beta.0

## 6.1.0

### Minor Changes

- [#9125](https://github.com/withastro/astro/pull/9125) [`8f1d50957`](https://github.com/withastro/astro/commit/8f1d509574f5ee5d77816a13d89ce452dce403ff) Thanks [@matthewp](https://github.com/matthewp)! - Automatically sets immutable cache headers for assets served from the `/_astro` directory.

## 6.1.0

### Minor Changes

- [#9125](https://github.com/withastro/astro/pull/9125) [`8f1d50957`](https://github.com/withastro/astro/commit/8f1d509574f5ee5d77816a13d89ce452dce403ff) Thanks [@matthewp](https://github.com/matthewp)! - Automatically sets immutable cache headers for assets served from the `/_astro` directory.

## 6.0.4

### Patch Changes

- [#9071](https://github.com/withastro/astro/pull/9071) [`c9487138d`](https://github.com/withastro/astro/commit/c9487138d6d8fd39c8c8512239b6724cf2b275ff) Thanks [@pilcrowOnPaper](https://github.com/pilcrowOnPaper)! - Fixes a bug where the response stream would not cancel when the connection closed

## 6.0.3

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

- Updated dependencies [[`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c), [`d78806dfe`](https://github.com/withastro/astro/commit/d78806dfe0301ea7ffe6c7c1f783bd415ac7cda9), [`d1c75fe15`](https://github.com/withastro/astro/commit/d1c75fe158839699c59728cf3a83888e8c72a459), [`aa265d730`](https://github.com/withastro/astro/commit/aa265d73024422967c1b1c68ad268c419c6c798f), [`78adbc443`](https://github.com/withastro/astro/commit/78adbc4433208458291e36713909762e148e1e5d), [`21e0757ea`](https://github.com/withastro/astro/commit/21e0757ea22a57d344c934045ca19db93b684436), [`357270f2a`](https://github.com/withastro/astro/commit/357270f2a3d0bf2aa634ba7e52e9d17618eff4a7)]:
  - astro@3.2.3

## 6.0.2

### Patch Changes

- [#8698](https://github.com/withastro/astro/pull/8698) [`47ea310f0`](https://github.com/withastro/astro/commit/47ea310f01d06ed1562c790bec348718a2fa8277) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Use a Node-specific image endpoint to resolve images in dev and Node SSR. This should fix many issues related to getting 404 from the \_image endpoint under certain configurations

- Updated dependencies [[`31c59ad8b`](https://github.com/withastro/astro/commit/31c59ad8b6a72f95c98a306ecf92d198c03110b4), [`47ea310f0`](https://github.com/withastro/astro/commit/47ea310f01d06ed1562c790bec348718a2fa8277), [`345808170`](https://github.com/withastro/astro/commit/345808170fce783ddd3c9a4035a91fa64dcc5f46)]:
  - astro@3.2.1

## 6.0.1

### Patch Changes

- [#8599](https://github.com/withastro/astro/pull/8599) [`2e1d5f873`](https://github.com/withastro/astro/commit/2e1d5f8739552c3428aa7cbb82811ed2b9b24fdb) Thanks [@lilnasy](https://github.com/lilnasy)! - The node adapter now logs uncaught errors encountered during rendering a page.

- Updated dependencies [[`bcad715ce`](https://github.com/withastro/astro/commit/bcad715ce67bc73a7927c941d1e7f02a82d638c2), [`bdd267d08`](https://github.com/withastro/astro/commit/bdd267d08937611984d074a2872af11ecf3e1a12), [`e522a5eb4`](https://github.com/withastro/astro/commit/e522a5eb41c7df1e62c307c84cd14d53777439ff), [`ed54d4644`](https://github.com/withastro/astro/commit/ed54d46449accc99ad117d6b0d50a8905e4d65d7), [`70f2a8003`](https://github.com/withastro/astro/commit/70f2a80039d232731f63ea735e896997ec0eac7a), [`4398e9298`](https://github.com/withastro/astro/commit/4398e929877dfadd2067af28413284afdfde9d8b), [`8f8b9069d`](https://github.com/withastro/astro/commit/8f8b9069ddd21cf57d37955ab3a92710492226f5), [`5a988eaf6`](https://github.com/withastro/astro/commit/5a988eaf609ddc1b9609acb0cdc2dda43d10a5c2)]:
  - astro@3.1.2

## 6.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8188](https://github.com/withastro/astro/pull/8188) [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc) Thanks [@ematipico](https://github.com/ematipico)! - Reduced the amount of polyfills provided by Astro. Astro will no longer provide (no-op) polyfills for several web apis such as HTMLElement, Image or Document. If you need access to those APIs on the server, we recommend using more proper polyfills available on npm.

### Minor Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`cd2d7e769`](https://github.com/withastro/astro/commit/cd2d7e76981ef9b9013453aa2629838e1e9fd422) Thanks [@ematipico](https://github.com/ematipico)! - Introduced the concept of feature map. A feature map is a list of features that are built-in in Astro, and an Adapter
  can tell Astro if it can support it.

  ```ts
  import { AstroIntegration } from './astro';

  function myIntegration(): AstroIntegration {
    return {
      name: 'astro-awesome-list',
      // new feature map
      supportedAstroFeatures: {
        hybridOutput: 'experimental',
        staticOutput: 'stable',
        serverOutput: 'stable',
        assets: {
          supportKind: 'stable',
          isSharpCompatible: false,
          isSquooshCompatible: false,
        },
      },
    };
  }
  ```

### Patch Changes

- Updated dependencies [[`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312), [`db39206cb`](https://github.com/withastro/astro/commit/db39206cbb85b034859ac416179f141184bb2bff), [`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`0c7b42dc6`](https://github.com/withastro/astro/commit/0c7b42dc6780e687e416137539f55a3a427d1d10), [`46c4c0e05`](https://github.com/withastro/astro/commit/46c4c0e053f830585b9ef229ce1c259df00a80f8), [`364d861bd`](https://github.com/withastro/astro/commit/364d861bd527b8511968e2837728148f090bedef), [`2484dc408`](https://github.com/withastro/astro/commit/2484dc4080e5cd84b9a53648a1de426d7c907be2), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`c2c71d90c`](https://github.com/withastro/astro/commit/c2c71d90c264a2524f99e0373ab59015f23ad4b1), [`cd2d7e769`](https://github.com/withastro/astro/commit/cd2d7e76981ef9b9013453aa2629838e1e9fd422), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`e45f30293`](https://github.com/withastro/astro/commit/e45f3029340db718b6ed7e91b5d14f5cf14cd71d), [`c0de7a7b0`](https://github.com/withastro/astro/commit/c0de7a7b0f042cd49cbea4f4ac1b2ab6f9fef644), [`65c354969`](https://github.com/withastro/astro/commit/65c354969e6fe0ef6d622e8f4c545e2f717ce8c6), [`3c3100851`](https://github.com/withastro/astro/commit/3c31008519ce68b5b1b1cb23b71fbe0a2d506882), [`34cb20021`](https://github.com/withastro/astro/commit/34cb2002161ba88df6bcb72fecfd12ed867c134b), [`a824863ab`](https://github.com/withastro/astro/commit/a824863ab1c451f4068eac54f28dd240573e1cba), [`44f7a2872`](https://github.com/withastro/astro/commit/44f7a28728c56c04ac377b6e917329f324874043), [`1048aca55`](https://github.com/withastro/astro/commit/1048aca550769415e528016e42b358ffbfd44b61), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`9e021a91c`](https://github.com/withastro/astro/commit/9e021a91c57d10809f588dd47968fc0e7f8b4d5c), [`7511a4980`](https://github.com/withastro/astro/commit/7511a4980fd36536464c317de33a5190427f430a), [`c37632a20`](https://github.com/withastro/astro/commit/c37632a20d06164fb97a4c2fc48df6d960398832), [`acf652fc1`](https://github.com/withastro/astro/commit/acf652fc1d5db166231e87e22d0d50444f5556d8), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`8450379db`](https://github.com/withastro/astro/commit/8450379db854fb1eaa9f38f21d65db240bc616cd), [`dbc97b121`](https://github.com/withastro/astro/commit/dbc97b121f42583728f1cdfdbf14575fda943f5b), [`7d2f311d4`](https://github.com/withastro/astro/commit/7d2f311d428e3d1c8c13b9bf2a708d6435713fc2), [`2540feedb`](https://github.com/withastro/astro/commit/2540feedb06785d5a20eecc3668849f147d778d4), [`ea7ff5177`](https://github.com/withastro/astro/commit/ea7ff5177dbcd7b2508cb1eef1b22b8ee1f47079), [`68efd4a8b`](https://github.com/withastro/astro/commit/68efd4a8b29f248397667801465b3152dc98e9a7), [`7bd1b86f8`](https://github.com/withastro/astro/commit/7bd1b86f85c06fdde0a1ed9146d01bac69990671), [`036388f66`](https://github.com/withastro/astro/commit/036388f66dab68ad54b895ed86f9176958dd83c8), [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae), [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`a8f35777e`](https://github.com/withastro/astro/commit/a8f35777e7e322068a4e2f520c2c9e43ade19e58), [`70f34f5a3`](https://github.com/withastro/astro/commit/70f34f5a355f42526ee9e5355f3de8e510002ea2), [`5208a3c8f`](https://github.com/withastro/astro/commit/5208a3c8fefcec7694857fb344af351f4631fc34), [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`ffc9e2d3d`](https://github.com/withastro/astro/commit/ffc9e2d3de46049bf3d82140ef018f524fb03187), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`0f637c71e`](https://github.com/withastro/astro/commit/0f637c71e511cb4c51712128d217a26c8eee4d40), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`8a5b0c1f3`](https://github.com/withastro/astro/commit/8a5b0c1f3a4be6bb62db66ec70144109ff5b4c59), [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`632579dc2`](https://github.com/withastro/astro/commit/632579dc2094cc342929261c89e689f0dd358284), [`3674584e0`](https://github.com/withastro/astro/commit/3674584e02b161a698b429ceb66723918fdc56ac), [`1db4e92c1`](https://github.com/withastro/astro/commit/1db4e92c12ed73681217f5cefd39f2f47542f961), [`e7f872e91`](https://github.com/withastro/astro/commit/e7f872e91e852b901cf221a5151077dec64305bf), [`16f09dfff`](https://github.com/withastro/astro/commit/16f09dfff7722fda99dd0412e3006a7a39c80829), [`4477bb41c`](https://github.com/withastro/astro/commit/4477bb41c8ed688785c545731ef5b184b629f4e5), [`55c10d1d5`](https://github.com/withastro/astro/commit/55c10d1d564e805efc3c1a7c48e0d9a1cdf0c7ed), [`3e834293d`](https://github.com/withastro/astro/commit/3e834293d47ab2761a7aa013916e8371871efb7f), [`96beb883a`](https://github.com/withastro/astro/commit/96beb883ad87f8bbf5b2f57e14a743763d2a6f58), [`997a0db8a`](https://github.com/withastro/astro/commit/997a0db8a4e3851edd69384cf5eadbb969e1d547), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`0f0625504`](https://github.com/withastro/astro/commit/0f0625504145f18cba7dc6cf20291cb2abddc5a9), [`e1ae56e72`](https://github.com/withastro/astro/commit/e1ae56e724d0f83db1230359e06cd6bc26f5fa26), [`f32d093a2`](https://github.com/withastro/astro/commit/f32d093a280faafff024228c12bb438156ec34d7), [`f01eb585e`](https://github.com/withastro/astro/commit/f01eb585e7c972d940761309b1595f682b6922d2), [`b76c166bd`](https://github.com/withastro/astro/commit/b76c166bdd8e28683f62806aef968d1e0c3b06d9), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`866ed4098`](https://github.com/withastro/astro/commit/866ed4098edffb052239cdb26e076cf8db61b1d9), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf), [`32669cd47`](https://github.com/withastro/astro/commit/32669cd47555e9c7433c3998a2b6e624dfb2d8e9)]:
  - astro@3.0.0

## 6.0.0-rc.1

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Patch Changes

- [#8176](https://github.com/withastro/astro/pull/8176) [`d08c83ee3`](https://github.com/withastro/astro/commit/d08c83ee3fe0f10374264f61ee473255dcf0cd06) Thanks [@ematipico](https://github.com/ematipico)! - Fix an issue where `express` couldn't use the `handler` in `middleware` mode.

- Updated dependencies [[`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`582132328`](https://github.com/withastro/astro/commit/5821323285646aee7ff9194a505f708028e4db57), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`95120efbe`](https://github.com/withastro/astro/commit/95120efbe817163663492181cbeb225849354493), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`179796405`](https://github.com/withastro/astro/commit/179796405e053b559d83f84507e5a465861a029a), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf)]:
  - astro@3.0.0-rc.5

## 6.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [`3dc1ca2fa`](https://github.com/withastro/astro/commit/3dc1ca2fac8d9965cc5085a5d09e72ed87b4281a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Reduced the amount of polyfills provided by Astro. Astro will no longer provide (no-op) polyfills for several web apis such as HTMLElement, Image or Document. If you need access to those APIs on the server, we recommend using more proper polyfills available on npm.

### Minor Changes

- [`9b4f70a62`](https://github.com/withastro/astro/commit/9b4f70a629f55e461759ba46f68af7097a2e9215) Thanks [@ematipico](https://github.com/ematipico)! - Introduced the concept of feature map. A feature map is a list of features that are built-in in Astro, and an Adapter
  can tell Astro if it can support it.

  ```ts
  import { AstroIntegration } from './astro';

  function myIntegration(): AstroIntegration {
    return {
      name: 'astro-awesome-list',
      // new feature map
      supportedAstroFeatures: {
        hybridOutput: 'experimental',
        staticOutput: 'stable',
        serverOutput: 'stable',
        assets: {
          supportKind: 'stable',
          isSharpCompatible: false,
          isSquooshCompatible: false,
        },
      },
    };
  }
  ```

### Patch Changes

- Updated dependencies [[`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81), [`76ddef19c`](https://github.com/withastro/astro/commit/76ddef19ccab6e5f7d3a5740cd41acf10e334b38), [`9b4f70a62`](https://github.com/withastro/astro/commit/9b4f70a629f55e461759ba46f68af7097a2e9215), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`2f951cd40`](https://github.com/withastro/astro/commit/2f951cd403dfcc2c3ca6aae618ae3e1409516e32), [`c022a4217`](https://github.com/withastro/astro/commit/c022a4217a805d223c1494e9eda4e48bbf810388), [`67becaa58`](https://github.com/withastro/astro/commit/67becaa580b8f787df58de66b7008b7098f1209c), [`bc37331d8`](https://github.com/withastro/astro/commit/bc37331d8154e3e95a8df9131e4e014e78a7a9e7), [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8), [`3dc1ca2fa`](https://github.com/withastro/astro/commit/3dc1ca2fac8d9965cc5085a5d09e72ed87b4281a), [`1be84dfee`](https://github.com/withastro/astro/commit/1be84dfee3ce8e6f5cc624f99aec4e980f6fde37), [`35f01df79`](https://github.com/withastro/astro/commit/35f01df797d23315f2bee2fc3fd795adb0559c58), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`78de801f2`](https://github.com/withastro/astro/commit/78de801f21fd4ca1653950027d953bf08614566b), [`59d6e569f`](https://github.com/withastro/astro/commit/59d6e569f63e175c97e82e94aa7974febfb76f7c), [`7723c4cc9`](https://github.com/withastro/astro/commit/7723c4cc93298c2e6530e55da7afda048f22cf81), [`fb5cd6b56`](https://github.com/withastro/astro/commit/fb5cd6b56dc27a71366ed5e1ab8bfe9b8f96bac5), [`631b9c410`](https://github.com/withastro/astro/commit/631b9c410d5d66fa384674027ba95d69ebb5063f)]:
  - astro@3.0.0-beta.0

## 5.3.6

### Patch Changes

- [#8176](https://github.com/withastro/astro/pull/8176) [`d08c83ee3`](https://github.com/withastro/astro/commit/d08c83ee3fe0f10374264f61ee473255dcf0cd06) Thanks [@ematipico](https://github.com/ematipico)! - Fix an issue where `express` couldn't use the `handler` in `middleware` mode.

- Updated dependencies [[`582132328`](https://github.com/withastro/astro/commit/5821323285646aee7ff9194a505f708028e4db57), [`fddd4dc71`](https://github.com/withastro/astro/commit/fddd4dc71af321bd6b4d01bb4b1b955284846e60), [`cfc465dde`](https://github.com/withastro/astro/commit/cfc465ddebcc58d20f29ecffaa857a77525435a9), [`95120efbe`](https://github.com/withastro/astro/commit/95120efbe817163663492181cbeb225849354493), [`273335cb0`](https://github.com/withastro/astro/commit/273335cb01615c3c06d46c02464f4496a81f8d0b), [`9142178b1`](https://github.com/withastro/astro/commit/9142178b113443749b87c1d259859b42a3d7a9c4), [`179796405`](https://github.com/withastro/astro/commit/179796405e053b559d83f84507e5a465861a029a)]:
  - astro@2.10.13

## 5.3.5

### Patch Changes

- [#8141](https://github.com/withastro/astro/pull/8141) [`4c15c0696`](https://github.com/withastro/astro/commit/4c15c069691ca25efcb9ebb7d9b45605cd136ed3) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixed an issue where the preview mode handled 404 and 500 routes differently from running app with node directly.

- Updated dependencies [[`04caa99c4`](https://github.com/withastro/astro/commit/04caa99c48ce604ca3b90302ff0df8dcdbeee650)]:
  - astro@2.10.12

## 5.3.4

### Patch Changes

- [#8084](https://github.com/withastro/astro/pull/8084) [`560e45924`](https://github.com/withastro/astro/commit/560e45924622141206ff5b47d134cb343d6d2a71) Thanks [@hbgl](https://github.com/hbgl)! - Stream request body instead of buffering it in memory.

- Updated dependencies [[`c19987df0`](https://github.com/withastro/astro/commit/c19987df0be3520cf774476cea270c03edd08354), [`560e45924`](https://github.com/withastro/astro/commit/560e45924622141206ff5b47d134cb343d6d2a71), [`afc45af20`](https://github.com/withastro/astro/commit/afc45af2022f7c43fbb6c5c04983695f3819e47e), [`d1f7143f9`](https://github.com/withastro/astro/commit/d1f7143f9caf2ffa0e87cc55c0e05339d3501db3), [`3e46634fd`](https://github.com/withastro/astro/commit/3e46634fd540e5b967d2e5c9abd6235452cee2f2), [`a12027b6a`](https://github.com/withastro/astro/commit/a12027b6af411be39700919ca47e240a335e9887)]:
  - astro@2.10.8

## 5.3.3

### Patch Changes

- [#6928](https://github.com/withastro/astro/pull/6928) [`b16cb787f`](https://github.com/withastro/astro/commit/b16cb787fd16ebaaf860d8bb183789caf01c0fb7) Thanks [@JerryWu1234](https://github.com/JerryWu1234)! - Support the `--host` flag when running the standalone server (also works for `astro preview --host`)

- Updated dependencies [[`1b8d30209`](https://github.com/withastro/astro/commit/1b8d3020990130dabfaaf753db73a32c6e0c896a), [`405913cdf`](https://github.com/withastro/astro/commit/405913cdf20b26407aa351c090f0a0859a4e6f54), [`87d4b1843`](https://github.com/withastro/astro/commit/87d4b18437c7565c48cad4bea81831c2a244ebb8), [`c23377caa`](https://github.com/withastro/astro/commit/c23377caafbc75deb91c33b9678c1b6868ad40ea), [`86bee2812`](https://github.com/withastro/astro/commit/86bee2812185df6e14025e5962a335f51853587b)]:
  - astro@2.10.6

## 5.3.2

### Patch Changes

- [#7708](https://github.com/withastro/astro/pull/7708) [`4dd6c7900`](https://github.com/withastro/astro/commit/4dd6c7900ca40db1b2cebed9bd02a9eb00874d8d) Thanks [@DixCouleur](https://github.com/DixCouleur)! - fix issuse #7590 "res.writeHead is not a function" in Express/Node middleware

- Updated dependencies [[`41afb8405`](https://github.com/withastro/astro/commit/41afb84057f606b0e7f9a73c1e40487068e43948), [`c00b6f0c4`](https://github.com/withastro/astro/commit/c00b6f0c49027125ea3026e89b21fef84380d187), [`1f0ee494a`](https://github.com/withastro/astro/commit/1f0ee494a5190356d130282f1f51ba2a5e6ea63f), [`00cb28f49`](https://github.com/withastro/astro/commit/00cb28f4964a60bc609770108d491acc277997b9), [`c264be349`](https://github.com/withastro/astro/commit/c264be3497db4aa8b3bcce0d2f79a26e35b8e91e), [`e1e958a75`](https://github.com/withastro/astro/commit/e1e958a75860292688569e82b4617fc141056202)]:
  - astro@2.10.0

## 5.3.1

### Patch Changes

- [#7754](https://github.com/withastro/astro/pull/7754) [`298dbb89f`](https://github.com/withastro/astro/commit/298dbb89f2963a547370b6e65cafd2650fdb1b27) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve `404` behavior in middleware mode

- Updated dependencies [[`298dbb89f`](https://github.com/withastro/astro/commit/298dbb89f2963a547370b6e65cafd2650fdb1b27), [`9e2203847`](https://github.com/withastro/astro/commit/9e22038472c8be05ed7a72620534b88324dce793), [`5c5da8d2f`](https://github.com/withastro/astro/commit/5c5da8d2fbb37830f3ee81830d4c9afcd2c1a3e3), [`0b8375fe8`](https://github.com/withastro/astro/commit/0b8375fe82a15bfff3f517f98de6454adb2779f1), [`89d015db6`](https://github.com/withastro/astro/commit/89d015db6ce4d15b5b1140f0eb6bfbef187d6ad7), [`ebf7ebbf7`](https://github.com/withastro/astro/commit/ebf7ebbf7ae767625d736fad327954cfb853837e)]:
  - astro@2.9.7

## 5.3.0

### Minor Changes

- [#7385](https://github.com/withastro/astro/pull/7385) [`8e2923cc6`](https://github.com/withastro/astro/commit/8e2923cc6219eda01ca2c749f5c7fa2fe4319455) Thanks [@ematipico](https://github.com/ematipico)! - `Astro.locals` is now exposed to the adapter API. Node Adapter can now pass in a `locals` object in the SSR handler middleware.

### Patch Changes

- Updated dependencies [[`30bb36371`](https://github.com/withastro/astro/commit/30bb363713e3d2c50d0d4816d970aa93b836a3b0), [`3943fa390`](https://github.com/withastro/astro/commit/3943fa390a0bd41317a673d0f841e0461c7499cd), [`7877a06d8`](https://github.com/withastro/astro/commit/7877a06d829305eed356fbb8bfd1ef578cd5466e), [`e314a04bf`](https://github.com/withastro/astro/commit/e314a04bfbf0526838b7c9aac452251b27d69719), [`33cdc8622`](https://github.com/withastro/astro/commit/33cdc8622a56c8e5465b7a50f627ecc568870c6b), [`76fcdb84d`](https://github.com/withastro/astro/commit/76fcdb84dd828ac373b2dc739e57fadf650820fd), [`8e2923cc6`](https://github.com/withastro/astro/commit/8e2923cc6219eda01ca2c749f5c7fa2fe4319455), [`459b5bd05`](https://github.com/withastro/astro/commit/459b5bd05f562238f7250520efe3cf0fa156bb45)]:
  - astro@2.7.0

## 5.2.0

### Minor Changes

- [#7227](https://github.com/withastro/astro/pull/7227) [`4929332c3`](https://github.com/withastro/astro/commit/4929332c3210d1634b8607c7736d9049860a2079) Thanks [@alex-sherwin](https://github.com/alex-sherwin)! - Fixes NodeJS adapter for multiple set-cookie headers and combining AstroCookies and Response.headers cookies

### Patch Changes

- [#7243](https://github.com/withastro/astro/pull/7243) [`409c60028`](https://github.com/withastro/astro/commit/409c60028aaab09b8f2383ef5730531cd23db4ba) Thanks [@Riki-WangJJ](https://github.com/Riki-WangJJ)! - Support directory redirects and query params at the same time

- [#7260](https://github.com/withastro/astro/pull/7260) [`39403c32f`](https://github.com/withastro/astro/commit/39403c32faea58399c61d3344b770f195be60d5b) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Unflags support for `output: 'hybrid'` mode, which enables pre-rendering by default. The additional `experimental.hybridOutput` flag can be safely removed from your configuration.

- Updated dependencies [[`57f8d14c0`](https://github.com/withastro/astro/commit/57f8d14c027c30919363e12c664ccff4ed64d0fc), [`414eb19d2`](https://github.com/withastro/astro/commit/414eb19d2fcb55758f9d053076773b11b62f4c97), [`a7e2b37ff`](https://github.com/withastro/astro/commit/a7e2b37ff73871c46895c615846a86a539f45330), [`dd1a6b6c9`](https://github.com/withastro/astro/commit/dd1a6b6c941aeb7af934bd12db22412af262f5a1), [`d72cfa7ca`](https://github.com/withastro/astro/commit/d72cfa7cad758192163712ceb269405659fd14bc), [`144813f73`](https://github.com/withastro/astro/commit/144813f7308dcb9de64ebe3f0f2c6cba9ad81eb1), [`b5213654b`](https://github.com/withastro/astro/commit/b5213654b1b7f3ba573a48d3be688b2bdde7870f), [`e3b8c6296`](https://github.com/withastro/astro/commit/e3b8c62969d680d1915a122c610d281d6711aa63), [`890a2bc98`](https://github.com/withastro/astro/commit/890a2bc9891a2449ab99b01b65468f6dddba6b12), [`39403c32f`](https://github.com/withastro/astro/commit/39403c32faea58399c61d3344b770f195be60d5b), [`101f03209`](https://github.com/withastro/astro/commit/101f032098148b3daaac8d46ff1e535b79232e43)]:
  - astro@2.6.0

## 5.1.4

### Patch Changes

- [#6991](https://github.com/withastro/astro/pull/6991) [`719002ca5`](https://github.com/withastro/astro/commit/719002ca5b128744fb4316d4a52c5dcd46a42759) Thanks [@MoustaphaDev](https://github.com/MoustaphaDev)! - Enable experimental support for hybrid SSR with pre-rendering enabled by default

  **astro.config.mjs**

  ```js
  import { defineConfig } from 'astro/config';
  export default defineConfig({
    output: 'hybrid',
    experimental: {
      hybridOutput: true,
    },
  });
  ```

  Then add `export const prerender =  false` to any page or endpoint you want to opt-out of pre-rendering.

  **src/pages/contact.astro**

  ```astro
  ---
  export const prerender = false;

  if (Astro.request.method === 'POST') {
    // handle form submission
  }
  ---

  <form method="POST">
    <input type="text" name="name" />
    <input type="email" name="email" />
    <button type="submit">Submit</button>
  </form>
  ```

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

- Updated dependencies [[`4516d7b22`](https://github.com/withastro/astro/commit/4516d7b22c5979cde4537f196b53ae2826ba9561), [`e186ecc5e`](https://github.com/withastro/astro/commit/e186ecc5e292de8c6a2c441a2d588512c0813068), [`c6d7ebefd`](https://github.com/withastro/astro/commit/c6d7ebefdd554a9ef29cfeb426ac55cab80d6473), [`914c439bc`](https://github.com/withastro/astro/commit/914c439bccee9fec002c6d92beaa501c398e62ac), [`e9fc2c221`](https://github.com/withastro/astro/commit/e9fc2c2213036d47cd30a47a6cdad5633481a0f8), [`075eee08f`](https://github.com/withastro/astro/commit/075eee08f2e2b0baea008b97f3523f2cb937ee44), [`719002ca5`](https://github.com/withastro/astro/commit/719002ca5b128744fb4316d4a52c5dcd46a42759), [`fc52681ba`](https://github.com/withastro/astro/commit/fc52681ba2f8fe8bcd92eeedf3c6a52fd86a390e), [`fb84622af`](https://github.com/withastro/astro/commit/fb84622af04f795de8d17f24192de105f70fe910), [`cada10a46`](https://github.com/withastro/astro/commit/cada10a466f81f8edb0aa664f9cffdb6b5b8f307), [`cd410c5eb`](https://github.com/withastro/astro/commit/cd410c5eb71f825259279c27c4c39d0ad282c3f0), [`73ec6f6c1`](https://github.com/withastro/astro/commit/73ec6f6c16cadb71dafe9f664f0debde072c3173), [`410428672`](https://github.com/withastro/astro/commit/410428672ed97bba7ca0b3352c1a7ee564921462), [`763ff2d1e`](https://github.com/withastro/astro/commit/763ff2d1e44f54b899d7c65386f1b4b877c95737), [`c1669c001`](https://github.com/withastro/astro/commit/c1669c0011eecfe65a459d727848c18c189a54ca), [`3d525efc9`](https://github.com/withastro/astro/commit/3d525efc95cfb2deb5d9e04856d02965d66901c9)]:
  - astro@2.5.0

## 5.1.3

### Patch Changes

- [#7076](https://github.com/withastro/astro/pull/7076) [`781f558c4`](https://github.com/withastro/astro/commit/781f558c401a5f02927d150e4628a77c55cccd28) Thanks [@matthewp](https://github.com/matthewp)! - Fix redirects on directories when using base option

## 5.1.2

### Patch Changes

- [#6935](https://github.com/withastro/astro/pull/6935) [`c405cef64`](https://github.com/withastro/astro/commit/c405cef64711a7b6a480e8b4068cd2bf3cf889a9) Thanks [@matthewp](https://github.com/matthewp)! - Catch errors that occur within the stream in the Node adapter

- Updated dependencies [[`a98df9374`](https://github.com/withastro/astro/commit/a98df9374dec65c678fa47319cb1481b1af123e2), [`ac57b5549`](https://github.com/withastro/astro/commit/ac57b5549f828a17bdbebdaca7ace075307a3c9d), [`50975f2ea`](https://github.com/withastro/astro/commit/50975f2ea3a59f9e023cc631a9372c0c7986eec9), [`ebae1eaf8`](https://github.com/withastro/astro/commit/ebae1eaf87f49399036033c673b513338f7d9c42), [`dc062f669`](https://github.com/withastro/astro/commit/dc062f6695ce577dc569781fc0678c903012c336)]:
  - astro@2.3.3
  - @astrojs/webapi@2.1.1

## 5.1.1

### Patch Changes

- [#6746](https://github.com/withastro/astro/pull/6746) [`4cc1bf61b`](https://github.com/withastro/astro/commit/4cc1bf61b832dba9aab1916b56f5260ceac2d97d) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix malformed URLs crashing the server in certain cases

- Updated dependencies [[`489dd8d69`](https://github.com/withastro/astro/commit/489dd8d69cdd9d7c243cf8bec96051a914984b9c), [`a1a4f45b5`](https://github.com/withastro/astro/commit/a1a4f45b51a80215fa7598da83bd0d9c5acd20d2), [`a1108e037`](https://github.com/withastro/astro/commit/a1108e037115cdb67d03505286c7d3a4fc2a1ff5), [`8b88e4cf1`](https://github.com/withastro/astro/commit/8b88e4cf15c8bea7942b3985380164e0edf7250b), [`d54cbe413`](https://github.com/withastro/astro/commit/d54cbe41349e55f8544212ad9320705f07325920), [`4c347ab51`](https://github.com/withastro/astro/commit/4c347ab51e46f2319d614f8577fe502e3dc816e2), [`ff0430786`](https://github.com/withastro/astro/commit/ff043078630e678348ae4f4757b3015b3b862c16), [`2f2e572e9`](https://github.com/withastro/astro/commit/2f2e572e937fd25451bbc78a05d55b7caa1ca3ec), [`7116c021a`](https://github.com/withastro/astro/commit/7116c021a39eac15a6e1264dfbd11bef0f5d618a)]:
  - astro@2.2.0

## 5.1.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

### Patch Changes

- Updated dependencies [[`fec583909`](https://github.com/withastro/astro/commit/fec583909ab62829dc0c1600e2387979365f2b94), [`b087b83fe`](https://github.com/withastro/astro/commit/b087b83fe266c431fe34a07d5c2293cc4ab011c6), [`694918a56`](https://github.com/withastro/astro/commit/694918a56b01104831296be0c25456135a63c784), [`a20610609`](https://github.com/withastro/astro/commit/a20610609863ae3b48afe96819b8f11ae4f414d5), [`a4a74ab70`](https://github.com/withastro/astro/commit/a4a74ab70cd2aa0d812a1f6b202c4e240a8913bf), [`75921b3cd`](https://github.com/withastro/astro/commit/75921b3cd916d439f6392c487c21532fde35ed13), [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808)]:
  - astro@2.1.0
  - @astrojs/webapi@2.1.0

## 5.0.4

### Patch Changes

- [#6323](https://github.com/withastro/astro/pull/6323) [`5e26bc891`](https://github.com/withastro/astro/commit/5e26bc891cbebb3598acfa760c135a25c548d624) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated Undici to 5.20.0. This fixes a security issue and handling of cookies in certain cases in dev

- Updated dependencies [[`5e26bc891`](https://github.com/withastro/astro/commit/5e26bc891cbebb3598acfa760c135a25c548d624), [`a156ecbb7`](https://github.com/withastro/astro/commit/a156ecbb7f4df6a46124a9a12eb712f9163db2ed), [`ccd72e6bb`](https://github.com/withastro/astro/commit/ccd72e6bb41e570d42b1b158e8124c8e04a1943d), [`504c7bacb`](https://github.com/withastro/astro/commit/504c7bacb8c1f2308a31e6c412825ba34983ba33), [`63dda6ded`](https://github.com/withastro/astro/commit/63dda6dedd4c6ea1d5ce72e9cf3fe5f88339a927), [`f91a7f376`](https://github.com/withastro/astro/commit/f91a7f376c223f18b4d8fbed81f95f6bea1cef8d)]:
  - astro@2.0.15

## 5.0.3

### Patch Changes

- [#6110](https://github.com/withastro/astro/pull/6110) [`67ccec9e1`](https://github.com/withastro/astro/commit/67ccec9e168f241318d9dac40096016982d89b7b) Thanks [@matthewp](https://github.com/matthewp)! - Fixes support for prerendering and query params

## 5.0.2

### Patch Changes

- [#6088](https://github.com/withastro/astro/pull/6088) [`6a03649f0`](https://github.com/withastro/astro/commit/6a03649f0084f0df6738236d4a86c9936325cee7) Thanks [@QingXia-Ela](https://github.com/QingXia-Ela)! - fix incorrent encoded when path has other language characters

## 5.0.1

### Patch Changes

- [#5992](https://github.com/withastro/astro/pull/5992) [`60b32d585`](https://github.com/withastro/astro/commit/60b32d58565d87e87573eb268408293fc28ec657) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fix `Astro.url.protocol` when using the @astrojs/node SSR adapter with HTTPS

- Updated dependencies [[`b53e0717b`](https://github.com/withastro/astro/commit/b53e0717b7f6b042baaeec7f87999e99c76c031c), [`60b32d585`](https://github.com/withastro/astro/commit/60b32d58565d87e87573eb268408293fc28ec657), [`883e0cc29`](https://github.com/withastro/astro/commit/883e0cc29968d51ed6c7515be035a40b28bafdad), [`dabce6b8c`](https://github.com/withastro/astro/commit/dabce6b8c684f851c3535f8acead06cbef6dce2a), [`aedf23f85`](https://github.com/withastro/astro/commit/aedf23f8582e32a6b94b81ddba9b323831f2b22a)]:
  - astro@2.0.2

## 5.0.0

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

- [#5707](https://github.com/withastro/astro/pull/5707) [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b) Thanks [@bluwy](https://github.com/bluwy)! - Remove `astro:build:start` backwards compatibility code

- [#5806](https://github.com/withastro/astro/pull/5806) [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53) Thanks [@matthewp](https://github.com/matthewp)! - Make astro a `peerDependency` of integrations

  This marks `astro` as a `peerDependency` of several packages that are already getting `major` version bumps. This is so we can more properly track the dependency between them and what version of Astro they are being used with.

### Minor Changes

- [#5832](https://github.com/withastro/astro/pull/5832) [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Add support for serving well-known URIs with the @astrojs/node SSR adapter

### Patch Changes

- [#5701](https://github.com/withastro/astro/pull/5701) [`9869f2f6d`](https://github.com/withastro/astro/commit/9869f2f6d8c344babb8a59cb54918de14bd95dcc) Thanks [@wulinsheng123](https://github.com/wulinsheng123)! - Support custom 404 page in standalone mode

- Updated dependencies [[`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b), [`16dc36a87`](https://github.com/withastro/astro/commit/16dc36a870df47a4151a8ed2d91d0bd1bb812458), [`01f3f463b`](https://github.com/withastro/astro/commit/01f3f463bf2918b310d130a9fabbf3ee21d14029), [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144), [`05caf445d`](https://github.com/withastro/astro/commit/05caf445d4d2728f1010aeb2179a9e756c2fd17d), [`49ab4f231`](https://github.com/withastro/astro/commit/49ab4f231c23b34891c3ee86f4b92bf8d6d267a3), [`a342a486c`](https://github.com/withastro/astro/commit/a342a486c2831461e24e6c2f1ca8a9d3e15477b6), [`8fb28648f`](https://github.com/withastro/astro/commit/8fb28648f66629741cb976bfe34ccd9d8f55661e), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`c2180746b`](https://github.com/withastro/astro/commit/c2180746b4f6d9ef1b6f86924f21f52cc6ab4e63), [`ae8a012a7`](https://github.com/withastro/astro/commit/ae8a012a7b6884a03c50494332ee37b4505c2c3b), [`cf2de5422`](https://github.com/withastro/astro/commit/cf2de5422c26bfdea4c75f76e57b57299ded3e3a), [`ce5c5dbd4`](https://github.com/withastro/astro/commit/ce5c5dbd46afbe738b03600758bf5c35113de522), [`ec09bb664`](https://github.com/withastro/astro/commit/ec09bb6642064dbd7d2f3369afb090363ae18de2), [`665a2c222`](https://github.com/withastro/astro/commit/665a2c2225e42881f5a9550599e8f3fc1deea0b4), [`259a539d7`](https://github.com/withastro/astro/commit/259a539d7d70c783330c797794b15716921629cf), [`f7aa1ec25`](https://github.com/withastro/astro/commit/f7aa1ec25d1584f7abd421903fbef66b1c050e2a), [`4987d6f44`](https://github.com/withastro/astro/commit/4987d6f44cfd0d81d88f21f5c380503403dc1e6a), [`304823811`](https://github.com/withastro/astro/commit/304823811eddd8e72aa1d8e2d39b40ab5cda3565), [`302e0ef8f`](https://github.com/withastro/astro/commit/302e0ef8f5d5232e3348afe680e599f3e537b5c5), [`55cea0a9d`](https://github.com/withastro/astro/commit/55cea0a9d8c8df91a46590fc04a9ac28089b3432), [`dd56c1941`](https://github.com/withastro/astro/commit/dd56c19411b126439b8bc42d681b6fa8c06e8c61), [`9963c6e4d`](https://github.com/withastro/astro/commit/9963c6e4d50c392c3d1ac4492237020f15ccb1de), [`46ecd5de3`](https://github.com/withastro/astro/commit/46ecd5de34df619e2ee73ccea39a57acd37bc0b8), [`be901dc98`](https://github.com/withastro/astro/commit/be901dc98c4a7f6b5536540aa8f7ba5108e939a0), [`f6cf92b48`](https://github.com/withastro/astro/commit/f6cf92b48317a19a3840ad781b77d6d3cae143bb), [`e818cc046`](https://github.com/withastro/astro/commit/e818cc0466a942919ea3c41585e231c8c80cb3d0), [`8c100a6fe`](https://github.com/withastro/astro/commit/8c100a6fe6cc652c3799d1622e12c2c969f30510), [`116d8835c`](https://github.com/withastro/astro/commit/116d8835ca9e78f8b5e477ee5a3d737b69f80706), [`840412128`](https://github.com/withastro/astro/commit/840412128b00a04515156e92c314a929d6b94f6d), [`1f49cddf9`](https://github.com/withastro/astro/commit/1f49cddf9e9ffc651efc171b2cbde9fbe9e8709d), [`7325df412`](https://github.com/withastro/astro/commit/7325df412107fc0e65cd45c1b568fb686708f723), [`16c7d0bfd`](https://github.com/withastro/astro/commit/16c7d0bfd49d2b9bfae45385f506bcd642f9444a), [`c55fbcb8e`](https://github.com/withastro/astro/commit/c55fbcb8edca1fe118a44f68c9f9436a4719d171), [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d), [`2a5786419`](https://github.com/withastro/astro/commit/2a5786419599b8674473c699300172b9aacbae2e), [`4a1cabfe6`](https://github.com/withastro/astro/commit/4a1cabfe6b9ef8a6fbbcc0727a0dc6fa300cedaa), [`a8d3e7924`](https://github.com/withastro/astro/commit/a8d3e79246605d252dcddad159e358e2d79bd624), [`fa8c131f8`](https://github.com/withastro/astro/commit/fa8c131f88ef67d14c62f1c00c97ed74d43a80ac), [`64b8082e7`](https://github.com/withastro/astro/commit/64b8082e776b832f1433ed288e6f7888adb626d0), [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`23dc9ea96`](https://github.com/withastro/astro/commit/23dc9ea96a10343852d965efd41fe6665294f1fb), [`63a6ceb38`](https://github.com/withastro/astro/commit/63a6ceb38d88331451dca64d0034c7c58e3d26f1), [`a3a7fc929`](https://github.com/withastro/astro/commit/a3a7fc9298e6d88abb4b7bee1e58f05fa9558cf1), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`5fd9208d4`](https://github.com/withastro/astro/commit/5fd9208d447f5ab8909a2188b6c2491a0debd49d), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`899214298`](https://github.com/withastro/astro/commit/899214298cee5f0c975c7245e623c649e1842d73), [`3a00ecb3e`](https://github.com/withastro/astro/commit/3a00ecb3eb4bc44be758c064f2bde6e247e8a593), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0), [`1ca81c16b`](https://github.com/withastro/astro/commit/1ca81c16b8b66236e092e6eb6ec3f73f5668421c), [`b66d7195c`](https://github.com/withastro/astro/commit/b66d7195c17a55ea0931bc3744888bd4f5f01ce6)]:
  - astro@2.0.0
  - @astrojs/webapi@2.0.0

## 5.0.0-beta.1

<details>
<summary>See changes in 5.0.0-beta.1</summary>

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

- [#5806](https://github.com/withastro/astro/pull/5806) [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53) Thanks [@matthewp](https://github.com/matthewp)! - Make astro a `peerDependency` of integrations

  This marks `astro` as a `peerDependency` of several packages that are already getting `major` version bumps. This is so we can more properly track the dependency between them and what version of Astro they are being used with.

### Minor Changes

- [#5832](https://github.com/withastro/astro/pull/5832) [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Add support for serving well-known URIs with the @astrojs/node SSR adapter

### Patch Changes

- [#5701](https://github.com/withastro/astro/pull/5701) [`9869f2f6d`](https://github.com/withastro/astro/commit/9869f2f6d8c344babb8a59cb54918de14bd95dcc) Thanks [@wulinsheng123](https://github.com/wulinsheng123)! - Support custom 404 page in standalone mode

- Updated dependencies [[`01f3f463b`](https://github.com/withastro/astro/commit/01f3f463bf2918b310d130a9fabbf3ee21d14029), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`c2180746b`](https://github.com/withastro/astro/commit/c2180746b4f6d9ef1b6f86924f21f52cc6ab4e63), [`ae8a012a7`](https://github.com/withastro/astro/commit/ae8a012a7b6884a03c50494332ee37b4505c2c3b), [`cf2de5422`](https://github.com/withastro/astro/commit/cf2de5422c26bfdea4c75f76e57b57299ded3e3a), [`ec09bb664`](https://github.com/withastro/astro/commit/ec09bb6642064dbd7d2f3369afb090363ae18de2), [`665a2c222`](https://github.com/withastro/astro/commit/665a2c2225e42881f5a9550599e8f3fc1deea0b4), [`f7aa1ec25`](https://github.com/withastro/astro/commit/f7aa1ec25d1584f7abd421903fbef66b1c050e2a), [`302e0ef8f`](https://github.com/withastro/astro/commit/302e0ef8f5d5232e3348afe680e599f3e537b5c5), [`840412128`](https://github.com/withastro/astro/commit/840412128b00a04515156e92c314a929d6b94f6d), [`1f49cddf9`](https://github.com/withastro/astro/commit/1f49cddf9e9ffc651efc171b2cbde9fbe9e8709d), [`c55fbcb8e`](https://github.com/withastro/astro/commit/c55fbcb8edca1fe118a44f68c9f9436a4719d171), [`4a1cabfe6`](https://github.com/withastro/astro/commit/4a1cabfe6b9ef8a6fbbcc0727a0dc6fa300cedaa), [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`23dc9ea96`](https://github.com/withastro/astro/commit/23dc9ea96a10343852d965efd41fe6665294f1fb), [`63a6ceb38`](https://github.com/withastro/astro/commit/63a6ceb38d88331451dca64d0034c7c58e3d26f1), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0)]:
  - astro@2.0.0-beta.2
  - @astrojs/webapi@2.0.0-beta.0

</details>

## 5.0.0-beta.0

<details>
<summary>See changes in 5.0.0-beta.0</summary>

### Major Changes

- [#5707](https://github.com/withastro/astro/pull/5707) [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b) Thanks [@bluwy](https://github.com/bluwy)! - Remove `astro:build:start` backwards compatibility code

### Patch Changes

- Updated dependencies [[`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144), [`8fb28648f`](https://github.com/withastro/astro/commit/8fb28648f66629741cb976bfe34ccd9d8f55661e), [`dd56c1941`](https://github.com/withastro/astro/commit/dd56c19411b126439b8bc42d681b6fa8c06e8c61), [`f6cf92b48`](https://github.com/withastro/astro/commit/f6cf92b48317a19a3840ad781b77d6d3cae143bb), [`16c7d0bfd`](https://github.com/withastro/astro/commit/16c7d0bfd49d2b9bfae45385f506bcd642f9444a), [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b)]:
  - astro@2.0.0-beta.0

</details>

## 4.0.0

### Patch Changes

- Updated dependencies [[`d85ec7484`](https://github.com/withastro/astro/commit/d85ec7484ce14a4c7d3f480da8f38fcb9aff388f), [`d2960984c`](https://github.com/withastro/astro/commit/d2960984c59af7b60a3ea472c6c58fb00534a8e6), [`31ec84797`](https://github.com/withastro/astro/commit/31ec8479721a1cd65538ec041458c5ffe8f50ee9), [`5ec0f6ed5`](https://github.com/withastro/astro/commit/5ec0f6ed55b0a14a9663a90a03428345baf126bd), [`dced4a8a2`](https://github.com/withastro/astro/commit/dced4a8a2657887ec569860d9862d20f695dc23a), [`6b156dd3b`](https://github.com/withastro/astro/commit/6b156dd3b467884839a571c53114aadf26fa4b0b)]:
  - astro@1.7.0

## 3.1.1

### Patch Changes

- [#5560](https://github.com/withastro/astro/pull/5560) [`281ea9fc3`](https://github.com/withastro/astro/commit/281ea9fc344dec4348e398696e671f833334045b) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve error message when serverEntrypoint does not exist

- Updated dependencies [[`b2f0210c4`](https://github.com/withastro/astro/commit/b2f0210c400a547d3067fdae6d15663b827be3a6), [`02bb0a1cc`](https://github.com/withastro/astro/commit/02bb0a1ccd53e38157eec3a750160731fce64b9c), [`2bd23e454`](https://github.com/withastro/astro/commit/2bd23e454fc9559aa00b9a493772acd69ba9ce6c)]:
  - astro@1.6.15

## 3.1.0

### Minor Changes

- [#5418](https://github.com/withastro/astro/pull/5418) [`aa16b6ceb`](https://github.com/withastro/astro/commit/aa16b6cebc08e0a10a17024d31ee7d2319258a34) Thanks [@jbanety](https://github.com/jbanety)! - Sometimes Astro sends a ReadableStream as a response and it raise an error **TypeError: body is not async iterable.**

  I added a function to get a response iterator from different response types (sourced from apollo-client).

  With this, node adapter can handle all the Astro response types.

- [#5421](https://github.com/withastro/astro/pull/5421) [`12236dbc0`](https://github.com/withastro/astro/commit/12236dbc06e1e43618b61d180020a67cb31499f8) Thanks [@Scttpr](https://github.com/Scttpr)! - Allow HOST env variable to be provided at runtime

### Patch Changes

- Updated dependencies [[`1ab505855`](https://github.com/withastro/astro/commit/1ab505855f9942659e3d23cb1ac668f04b98889d), [`ff35b4759`](https://github.com/withastro/astro/commit/ff35b4759bd0fecfee6c99bf510c2e32d2574992), [`b22ba1c03`](https://github.com/withastro/astro/commit/b22ba1c03a3e384dad569feb38fa34ecf7ec3b93), [`a9f7ff966`](https://github.com/withastro/astro/commit/a9f7ff96676a40b78e22379edc8eb9ce60a29fb8)]:
  - astro@1.6.10

## 3.0.0

### Major Changes

- [#5290](https://github.com/withastro/astro/pull/5290) [`b2b291d29`](https://github.com/withastro/astro/commit/b2b291d29143703cece0d12c8e74b2e1151d2061) Thanks [@matthewp](https://github.com/matthewp)! - Handle base configuration in adapters

  This allows adapters to correctly handle `base` configuration. Internally Astro now matches routes when the URL includes the `base`.

  Adapters now also have access to the `removeBase` method which will remove the `base` from a pathname. This is useful to look up files for static assets.

### Patch Changes

- Updated dependencies [[`b2b291d29`](https://github.com/withastro/astro/commit/b2b291d29143703cece0d12c8e74b2e1151d2061), [`97e2b6ad7`](https://github.com/withastro/astro/commit/97e2b6ad7a6fa23e82be28b2f57cdf3f85fab112), [`4af4d8fa0`](https://github.com/withastro/astro/commit/4af4d8fa0035130fbf31c82d72777c3679bc1ca5), [`f6add3924`](https://github.com/withastro/astro/commit/f6add3924d5cd59925a6ea4bf7f2f731709bc893), [`247eb7411`](https://github.com/withastro/astro/commit/247eb7411f429317e5cd7d401a6660ee73641313)]:
  - astro@1.6.4

## 2.0.2

### Patch Changes

- [#5207](https://github.com/withastro/astro/pull/5207) [`c203a5cc2`](https://github.com/withastro/astro/commit/c203a5cc2f12d8c1c3e96d4f08bdd2bb2823e997) Thanks [@BeanWei](https://github.com/BeanWei)! - fix static server path for windows system

## 2.0.1

### Patch Changes

- [#5114](https://github.com/withastro/astro/pull/5114) [`5c0c6e1ac`](https://github.com/withastro/astro/commit/5c0c6e1ac67e6341625f028794986700197334ae) Thanks [@matthewp](https://github.com/matthewp)! - Fixes finding the client folder for serving assets

- [#5111](https://github.com/withastro/astro/pull/5111) [`df4d84610`](https://github.com/withastro/astro/commit/df4d84610ad2b543a37cb3bcac9887bfef0b8994) Thanks [@rishi-raj-jain](https://github.com/rishi-raj-jain)! - fix port in standalone mode

## 2.0.0

### Major Changes

- [#5056](https://github.com/withastro/astro/pull/5056) [`e55af8a23`](https://github.com/withastro/astro/commit/e55af8a23233b6335f45b7a04b9d026990fb616c) Thanks [@matthewp](https://github.com/matthewp)! - # Standalone mode for the Node.js adapter

  New in `@astrojs/node` is support for **standalone mode**. With standalone mode you can start your production server without needing to write any server JavaScript yourself. The server starts simply by running the script like so:

  ```shell
  node ./dist/server/entry.mjs
  ```

  To enable standalone mode, set the new `mode` to `'standalone'` option in your Astro config:

  ```js
  import { defineConfig } from 'astro/config';
  import nodejs from '@astrojs/node';

  export default defineConfig({
    output: 'server',
    adapter: nodejs({
      mode: 'standalone',
    }),
  });
  ```

  See the @astrojs/node documentation to learn all of the options available in standalone mode.

  ## Breaking change

  This is a semver major change because the new `mode` option is required. Existing @astrojs/node users who are using their own HTTP server framework such as Express can upgrade by setting the `mode` option to `'middleware'` in order to build to a middleware mode, which is the same behavior and API as before.

  ```js
  import { defineConfig } from 'astro/config';
  import nodejs from '@astrojs/node';

  export default defineConfig({
    output: 'server',
    adapter: nodejs({
      mode: 'middleware',
    }),
  });
  ```

### Minor Changes

- [#5056](https://github.com/withastro/astro/pull/5056) [`e55af8a23`](https://github.com/withastro/astro/commit/e55af8a23233b6335f45b7a04b9d026990fb616c) Thanks [@matthewp](https://github.com/matthewp)! - # Adapter support for `astro preview`

  Adapters are now about to support the `astro preview` command via a new integration option. The Node.js adapter `@astrojs/node` is the first of the built-in adapters to gain support for this. What this means is that if you are using `@astrojs/node` you can new preview your SSR app by running:

  ```shell
  npm run preview
  ```

  ## Adapter API

  We will be updating the other first party Astro adapters to support preview over time. Adapters can opt in to this feature by providing the `previewEntrypoint` via the `setAdapter` function in `astro:config:done` hook. The Node.js adapter's code looks like this:

  ```diff
  export default function() {
    return {
  		name: '@astrojs/node',
  		hooks: {
  			'astro:config:done': ({ setAdapter, config }) => {
          setAdapter({
            name: '@astrojs/node',
            serverEntrypoint: '@astrojs/node/server.js',
  +          previewEntrypoint: '@astrojs/node/preview.js',
            exports: ['handler'],
          });

          // more here
        }
      }
    };
  }
  ```

  The `previewEntrypoint` is a module in the adapter's package that is a Node.js script. This script is run when `astro preview` is run and is charged with starting up the built server. See the Node.js implementation in `@astrojs/node` to see how that is implemented.

- [#5056](https://github.com/withastro/astro/pull/5056) [`e55af8a23`](https://github.com/withastro/astro/commit/e55af8a23233b6335f45b7a04b9d026990fb616c) Thanks [@matthewp](https://github.com/matthewp)! - # New build configuration

  The ability to customize SSR build configuration more granularly is now available in Astro. You can now customize the output folder for `server` (the server code for SSR), `client` (your client-side JavaScript and assets), and `serverEntry` (the name of the entrypoint server module). Here are the defaults:

  ```js
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    output: 'server',
    build: {
      server: './dist/server/',
      client: './dist/client/',
      serverEntry: 'entry.mjs',
    },
  });
  ```

  These new configuration options are only supported in SSR mode and are ignored when building to SSG (a static site).

  ## Integration hook change

  The integration hook `astro:build:start` includes a param `buildConfig` which includes all of these same options. You can continue to use this param in Astro 1.x, but it is deprecated in favor of the new `build.config` options. All of the built-in adapters have been updated to the new format. If you have an integration that depends on this param we suggest upgrading to do this instead:

  ```js
  export default function myIntegration() {
    return {
      name: 'my-integration',
      hooks: {
        'astro:config:setup': ({ updateConfig }) => {
          updateConfig({
            build: {
              server: '...',
            },
          });
        },
      },
    };
  }
  ```

## 1.1.0

### Minor Changes

- [#4876](https://github.com/withastro/astro/pull/4876) [`d3091f89e`](https://github.com/withastro/astro/commit/d3091f89e92fcfe1ad48daca74055d54b1c853a3) Thanks [@matthewp](https://github.com/matthewp)! - Adds the Astro.cookies API

  `Astro.cookies` is a new API for manipulating cookies in Astro components and API routes.

  In Astro components, the new `Astro.cookies` object is a map-like object that allows you to get, set, delete, and check for a cookie's existence (`has`):

  ```astro
  ---
  type Prefs = {
    darkMode: boolean;
  };

  Astro.cookies.set<Prefs>(
    'prefs',
    { darkMode: true },
    {
      expires: '1 month',
    },
  );

  const prefs = Astro.cookies.get<Prefs>('prefs').json();
  ---

  <body data-theme={prefs.darkMode ? 'dark' : 'light'}></body>
  ```

  Once you've set a cookie with Astro.cookies it will automatically be included in the outgoing response.

  This API is also available with the same functionality in API routes:

  ```js
  export function post({ cookies }) {
    cookies.set('loggedIn', false);

    return new Response(null, {
      status: 302,
      headers: {
        Location: '/login',
      },
    });
  }
  ```

  See [the RFC](https://github.com/withastro/rfcs/blob/main/proposals/0025-cookie-management.md) to learn more.

## 1.0.1

### Patch Changes

- [#4558](https://github.com/withastro/astro/pull/4558) [`742966456`](https://github.com/withastro/astro/commit/7429664566f05ecebf6d57906f950627e62e690c) Thanks [@tony-sull](https://github.com/tony-sull)! - Adding the `withastro` keyword to include the adapters on the [Integrations Catalog](https://astro.build/integrations)

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

### Patch Changes

- Updated dependencies [[`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308)]:
  - @astrojs/webapi@1.0.0

## 0.2.1

### Patch Changes

- [#4055](https://github.com/withastro/astro/pull/4055) [`44694d8a9`](https://github.com/withastro/astro/commit/44694d8a9084bb1b09840ec8967edd75fa033174) Thanks [@matthewp](https://github.com/matthewp)! - Handle binary data request bodies in the Node adapter

## 0.2.0

### Minor Changes

- [#4015](https://github.com/withastro/astro/pull/4015) [`6fd161d76`](https://github.com/withastro/astro/commit/6fd161d7691cbf9d3ffa4646e46059dfd0940010) Thanks [@matthewp](https://github.com/matthewp)! - New `output` configuration option

  This change introduces a new "output target" configuration option (`output`). Setting the output target lets you decide the format of your final build, either:

  - `"static"` (default): A static site. Your final build will be a collection of static assets (HTML, CSS, JS) that you can deploy to any static site host.
  - `"server"`: A dynamic server application. Your final build will be an application that will run in a hosted server environment, generating HTML dynamically for different requests.

  If `output` is omitted from your config, the default value `"static"` will be used.

  When using the `"server"` output target, you must also include a runtime adapter via the `adapter` configuration. An adapter will _adapt_ your final build to run on the deployed platform of your choice (Netlify, Vercel, Node.js, Deno, etc).

  To migrate: No action is required for most users. If you currently define an `adapter`, you will need to also add `output: 'server'` to your config file to make it explicit that you are building a server. Here is an example of what that change would look like for someone deploying to Netlify:

  ```diff
  import { defineConfig } from 'astro/config';
  import netlify from '@astrojs/netlify/functions';

  export default defineConfig({
    adapter: netlify(),
  + output: 'server',
  });
  ```

* [#3973](https://github.com/withastro/astro/pull/3973) [`5a23483ef`](https://github.com/withastro/astro/commit/5a23483efb3ba614b05a00064f84415620605204) Thanks [@matthewp](https://github.com/matthewp)! - Adds support for Astro.clientAddress

  The new `Astro.clientAddress` property allows you to get the IP address of the requested user.

  ```astro

  ```

  This property is only available when building for SSR, and only if the adapter you are using supports providing the IP address. If you attempt to access the property in a SSG app it will throw an error.

### Patch Changes

- [#4023](https://github.com/withastro/astro/pull/4023) [`4ca6a0933`](https://github.com/withastro/astro/commit/4ca6a0933d92dd559327dd46a28712d918caebf7) Thanks [@matthewp](https://github.com/matthewp)! - Fixes Node adapter to accept a request body

## 0.1.6

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.1.5

### Patch Changes

- [#3865](https://github.com/withastro/astro/pull/3865) [`1f9e4857`](https://github.com/withastro/astro/commit/1f9e4857ff2b2cb7db89d619618cdf546cd3b3dc) Thanks [@delucis](https://github.com/delucis)! - Small README fixes

* [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

## 0.1.4

### Patch Changes

- [#3817](https://github.com/withastro/astro/pull/3817) [`2f56664f`](https://github.com/withastro/astro/commit/2f56664f85596c6268ecb44bbb9c36cca2ea49c5) Thanks [@ran-dall](https://github.com/ran-dall)! - Fix example on `README.md`

## 0.1.3

### Patch Changes

- [#3677](https://github.com/withastro/astro/pull/3677) [`8045c8ad`](https://github.com/withastro/astro/commit/8045c8ade16fe4306448b7f98a4560ef0557d378) Thanks [@Jutanium](https://github.com/Jutanium)! - Update READMEs

## 0.1.2

### Patch Changes

- Updated dependencies [[`4de53ecc`](https://github.com/withastro/astro/commit/4de53eccef346bed843b491b7ab93987d7d85655)]:
  - @astrojs/webapi@0.12.0

## 0.1.1

### Patch Changes

- [`815d62f1`](https://github.com/withastro/astro/commit/815d62f151a36fef7d09590d4962ca71bda61b32) Thanks [@FredKSchott](https://github.com/FredKSchott)! - no changes.

## 0.1.0

### Minor Changes

- [#2979](https://github.com/withastro/astro/pull/2979) [`9d7a4b59`](https://github.com/withastro/astro/commit/9d7a4b59b53f8cb274266f5036d1cef841750252) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Welcome to the Astro v1.0.0 Beta! Read the [official announcement](https://astro.build/blog/astro-1-beta-release/) for more details.

## 0.0.2

### Patch Changes

- [#2879](https://github.com/withastro/astro/pull/2879) [`80034c6c`](https://github.com/withastro/astro/commit/80034c6cbc89761618847e6df43fd49560a05aa9) Thanks [@matthewp](https://github.com/matthewp)! - Netlify Adapter

  This change adds a Netlify adapter that uses Netlify Functions. You can use it like so:

  ```js
  import { defineConfig } from 'astro/config';
  import netlify from '@astrojs/netlify/functions';

  export default defineConfig({
    adapter: netlify(),
  });
  ```

* [#2873](https://github.com/withastro/astro/pull/2873) [`e4025d1f`](https://github.com/withastro/astro/commit/e4025d1f530310d6ab951109f4f53878a307471a) Thanks [@matthewp](https://github.com/matthewp)! - Improves the build by building to a single file for rendering

## 0.0.2-next.0

### Patch Changes

- [#2873](https://github.com/withastro/astro/pull/2873) [`e4025d1f`](https://github.com/withastro/astro/commit/e4025d1f530310d6ab951109f4f53878a307471a) Thanks [@matthewp](https://github.com/matthewp)! - Improves the build by building to a single file for rendering
