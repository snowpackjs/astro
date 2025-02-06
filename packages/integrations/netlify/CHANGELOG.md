# @astrojs/netlify

## 6.1.0

### Minor Changes

- [#496](https://github.com/withastro/adapters/pull/496) [`4b5cd22`](https://github.com/withastro/adapters/commit/4b5cd2268e8ed5e720772f50241b299762ea1eb8) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Stabilizes `astro:env` secrets support

### Patch Changes

- [#454](https://github.com/withastro/adapters/pull/454) [`83cedad`](https://github.com/withastro/adapters/commit/83cedad780bf7a23ae9f6ca0c44a7b7f1c1767e1) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Improves Astro 5 support

- [#501](https://github.com/withastro/adapters/pull/501) [`012b31d`](https://github.com/withastro/adapters/commit/012b31d98ce87c1199eb38b7aba2a28b7c1cf8cc) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Refactor of the redirects logic

## 6.0.1

### Patch Changes

- [#481](https://github.com/withastro/adapters/pull/481) [`9d98b8a`](https://github.com/withastro/adapters/commit/9d98b8a19efdd5c7483cce70b732208093bf82b2) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes an error where edge middleware would incorrectly assign locals

- [#488](https://github.com/withastro/adapters/pull/488) [`f3739be`](https://github.com/withastro/adapters/commit/f3739bef812aa9659ff9bdd10ba9046ac716a3d5) Thanks [@ascorbic](https://github.com/ascorbic)! - Correctly pass Netlify context in edge middleware

## 6.0.0

### Major Changes

- [#367](https://github.com/withastro/adapters/pull/367) [`e02b54a`](https://github.com/withastro/adapters/commit/e02b54ad864ea25cb972f6196496b5aee36a47a3) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Removed support for the Squoosh image service. As the underlying library `libsquoosh` is no longer maintained, and the image service sees very little usage we have decided to remove it from Astro.

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

- [#367](https://github.com/withastro/adapters/pull/367) [`e02b54a`](https://github.com/withastro/adapters/commit/e02b54ad864ea25cb972f6196496b5aee36a47a3) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Deprecates the `functionPerRoute` option

  This option is now deprecated, and will be removed entirely in Astro v5.0. We suggest removing this option from your configuration as soon as you are able to:

  ```diff
  import { defineConfig } from 'astro/config';
  import vercel from '@astrojs/vercel/serverless';

  export default defineConfig({
    // ...
    output: 'server',
    adapter: vercel({
  -     functionPerRoute: true,
    }),
  });
  ```

- [#375](https://github.com/withastro/adapters/pull/375) [`e7881f7`](https://github.com/withastro/adapters/commit/e7881f7928c6ca62d43c763033f9ed065a907f3b) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code to works with Astro 5 changes to hybrid rendering. No changes are necessary to your project, apart from using Astro 5

- [#397](https://github.com/withastro/adapters/pull/397) [`776a266`](https://github.com/withastro/adapters/commit/776a26670cf483e37ec0e6eba27a0bde09db0146) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

- [#451](https://github.com/withastro/adapters/pull/451) [`f248546`](https://github.com/withastro/adapters/commit/f24854669a2a3da79d8bf1e89b0b54063df0668c) Thanks [@ematipico](https://github.com/ematipico)! - Updates esbuild dependency to v0.24.0

- [#392](https://github.com/withastro/adapters/pull/392) [`3a49eb7`](https://github.com/withastro/adapters/commit/3a49eb7802c44212ccfab06034b7dc5f2b060e94) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code for Astro 5 changes. No changes is required to your project, apart from using Astro 5

### Minor Changes

- [#385](https://github.com/withastro/adapters/pull/385) [`bb725b7`](https://github.com/withastro/adapters/commit/bb725b7a430a01a3cd197e3e84381be4fa0c945c) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Cleans up `astro:env` support

## 6.0.0-beta.1

### Major Changes

- [`f248546`](https://github.com/withastro/adapters/commit/f24854669a2a3da79d8bf1e89b0b54063df0668c) Thanks [@bluwy](https://github.com/bluwy)! - Updates esbuild dependency to v0.24.0

## 6.0.0-beta.0

### Major Changes

- [#367](https://github.com/withastro/adapters/pull/367) [`e02b54a`](https://github.com/withastro/adapters/commit/e02b54ad864ea25cb972f6196496b5aee36a47a3) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Removed support for the Squoosh image service. As the underlying library `libsquoosh` is no longer maintained, and the image service sees very little usage we have decided to remove it from Astro.

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

- [#367](https://github.com/withastro/adapters/pull/367) [`e02b54a`](https://github.com/withastro/adapters/commit/e02b54ad864ea25cb972f6196496b5aee36a47a3) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Deprecates the `functionPerRoute` option

  This option is now deprecated, and will be removed entirely in Astro v5.0. We suggest removing this option from your configuration as soon as you are able to:

  ```diff
  import { defineConfig } from 'astro/config';
  import vercel from '@astrojs/vercel/serverless';

  export default defineConfig({
    // ...
    output: 'server',
    adapter: vercel({
  -     functionPerRoute: true,
    }),
  });
  ```

- [#375](https://github.com/withastro/adapters/pull/375) [`e7881f7`](https://github.com/withastro/adapters/commit/e7881f7928c6ca62d43c763033f9ed065a907f3b) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code to works with Astro 5 changes to hybrid rendering. No changes are necessary to your project, apart from using Astro 5

- [#397](https://github.com/withastro/adapters/pull/397) [`776a266`](https://github.com/withastro/adapters/commit/776a26670cf483e37ec0e6eba27a0bde09db0146) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

- [#392](https://github.com/withastro/adapters/pull/392) [`3a49eb7`](https://github.com/withastro/adapters/commit/3a49eb7802c44212ccfab06034b7dc5f2b060e94) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updates internal code for Astro 5 changes. No changes is required to your project, apart from using Astro 5

### Minor Changes

- [#385](https://github.com/withastro/adapters/pull/385) [`bb725b7`](https://github.com/withastro/adapters/commit/bb725b7a430a01a3cd197e3e84381be4fa0c945c) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Cleans up `astro:env` support

## 5.5.4

### Patch Changes

- [#413](https://github.com/withastro/adapters/pull/413) [`1b18e67`](https://github.com/withastro/adapters/commit/1b18e671a689b67bde20fdc7fb8cf1d6283e4ec9) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes `context.rewrite` in edge middleware

## 5.5.3

### Patch Changes

- [#388](https://github.com/withastro/adapters/pull/388) [`3f280f1`](https://github.com/withastro/adapters/commit/3f280f113ce768b1c27a2e3cfb36cbc4c43bafa7) Thanks [@hrishikesh-k](https://github.com/hrishikesh-k)! - Allows `-` in hostnames for Netlify Image CDN RegEx

## 5.5.2

### Patch Changes

- [#381](https://github.com/withastro/adapters/pull/381) [`46fbb26`](https://github.com/withastro/adapters/commit/46fbb26175ab09d12f95dba63cfe76bdcc25ef59) Thanks [@matthewp](https://github.com/matthewp)! - Prevent crawling for dependencies outside of the workspace root

## 5.5.1

### Patch Changes

- [#350](https://github.com/withastro/adapters/pull/350) [`2248bc7`](https://github.com/withastro/adapters/commit/2248bc7edcbe37e4e75f573f88a200c2ba5afbae) Thanks [@matthewp](https://github.com/matthewp)! - Apply polyfills immediately on function execution

  This moves up when the polyfills are applied so that they are present before Astro runs, preventing a race condition that can cause `crypto` to not be defined early enough in Node 18.

## 5.5.0

### Minor Changes

- [#326](https://github.com/withastro/adapters/pull/326) [`6dd65a0`](https://github.com/withastro/adapters/commit/6dd65a04c2afea941da34a1a1ce7b991f0768615) Thanks [@ascorbic](https://github.com/ascorbic)! - Sets immutable cache headers for static assets

## 5.4.0

### Minor Changes

- [#315](https://github.com/withastro/adapters/pull/315) [`a45eb36`](https://github.com/withastro/adapters/commit/a45eb365c609bbc1b9ca480c0e49da9cced682aa) Thanks [@eduardoboucas](https://github.com/eduardoboucas)! - Refactors the adapter to use the Netlify Frameworks API

### Patch Changes

- [#286](https://github.com/withastro/adapters/pull/286) [`e2ecf64`](https://github.com/withastro/adapters/commit/e2ecf646f9eefb64c23012598501d8de69dca285) Thanks [@theoephraim](https://github.com/theoephraim)! - Allows support for `node:` prefixed imports if using the Adapter with `edgeMiddleware: true`

## 5.3.5

### Patch Changes

- [#316](https://github.com/withastro/adapters/pull/316) [`d81806a`](https://github.com/withastro/adapters/commit/d81806a94a9bb5242b38c75bc173c17075fd3a41) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes a regression where edge middleware tried to bundle node builtins

## 5.3.4

### Patch Changes

- [#313](https://github.com/withastro/adapters/pull/313) [`55a3e1a`](https://github.com/withastro/adapters/commit/55a3e1a4356c87f86ae60990a87c6a055f217efb) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes an issue where files were not included in the SSR function when built in a monorepo

## 5.3.3

### Patch Changes

- [#296](https://github.com/withastro/adapters/pull/296) [`8a00cad`](https://github.com/withastro/adapters/commit/8a00cad52a94ba75feab3b42e702896f0bc8872e) Thanks [@ascorbic](https://github.com/ascorbic)! - Improves performance for serverless function builds by not bundling dependencies

## 5.3.2

### Patch Changes

- [#293](https://github.com/withastro/adapters/pull/293) [`ee840fa`](https://github.com/withastro/adapters/commit/ee840fa52ce86c2409e5199fb10d600285fb95ae) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Fixes `astro:env` getSecret compatibility

## 5.3.1

### Patch Changes

- [#282](https://github.com/withastro/adapters/pull/282) [`65337f3`](https://github.com/withastro/adapters/commit/65337f3aa67a1f2a40ea8c20a6fcc462e8cbfe94) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Fixes backwards compatibility with Astro <= 4.9

## 5.3.0

### Minor Changes

- [#275](https://github.com/withastro/adapters/pull/275) [`4a28bf6`](https://github.com/withastro/adapters/commit/4a28bf6cac7bd7e455551a91e40792f0737e87da) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Adds support for experimental `astro:env` released in Astro 4.10

## 5.2.1

### Patch Changes

- [#255](https://github.com/withastro/adapters/pull/255) [`3fa962d`](https://github.com/withastro/adapters/commit/3fa962db8f4437df9f1bba5b5ff8ea7b280a6924) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes an issue with edge middleware where `process.env` was not defined, by using a polyfill to shim it

## 5.2.0

### Minor Changes

- [#187](https://github.com/withastro/adapters/pull/187) [`79ebfa4c9e2f84309edb35481ad9cd1f3c7e5eb4`](https://github.com/withastro/adapters/commit/79ebfa4c9e2f84309edb35481ad9cd1f3c7e5eb4) Thanks [@ascorbic](https://github.com/ascorbic)! - Adds support for `image.remotePatterns` and `images.domains` with Netlify Image CDN

## 5.1.3

### Patch Changes

- [#163](https://github.com/withastro/adapters/pull/163) [`bc9ee99c7333ae29e4d4184059c09650330fd0d9`](https://github.com/withastro/adapters/commit/bc9ee99c7333ae29e4d4184059c09650330fd0d9) Thanks [@OiYouYeahYou](https://github.com/OiYouYeahYou)! - Fixes an issue where some astro CLI commands failed with `crypto is not defined` on Astro 4.4.0 and earlier.

## 5.1.2

### Patch Changes

- [#160](https://github.com/withastro/adapters/pull/160) [`994985547c2d2bc8c66b76f996257e68f8187a14`](https://github.com/withastro/adapters/commit/994985547c2d2bc8c66b76f996257e68f8187a14) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where enabling `edgeMiddleware` failed to bundle a dependency (`cssesc`) introduced in Astro 4.2.5.

## 5.1.1

### Patch Changes

- [#162](https://github.com/withastro/adapters/pull/162) [`07217c07e89d4596b464d05c4873e7039aa616f4`](https://github.com/withastro/adapters/commit/07217c07e89d4596b464d05c4873e7039aa616f4) Thanks [@Skn0tt](https://github.com/Skn0tt)! - Fixes bug where prerendered 404 pages were served as `text/plain` instead of `text/html` for hybrid/server apps, leading to browsers displaying source code instead of rendering it

## 5.1.0

### Minor Changes

- [#152](https://github.com/withastro/adapters/pull/152) [`816bdc42e0665904e418dd0137bd6a7c8c74307f`](https://github.com/withastro/adapters/commit/816bdc42e0665904e418dd0137bd6a7c8c74307f) Thanks [@lilnasy](https://github.com/lilnasy)! - Implements verification for edge middleware. This is a security measure to ensure that your serverless functions are only ever called by your edge middleware and not by a third party.

  When `edgeMiddleware` is enabled, the serverless function will now respond with `403 Forbidden` for requests that are not verified to have come from the generated edge middleware. No user action is necessary.

## 5.0.1

### Patch Changes

- [#143](https://github.com/withastro/adapters/pull/143) [`06bae52f26d1df1368581aa859f332141db00c1b`](https://github.com/withastro/adapters/commit/06bae52f26d1df1368581aa859f332141db00c1b) Thanks [@Skn0tt](https://github.com/Skn0tt)! - Fixes a bug in the Netlify Adapter where prerendered 404.astro pages weren't shown on hybrid/server deployments.

## 5.0.0

### Major Changes

- [#130](https://github.com/withastro/adapters/pull/130) [`2b5aaa4cfeda4bc7f1bf8db6210162c495866a95`](https://github.com/withastro/adapters/commit/2b5aaa4cfeda4bc7f1bf8db6210162c495866a95) Thanks [@asdfjkalsdfla](https://github.com/asdfjkalsdfla)! - Updates the internals of the integration to support Astro 4.0. See this [upstream pull request](https://github.com/withastro/astro/pull/9199) for additional details. **Warning:** Make sure to upgrade your Astro version to `>4.2` as previous versions are no longer supported.

## 4.1.1

### Patch Changes

- [#127](https://github.com/withastro/adapters/pull/127) [`36434f0c631cb963c748a11679cf7a96cd605d8e`](https://github.com/withastro/adapters/commit/36434f0c631cb963c748a11679cf7a96cd605d8e) Thanks [@Skn0tt](https://github.com/Skn0tt)! - Updates the behavior of the `cacheOnDemandPages` setting to only cache GET/HEAD requests by default

## 4.1.0

### Minor Changes

- [#120](https://github.com/withastro/adapters/pull/120) [`cf39b9d`](https://github.com/withastro/adapters/commit/cf39b9ddb3c3f7db563c67ac9a6e88857862b694) Thanks [@Skn0tt](https://github.com/Skn0tt)! - Adds opt-out option for Image CDN.

## 4.0.2

### Patch Changes

- [#117](https://github.com/withastro/adapters/pull/117) [`89f7c01`](https://github.com/withastro/adapters/commit/89f7c017e2190c288d257560d1cb2cf8cca8f2cb) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Updates Netlify README.md

## 4.0.1

### Patch Changes

- [#105](https://github.com/withastro/adapters/pull/105) [`755058d`](https://github.com/withastro/adapters/commit/755058d447478c4a390bf86e8c83cb3a25b7cb28) Thanks [@Skn0tt](https://github.com/Skn0tt)! - fix crash when reading package.json version field

## 4.0.0

### Major Changes

- [#84](https://github.com/withastro/adapters/pull/84) [`ca64544`](https://github.com/withastro/adapters/commit/ca645447402316963bcc1181292baea58b8e3bff) Thanks [@Skn0tt](https://github.com/Skn0tt)! - # Netlify Adapter v4 simplifies static + SSR deployments

  This update is a complete overhaul of the Netlify adapter.
  It simplifies the user-facing config, and resolves a number of bugs along the way.

  Here's what changes:

  ## Netlify Context is automatically available via Locals

  In v3, you could use `netlify-edge-middleware.ts` to inject data from the Netlify context into your Astro locals.
  In v4, this file is no longer needed because the Netlify context is automatically made available via `Astro.locals.netlify.context`.
  You can use this context to access information about the user (like geolocation or IP address), your Netlify site (like deploy ID) or the request (like its request ID or the CDN region it's served from).

  **Action Required:**
  Remove the `netlify-edge-middleware.ts` or `netlify-edge-middleware.js` file.
  In your codebase, change all usage of locals injected through that file to use `Astro.locals.netlify.context` instead.

  ### Image CDN

  v4 of this adapter integrates your Astro site with Netlify [Image CDN](https://docs.netlify.com/image-cdn/overview/).
  This allows transforming images on-the-fly without impacting build times.
  It's implemented using an [Astro Image Service](https://docs.astro.build/en/reference/image-service-reference/), and enabled by default.

  ## Replacement for On-Demand Builders

  On-Demand Builders (ODB) allows SSR-Rendered pages to be cached using a Time to Live (TTL) strategy.
  While the Netlify platform continues to support existing pages with ODBs, we now recommend using the much more powerful
  [Fine-Grained Cache Control](https://www.netlify.com/blog/swr-and-fine-grained-cache-control) going forward.

  In v3, you could deploy your SSR-Rendered Astro pages to ODBs by enabling the `builders` config option,
  and then specifying the TTL on a per-page basis.
  In v4, a new `cacheOnDemandPages` option replaces this config option. Take a look at the README to learn more about this.

  **Action Required:**
  Replace the `builders` config option with `cacheOnDemandPages`.

  ```diff lang="ts"
  // astro.config.mjs
  export default defineConfig({
    // ...
    adapter: netlify({
  -   builders: true
  +   cacheOnDemandPages: true
    }),
  });
  ```

  ## `functionPerRoute` was removed

  In v3, the `functionPerRoute` option allowed the SSR routes to be split up into multiple Netlify Functions.
  This reduced the bundle sizes of each individual function, with the intention of speeding up code parsing, and therefore the time of cold starts.
  In practice, this benefit is often nullified by the increase in number of cold starts - more handlers means fewer requests per handler, means more cold starts.

  In v4, support for this deployment mode was removed.

  **Action Required:**
  Remove the `functionPerRoute` field from your config.

  ## `binaryMediaTypes` was removed

  `binaryMediaTypes` was a workaround required for some Astro endpoints, because v3 deployed those as "old" Netlify Functions (now referred to as ["Lambda Compatibility Mode"](https://docs.netlify.com/functions/lambda-compatibility)).
  v4 uses the new [Netlify Functions 2.0](https://www.netlify.com/blog/introducing-netlify-functions-2-0/), which simply doesn't need this workaround anymore - so we're removing it 🎉

  **Action Required:**
  Remove the `binaryMediaTypes` field from your config.

## 3.1.1

### Patch Changes

- [#100](https://github.com/withastro/adapters/pull/100) [`1195955`](https://github.com/withastro/adapters/commit/11959551105aa1776eb58a015e0694960f128537) Thanks [@Jinksi](https://github.com/Jinksi)! - Fixes a typo for the peerDependency range in package.json, which prevents upgrade to Astro 4.0.

## 3.1.0

### Minor Changes

- [#96](https://github.com/withastro/adapters/pull/96) [`f1df277`](https://github.com/withastro/adapters/commit/f1df27740b5c185e28ad73a810bb5dad6bb1e8cd) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Fixes an issue where this package could not be installed alongside Astro 4.0.

## 3.0.4

### Patch Changes

- [#51](https://github.com/withastro/adapters/pull/51) [`acf4c82`](https://github.com/withastro/adapters/commit/acf4c824f8e066d25d94ddf59a486083586567c4) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Updates dependencies

## 3.0.3

### Patch Changes

- [#21](https://github.com/withastro/adapters/pull/21) [`09d2504`](https://github.com/withastro/adapters/commit/09d25043125250e65ccb59549f527d5d876c3a06) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Updates repository information

## 3.0.2

### Patch Changes

- [#8661](https://github.com/withastro/astro/pull/8661) [`008f7647c`](https://github.com/withastro/astro/commit/008f7647c4788207aab55ab12c734bd80e6df9c5) Thanks [@Skn0tt](https://github.com/Skn0tt)! - fix build failures because of CJS builds and top-level await

- Updated dependencies [[`69fbf95b2`](https://github.com/withastro/astro/commit/69fbf95b22c0fb0d8e7e5fef9ec61e26cac9767f)]:
  - astro@3.1.4
  - @astrojs/underscore-redirects@0.3.0

## 3.0.1

### Patch Changes

- [#8346](https://github.com/withastro/astro/pull/8346) [`b74dacdb6`](https://github.com/withastro/astro/commit/b74dacdb6a49755f979f15091355f06bd6bd64bf) Thanks [@delucis](https://github.com/delucis)! - Update README

- Updated dependencies [[`c5633434f`](https://github.com/withastro/astro/commit/c5633434f02cc477ee8da380e22efaccfa55d459), [`405ad9501`](https://github.com/withastro/astro/commit/405ad950173dadddc519cf1c2e7f2523bf5326a8), [`6b1e79814`](https://github.com/withastro/astro/commit/6b1e7981469d30aa4c3658487abed6ffea94797f)]:
  - astro@3.0.7
  - @astrojs/underscore-redirects@0.3.0

## 3.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8188](https://github.com/withastro/astro/pull/8188) [`7511a4980`](https://github.com/withastro/astro/commit/7511a4980fd36536464c317de33a5190427f430a) Thanks [@ematipico](https://github.com/ematipico)! - When using an adapter that supports neither Squoosh or Sharp, Astro will now automatically use an image service that does not support processing, but still provides the other benefits of `astro:assets` such as enforcing `alt`, no CLS etc to users

- [#8188](https://github.com/withastro/astro/pull/8188) [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc) Thanks [@ematipico](https://github.com/ematipico)! - Reduced the amount of polyfills provided by Astro. Astro will no longer provide (no-op) polyfills for several web apis such as HTMLElement, Image or Document. If you need access to those APIs on the server, we recommend using more proper polyfills available on npm.

- [#8029](https://github.com/withastro/astro/pull/8029) [`2ee418e06`](https://github.com/withastro/astro/commit/2ee418e06ab1f7855dee0078afbad0b06de3b183) Thanks [@matthewp](https://github.com/matthewp)! - Remove the Netlify Edge adapter

  `@astrojs/netlify/functions` now supports Edge middleware, so a separate adapter for Edge itself (deploying your entire app to the edge) is no longer necessary. Please update your Astro config to reflect this change:

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  - import netlify from '@astrojs/netlify/edge';
  + import netlify from '@astrojs/netlify/functions';

  export default defineConfig({
   output: 'server',
   adapter: netlify({
  +    edgeMiddleware: true
   }),
  });
  ```

  This adapter had several known limitations and compatibility issues that prevented many people from using it in production. To reduce maintenance costs and because we have a better story with Serveless + Edge Middleware, we are removing the Edge adapter.

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

- [#8188](https://github.com/withastro/astro/pull/8188) [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923) Thanks [@ematipico](https://github.com/ematipico)! - The `build.split` and `build.excludeMiddleware` configuration options are deprecated and have been replaced by options in the adapter config.

  If your config includes the `build.excludeMiddleware` option, replace it with `edgeMiddleware` in your adapter options:

  ```diff
  import { defineConfig } from "astro/config";
  import netlify from "@astrojs/netlify/functions";

  export default defineConfig({
       build: {
  -        excludeMiddleware: true
       },
       adapter: netlify({
  +        edgeMiddleware: true
       }),
  });
  ```

  If your config includes the `build.split` option, replace it with `functionPerRoute` in your adapter options:

  ```diff
  import { defineConfig } from "astro/config";
  import netlify from "@astrojs/netlify/functions";

  export default defineConfig({
       build: {
  -        split: true
       },
       adapter: netlify({
  +        functionPerRoute: true
       }),
  });
  ```

### Patch Changes

- Updated dependencies [[`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312), [`db39206cb`](https://github.com/withastro/astro/commit/db39206cbb85b034859ac416179f141184bb2bff), [`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`0c7b42dc6`](https://github.com/withastro/astro/commit/0c7b42dc6780e687e416137539f55a3a427d1d10), [`46c4c0e05`](https://github.com/withastro/astro/commit/46c4c0e053f830585b9ef229ce1c259df00a80f8), [`364d861bd`](https://github.com/withastro/astro/commit/364d861bd527b8511968e2837728148f090bedef), [`2484dc408`](https://github.com/withastro/astro/commit/2484dc4080e5cd84b9a53648a1de426d7c907be2), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`c2c71d90c`](https://github.com/withastro/astro/commit/c2c71d90c264a2524f99e0373ab59015f23ad4b1), [`cd2d7e769`](https://github.com/withastro/astro/commit/cd2d7e76981ef9b9013453aa2629838e1e9fd422), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`e45f30293`](https://github.com/withastro/astro/commit/e45f3029340db718b6ed7e91b5d14f5cf14cd71d), [`c0de7a7b0`](https://github.com/withastro/astro/commit/c0de7a7b0f042cd49cbea4f4ac1b2ab6f9fef644), [`65c354969`](https://github.com/withastro/astro/commit/65c354969e6fe0ef6d622e8f4c545e2f717ce8c6), [`3c3100851`](https://github.com/withastro/astro/commit/3c31008519ce68b5b1b1cb23b71fbe0a2d506882), [`34cb20021`](https://github.com/withastro/astro/commit/34cb2002161ba88df6bcb72fecfd12ed867c134b), [`a824863ab`](https://github.com/withastro/astro/commit/a824863ab1c451f4068eac54f28dd240573e1cba), [`44f7a2872`](https://github.com/withastro/astro/commit/44f7a28728c56c04ac377b6e917329f324874043), [`1048aca55`](https://github.com/withastro/astro/commit/1048aca550769415e528016e42b358ffbfd44b61), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`9e021a91c`](https://github.com/withastro/astro/commit/9e021a91c57d10809f588dd47968fc0e7f8b4d5c), [`7511a4980`](https://github.com/withastro/astro/commit/7511a4980fd36536464c317de33a5190427f430a), [`c37632a20`](https://github.com/withastro/astro/commit/c37632a20d06164fb97a4c2fc48df6d960398832), [`acf652fc1`](https://github.com/withastro/astro/commit/acf652fc1d5db166231e87e22d0d50444f5556d8), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`8450379db`](https://github.com/withastro/astro/commit/8450379db854fb1eaa9f38f21d65db240bc616cd), [`dbc97b121`](https://github.com/withastro/astro/commit/dbc97b121f42583728f1cdfdbf14575fda943f5b), [`7d2f311d4`](https://github.com/withastro/astro/commit/7d2f311d428e3d1c8c13b9bf2a708d6435713fc2), [`2540feedb`](https://github.com/withastro/astro/commit/2540feedb06785d5a20eecc3668849f147d778d4), [`ea7ff5177`](https://github.com/withastro/astro/commit/ea7ff5177dbcd7b2508cb1eef1b22b8ee1f47079), [`68efd4a8b`](https://github.com/withastro/astro/commit/68efd4a8b29f248397667801465b3152dc98e9a7), [`7bd1b86f8`](https://github.com/withastro/astro/commit/7bd1b86f85c06fdde0a1ed9146d01bac69990671), [`036388f66`](https://github.com/withastro/astro/commit/036388f66dab68ad54b895ed86f9176958dd83c8), [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae), [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`a8f35777e`](https://github.com/withastro/astro/commit/a8f35777e7e322068a4e2f520c2c9e43ade19e58), [`70f34f5a3`](https://github.com/withastro/astro/commit/70f34f5a355f42526ee9e5355f3de8e510002ea2), [`5208a3c8f`](https://github.com/withastro/astro/commit/5208a3c8fefcec7694857fb344af351f4631fc34), [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`ffc9e2d3d`](https://github.com/withastro/astro/commit/ffc9e2d3de46049bf3d82140ef018f524fb03187), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`0f637c71e`](https://github.com/withastro/astro/commit/0f637c71e511cb4c51712128d217a26c8eee4d40), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`8a5b0c1f3`](https://github.com/withastro/astro/commit/8a5b0c1f3a4be6bb62db66ec70144109ff5b4c59), [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`632579dc2`](https://github.com/withastro/astro/commit/632579dc2094cc342929261c89e689f0dd358284), [`3674584e0`](https://github.com/withastro/astro/commit/3674584e02b161a698b429ceb66723918fdc56ac), [`1db4e92c1`](https://github.com/withastro/astro/commit/1db4e92c12ed73681217f5cefd39f2f47542f961), [`e7f872e91`](https://github.com/withastro/astro/commit/e7f872e91e852b901cf221a5151077dec64305bf), [`16f09dfff`](https://github.com/withastro/astro/commit/16f09dfff7722fda99dd0412e3006a7a39c80829), [`4477bb41c`](https://github.com/withastro/astro/commit/4477bb41c8ed688785c545731ef5b184b629f4e5), [`55c10d1d5`](https://github.com/withastro/astro/commit/55c10d1d564e805efc3c1a7c48e0d9a1cdf0c7ed), [`3e834293d`](https://github.com/withastro/astro/commit/3e834293d47ab2761a7aa013916e8371871efb7f), [`96beb883a`](https://github.com/withastro/astro/commit/96beb883ad87f8bbf5b2f57e14a743763d2a6f58), [`997a0db8a`](https://github.com/withastro/astro/commit/997a0db8a4e3851edd69384cf5eadbb969e1d547), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`0f0625504`](https://github.com/withastro/astro/commit/0f0625504145f18cba7dc6cf20291cb2abddc5a9), [`e1ae56e72`](https://github.com/withastro/astro/commit/e1ae56e724d0f83db1230359e06cd6bc26f5fa26), [`f32d093a2`](https://github.com/withastro/astro/commit/f32d093a280faafff024228c12bb438156ec34d7), [`f01eb585e`](https://github.com/withastro/astro/commit/f01eb585e7c972d940761309b1595f682b6922d2), [`b76c166bd`](https://github.com/withastro/astro/commit/b76c166bdd8e28683f62806aef968d1e0c3b06d9), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`866ed4098`](https://github.com/withastro/astro/commit/866ed4098edffb052239cdb26e076cf8db61b1d9), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf), [`32669cd47`](https://github.com/withastro/astro/commit/32669cd47555e9c7433c3998a2b6e624dfb2d8e9)]:
  - astro@3.0.0
  - @astrojs/underscore-redirects@0.3.0

## 3.0.0-rc.2

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

### Patch Changes

- Updated dependencies [[`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`582132328`](https://github.com/withastro/astro/commit/5821323285646aee7ff9194a505f708028e4db57), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`95120efbe`](https://github.com/withastro/astro/commit/95120efbe817163663492181cbeb225849354493), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`179796405`](https://github.com/withastro/astro/commit/179796405e053b559d83f84507e5a465861a029a), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf)]:
  - astro@3.0.0-rc.5
  - @astrojs/underscore-redirects@0.3.0-rc.1

## 3.0.0-beta.1

### Major Changes

- [#8029](https://github.com/withastro/astro/pull/8029) [`2ee418e06`](https://github.com/withastro/astro/commit/2ee418e06ab1f7855dee0078afbad0b06de3b183) Thanks [@matthewp](https://github.com/matthewp)! - Remove the Netlify Edge adapter

  `@astrojs/netlify/functions` now supports Edge middleware, so a separate adapter for Edge itself (deploying your entire app to the edge) is no longer necessary. Please update your Astro config to reflect this change:

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  - import netlify from '@astrojs/netlify/edge';
  + import netlify from '@astrojs/netlify/functions';

  export default defineConfig({
   output: 'server',
   adapter: netlify({
  +    edgeMiddleware: true
   }),
  });
  ```

  This adapter had several known limitations and compatibility issues that prevented many people from using it in production. To reduce maintenance costs and because we have a better story with Serveless + Edge Middleware, we are removing the Edge adapter.

### Patch Changes

- Updated dependencies [[`65c354969`](https://github.com/withastro/astro/commit/65c354969e6fe0ef6d622e8f4c545e2f717ce8c6), [`3c3100851`](https://github.com/withastro/astro/commit/3c31008519ce68b5b1b1cb23b71fbe0a2d506882), [`34cb20021`](https://github.com/withastro/astro/commit/34cb2002161ba88df6bcb72fecfd12ed867c134b), [`7bd1b86f8`](https://github.com/withastro/astro/commit/7bd1b86f85c06fdde0a1ed9146d01bac69990671), [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae), [`70f34f5a3`](https://github.com/withastro/astro/commit/70f34f5a355f42526ee9e5355f3de8e510002ea2), [`0f637c71e`](https://github.com/withastro/astro/commit/0f637c71e511cb4c51712128d217a26c8eee4d40), [`866ed4098`](https://github.com/withastro/astro/commit/866ed4098edffb052239cdb26e076cf8db61b1d9), [`5b1e39ef6`](https://github.com/withastro/astro/commit/5b1e39ef6ec6dcebea96584f95d9530bd9aa715d)]:
  - astro@3.0.0-beta.1
  - @astrojs/underscore-redirects@0.3.0-beta.0

## 3.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [`c022a4217`](https://github.com/withastro/astro/commit/c022a4217a805d223c1494e9eda4e48bbf810388) Thanks [@Princesseuh](https://github.com/Princesseuh)! - When using an adapter that supports neither Squoosh or Sharp, Astro will now automatically use an image service that does not support processing, but still provides the other benefits of `astro:assets` such as enforcing `alt`, no CLS etc to users

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

- [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769) Thanks [@ematipico](https://github.com/ematipico)! - The `build.split` and `build.excludeMiddleware` configuration options are deprecated and have been replaced by options in the adapter config.

  If your config includes the `build.excludeMiddleware` option, replace it with `edgeMiddleware` in your adapter options:

  ```diff
  import { defineConfig } from "astro/config";
  import netlify from "@astrojs/netlify/functions";

  export default defineConfig({
       build: {
  -        excludeMiddleware: true
       },
       adapter: netlify({
  +        edgeMiddleware: true
       }),
  });
  ```

  If your config includes the `build.split` option, replace it with `functionPerRoute` in your adapter options:

  ```diff
  import { defineConfig } from "astro/config";
  import netlify from "@astrojs/netlify/functions";

  export default defineConfig({
       build: {
  -        split: true
       },
       adapter: netlify({
  +        functionPerRoute: true
       }),
  });
  ```

### Patch Changes

- Updated dependencies [[`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81), [`76ddef19c`](https://github.com/withastro/astro/commit/76ddef19ccab6e5f7d3a5740cd41acf10e334b38), [`9b4f70a62`](https://github.com/withastro/astro/commit/9b4f70a629f55e461759ba46f68af7097a2e9215), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`2f951cd40`](https://github.com/withastro/astro/commit/2f951cd403dfcc2c3ca6aae618ae3e1409516e32), [`c022a4217`](https://github.com/withastro/astro/commit/c022a4217a805d223c1494e9eda4e48bbf810388), [`67becaa58`](https://github.com/withastro/astro/commit/67becaa580b8f787df58de66b7008b7098f1209c), [`bc37331d8`](https://github.com/withastro/astro/commit/bc37331d8154e3e95a8df9131e4e014e78a7a9e7), [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8), [`3dc1ca2fa`](https://github.com/withastro/astro/commit/3dc1ca2fac8d9965cc5085a5d09e72ed87b4281a), [`1be84dfee`](https://github.com/withastro/astro/commit/1be84dfee3ce8e6f5cc624f99aec4e980f6fde37), [`35f01df79`](https://github.com/withastro/astro/commit/35f01df797d23315f2bee2fc3fd795adb0559c58), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`78de801f2`](https://github.com/withastro/astro/commit/78de801f21fd4ca1653950027d953bf08614566b), [`59d6e569f`](https://github.com/withastro/astro/commit/59d6e569f63e175c97e82e94aa7974febfb76f7c), [`7723c4cc9`](https://github.com/withastro/astro/commit/7723c4cc93298c2e6530e55da7afda048f22cf81), [`fb5cd6b56`](https://github.com/withastro/astro/commit/fb5cd6b56dc27a71366ed5e1ab8bfe9b8f96bac5), [`631b9c410`](https://github.com/withastro/astro/commit/631b9c410d5d66fa384674027ba95d69ebb5063f)]:
  - astro@3.0.0-beta.0
  - @astrojs/underscore-redirects@0.3.0-beta.0

## 2.6.0

### Minor Changes

- [#7975](https://github.com/withastro/astro/pull/7975) [`f974c95a2`](https://github.com/withastro/astro/commit/f974c95a27ccbf91adbc66f6f1433f4cf11be33e) Thanks [@lilnasy](https://github.com/lilnasy)! - If you are using Netlify's On-demand Builders, you can now specify how long your pages should remain cached. By default, all pages will be rendered on first visit and reused on every subsequent visit until a redeploy. To set a custom revalidation time, call the `runtime.setBuildersTtl()` local in either your frontmatter or middleware.

  ```astro
  ---
  import Layout from '../components/Layout.astro';

  if (import.meta.env.PROD) {
    // revalidates every 45 seconds
    Astro.locals.runtime.setBuildersTtl(45);
  }
  ---

  <Layout title="Astro on Netlify">
    {new Date(Date.now())}
  </Layout>
  ```

### Patch Changes

- Updated dependencies [[`1b8d30209`](https://github.com/withastro/astro/commit/1b8d3020990130dabfaaf753db73a32c6e0c896a), [`405913cdf`](https://github.com/withastro/astro/commit/405913cdf20b26407aa351c090f0a0859a4e6f54), [`87d4b1843`](https://github.com/withastro/astro/commit/87d4b18437c7565c48cad4bea81831c2a244ebb8), [`c23377caa`](https://github.com/withastro/astro/commit/c23377caafbc75deb91c33b9678c1b6868ad40ea), [`86bee2812`](https://github.com/withastro/astro/commit/86bee2812185df6e14025e5962a335f51853587b)]:
  - astro@2.10.6

## 2.5.2

### Patch Changes

- [#7862](https://github.com/withastro/astro/pull/7862) [`1859960d0`](https://github.com/withastro/astro/commit/1859960d0443cc6638569408282544f37e0a90ae) Thanks [@Yan-Thomas](https://github.com/Yan-Thomas)! - Fix README GitHub search link

- [#7754](https://github.com/withastro/astro/pull/7754) [`298dbb89f`](https://github.com/withastro/astro/commit/298dbb89f2963a547370b6e65cafd2650fdb1b27) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve `404` behavior for `serverless` and `edge`

- Updated dependencies [[`298dbb89f`](https://github.com/withastro/astro/commit/298dbb89f2963a547370b6e65cafd2650fdb1b27), [`9e2203847`](https://github.com/withastro/astro/commit/9e22038472c8be05ed7a72620534b88324dce793), [`5c5da8d2f`](https://github.com/withastro/astro/commit/5c5da8d2fbb37830f3ee81830d4c9afcd2c1a3e3), [`0b8375fe8`](https://github.com/withastro/astro/commit/0b8375fe82a15bfff3f517f98de6454adb2779f1), [`89d015db6`](https://github.com/withastro/astro/commit/89d015db6ce4d15b5b1140f0eb6bfbef187d6ad7), [`ebf7ebbf7`](https://github.com/withastro/astro/commit/ebf7ebbf7ae767625d736fad327954cfb853837e)]:
  - astro@2.9.7

## 2.5.1

### Patch Changes

- [#7805](https://github.com/withastro/astro/pull/7805) [`42a21b5da`](https://github.com/withastro/astro/commit/42a21b5da631948da4495062a6ef30fbb91abd05) Thanks [@matthewp](https://github.com/matthewp)! - Prevent building .html file redirects in hybrid mode

- Updated dependencies [[`31c4031ba`](https://github.com/withastro/astro/commit/31c4031ba7aea132a861f2465f38a83741f0cd05), [`5161cf919`](https://github.com/withastro/astro/commit/5161cf919c81bd3681af221def0abab7d25abec0), [`59b556232`](https://github.com/withastro/astro/commit/59b556232696d3aba3c2263ea104cd9922085fd2), [`267487e63`](https://github.com/withastro/astro/commit/267487e63ea0a4cfcb771c667a088afb16c62ba6), [`b063a2d8a`](https://github.com/withastro/astro/commit/b063a2d8aeaed18550d148511bfb68f9ba3cdb09), [`d5f526b33`](https://github.com/withastro/astro/commit/d5f526b3397cf24aa06353de2de91b2ba08cd4eb), [`7dbcbc86b`](https://github.com/withastro/astro/commit/7dbcbc86b3bd7e5458570906745364c9399d1a46)]:
  - astro@2.9.4

## 2.5.0

### Minor Changes

- [#7700](https://github.com/withastro/astro/pull/7700) [`a77741d25`](https://github.com/withastro/astro/commit/a77741d25e5d923461026003aba81869833863d4) Thanks [@delucis](https://github.com/delucis)! - When a project uses the new `build.excludeMiddleware` Astro config option, the `@astrojs/netlify/functions` adapter will bundle your middleware to run in a [Netlify Edge Function](https://docs.netlify.com/edge-functions/overview/).

  See the [Netlify adapter documentation](https://docs.astro.build/en/guides/integrations-guide/netlify/#run-middleware-in-edge-functions) for more details.

### Patch Changes

- Updated dependencies [[`72bbfac97`](https://github.com/withastro/astro/commit/72bbfac976c2965a523eea88ff0543e64d848d80), [`d401866f9`](https://github.com/withastro/astro/commit/d401866f93bfe25a50c171bc54b2b1ee0f483cc9), [`4f6b5ae2b`](https://github.com/withastro/astro/commit/4f6b5ae2ba8eb162e03f25cbd600a905d434f529), [`06c255716`](https://github.com/withastro/astro/commit/06c255716ae8e922fb9d4ffa5595cbb34146fff6)]:
  - astro@2.8.5

## 2.4.0

### Minor Changes

- [#7615](https://github.com/withastro/astro/pull/7615) [`f21357b69`](https://github.com/withastro/astro/commit/f21357b69d94fe8d81f267efddb182d1a3cc678a) Thanks [@ematipico](https://github.com/ematipico)! - The Netlify adapter builds to a single function by default. Astro 2.7 added support for splitting your build into separate entry points per page. If you use this configuration, the Netlify adapter will generate a separate function for each page. This can help reduce the size of each function so they are only bundling code used on that page.

  ```js
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  import netlify from '@astrojs/netlify/functions';

  export default defineConfig({
    output: 'server',
    adapter: netlify(),
    build: {
      split: true,
    },
  });
  ```

### Patch Changes

- Updated dependencies [[`f21357b69`](https://github.com/withastro/astro/commit/f21357b69d94fe8d81f267efddb182d1a3cc678a), [`86e19c7cf`](https://github.com/withastro/astro/commit/86e19c7cf8696e065c1ccdc2eb841ad0a2b61ede)]:
  - @astrojs/underscore-redirects@0.2.0
  - astro@2.8.2

## 2.3.0

### Minor Changes

- [#7067](https://github.com/withastro/astro/pull/7067) [`57f8d14c0`](https://github.com/withastro/astro/commit/57f8d14c027c30919363e12c664ccff4ed64d0fc) Thanks [@matthewp](https://github.com/matthewp)! - Support for experimental redirects

  This adds support for the redirects RFC in the Netlify adapter, including a new `@astrojs/netlify/static` adapter for static sites.

  No changes are necessary when using SSR. Simply use configured redirects and the adapter will update your `_redirects` file.

### Patch Changes

- [#7260](https://github.com/withastro/astro/pull/7260) [`39403c32f`](https://github.com/withastro/astro/commit/39403c32faea58399c61d3344b770f195be60d5b) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Unflags support for `output: 'hybrid'` mode, which enables pre-rendering by default. The additional `experimental.hybridOutput` flag can be safely removed from your configuration.

- Updated dependencies [[`57f8d14c0`](https://github.com/withastro/astro/commit/57f8d14c027c30919363e12c664ccff4ed64d0fc), [`414eb19d2`](https://github.com/withastro/astro/commit/414eb19d2fcb55758f9d053076773b11b62f4c97), [`a7e2b37ff`](https://github.com/withastro/astro/commit/a7e2b37ff73871c46895c615846a86a539f45330), [`dd1a6b6c9`](https://github.com/withastro/astro/commit/dd1a6b6c941aeb7af934bd12db22412af262f5a1), [`d72cfa7ca`](https://github.com/withastro/astro/commit/d72cfa7cad758192163712ceb269405659fd14bc), [`144813f73`](https://github.com/withastro/astro/commit/144813f7308dcb9de64ebe3f0f2c6cba9ad81eb1), [`b5213654b`](https://github.com/withastro/astro/commit/b5213654b1b7f3ba573a48d3be688b2bdde7870f), [`e3b8c6296`](https://github.com/withastro/astro/commit/e3b8c62969d680d1915a122c610d281d6711aa63), [`890a2bc98`](https://github.com/withastro/astro/commit/890a2bc9891a2449ab99b01b65468f6dddba6b12), [`39403c32f`](https://github.com/withastro/astro/commit/39403c32faea58399c61d3344b770f195be60d5b), [`101f03209`](https://github.com/withastro/astro/commit/101f032098148b3daaac8d46ff1e535b79232e43)]:
  - astro@2.6.0

## 2.2.3

### Patch Changes

- [#6991](https://github.com/withastro/astro/pull/6991) [`719002ca5`](https://github.com/withastro/astro/commit/719002ca5b128744fb4316d4a52c5dcd46a42759) Thanks [@MoustaphaDev](https://github.com/MoustaphaDev)! - Enable experimental support for hybrid SSR with pre-rendering enabled by default

  **astro.config.mjs**

  ```js
  import { defineConfig } from 'astro/config';
  export defaultdefineConfig({
     output: 'hybrid',
         experimental: {
         hybridOutput: true,
     },
  })
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

## 2.2.2

### Patch Changes

- [#6793](https://github.com/withastro/astro/pull/6793) [`1e3873c04`](https://github.com/withastro/astro/commit/1e3873c04abab6c498c93abc06828ecd235569d4) Thanks [@andremralves](https://github.com/andremralves)! - fix: no edge functions deployed to netlify

## 2.2.1

### Patch Changes

- [#6651](https://github.com/withastro/astro/pull/6651) [`416ceb973`](https://github.com/withastro/astro/commit/416ceb9730ce604cd3f73c22200907d9b9978073) Thanks [@matthewp](https://github.com/matthewp)! - Use Deno API to set Astro.clientAddress in Netlify Edge

- Updated dependencies [[`72fed684a`](https://github.com/withastro/astro/commit/72fed684a35f00d80c69bcf6e8af297fed0294fe), [`45bff6fcc`](https://github.com/withastro/astro/commit/45bff6fccb3f5c71ff24c1ceb48cd532196c90f6), [`52d7a4a01`](https://github.com/withastro/astro/commit/52d7a4a011a3bb722b522fffd88c5fe9a519a196), [`9e88e0f23`](https://github.com/withastro/astro/commit/9e88e0f23c5913c07f7e3e96fa0555219ef710dc), [`fa84f1a7d`](https://github.com/withastro/astro/commit/fa84f1a7d2c290479c75199f16e8de489036d7ea), [`a98f6f418`](https://github.com/withastro/astro/commit/a98f6f418c92261a06ef79624a8c86e288c21eab), [`7f74326b7`](https://github.com/withastro/astro/commit/7f74326b762bfc174ebe8e37ae03733563e4214f)]:
  - astro@2.2.1

## 2.2.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

### Patch Changes

- Updated dependencies [[`fec583909`](https://github.com/withastro/astro/commit/fec583909ab62829dc0c1600e2387979365f2b94), [`b087b83fe`](https://github.com/withastro/astro/commit/b087b83fe266c431fe34a07d5c2293cc4ab011c6), [`694918a56`](https://github.com/withastro/astro/commit/694918a56b01104831296be0c25456135a63c784), [`a20610609`](https://github.com/withastro/astro/commit/a20610609863ae3b48afe96819b8f11ae4f414d5), [`a4a74ab70`](https://github.com/withastro/astro/commit/a4a74ab70cd2aa0d812a1f6b202c4e240a8913bf), [`75921b3cd`](https://github.com/withastro/astro/commit/75921b3cd916d439f6392c487c21532fde35ed13), [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808)]:
  - astro@2.1.0
  - @astrojs/webapi@2.1.0

## 2.1.3

### Patch Changes

- [#6323](https://github.com/withastro/astro/pull/6323) [`5e26bc891`](https://github.com/withastro/astro/commit/5e26bc891cbebb3598acfa760c135a25c548d624) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated Undici to 5.20.0. This fixes a security issue and handling of cookies in certain cases in dev

- [#6317](https://github.com/withastro/astro/pull/6317) [`2eb73cb9d`](https://github.com/withastro/astro/commit/2eb73cb9d1c982df5f8788ddacd634645643c5c6) Thanks [@bluwy](https://github.com/bluwy)! - Use .mjs extension when building to support CJS environments

- Updated dependencies [[`5e26bc891`](https://github.com/withastro/astro/commit/5e26bc891cbebb3598acfa760c135a25c548d624), [`a156ecbb7`](https://github.com/withastro/astro/commit/a156ecbb7f4df6a46124a9a12eb712f9163db2ed), [`ccd72e6bb`](https://github.com/withastro/astro/commit/ccd72e6bb41e570d42b1b158e8124c8e04a1943d), [`504c7bacb`](https://github.com/withastro/astro/commit/504c7bacb8c1f2308a31e6c412825ba34983ba33), [`63dda6ded`](https://github.com/withastro/astro/commit/63dda6dedd4c6ea1d5ce72e9cf3fe5f88339a927), [`f91a7f376`](https://github.com/withastro/astro/commit/f91a7f376c223f18b4d8fbed81f95f6bea1cef8d)]:
  - astro@2.0.15

## 2.1.2

### Patch Changes

- [#6117](https://github.com/withastro/astro/pull/6117) [`32abe49bd`](https://github.com/withastro/astro/commit/32abe49bd073417b480b1b990f432a837c12eb6f) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix polyfills not being available in certain cases

- Updated dependencies [[`f6fc662c3`](https://github.com/withastro/astro/commit/f6fc662c3c59d164584c6287a930fcd1c9086ee6), [`592386b75`](https://github.com/withastro/astro/commit/592386b75541f3b7f7d95c631f86024b7e2d314d), [`1b591a143`](https://github.com/withastro/astro/commit/1b591a1431b44eacd239ed8f76809916cabca1db), [`bf8d7366a`](https://github.com/withastro/astro/commit/bf8d7366acb57e1b21181cc40fff55a821d8119e), [`ec38a8921`](https://github.com/withastro/astro/commit/ec38a8921f02a275949abcababe1b8afdf8184a2), [`f20a85b64`](https://github.com/withastro/astro/commit/f20a85b642994f240d8c94260fc55ffa1fd14294), [`9f22ac3d0`](https://github.com/withastro/astro/commit/9f22ac3d097ef2cb3b2bbe5343b8a8a49d83425d), [`cee70f5c6`](https://github.com/withastro/astro/commit/cee70f5c6ac9b0d2edc1f8a6f8f5043605576026), [`ac7fb04d6`](https://github.com/withastro/astro/commit/ac7fb04d6b162f28a337918138d5737e2c0fffad), [`d1f5611fe`](https://github.com/withastro/astro/commit/d1f5611febfd020cca4078c71bafe599015edd16), [`2189170be`](https://github.com/withastro/astro/commit/2189170be523f74f244e84ccab22c655219773ce), [`32abe49bd`](https://github.com/withastro/astro/commit/32abe49bd073417b480b1b990f432a837c12eb6f)]:
  - astro@2.0.7

## 2.1.1

### Patch Changes

- [#6090](https://github.com/withastro/astro/pull/6090) [`97a97196f`](https://github.com/withastro/astro/commit/97a97196fc4d2dd8ced838ddbca17a587cfa0957) Thanks [@matthewp](https://github.com/matthewp)! - Fix Netlify Function regression

## 2.1.0

### Minor Changes

- [#5874](https://github.com/withastro/astro/pull/5874) [`1c230f103`](https://github.com/withastro/astro/commit/1c230f10373ec392b6cdcd5c196ae932f89033aa) Thanks [@juanmiguelguerrero](https://github.com/juanmiguelguerrero)! - Add `builders` config option for Netlify On-demand Builders.

### Patch Changes

- Updated dependencies [[`b4432cd6b`](https://github.com/withastro/astro/commit/b4432cd6b65bad685a99fe15867710b0663c13b2), [`98a4a914b`](https://github.com/withastro/astro/commit/98a4a914bc47f3da2764b3bdc01577d25fe2e261), [`071e1dee7`](https://github.com/withastro/astro/commit/071e1dee7e1943be67d1ded39a9af1b7a2aafd02), [`322e059d0`](https://github.com/withastro/astro/commit/322e059d0da9ab0d6a546a111fabda755bd5f1b6), [`b994f6f35`](https://github.com/withastro/astro/commit/b994f6f35e29b2d93ff8ddc281a69c0af3cc3edf), [`12c68343c`](https://github.com/withastro/astro/commit/12c68343c0aa891037d39d3c9b9378b004be6642)]:
  - astro@2.0.3

## 2.0.0

### Major Changes

- [#5584](https://github.com/withastro/astro/pull/5584) [`9963c6e4d`](https://github.com/withastro/astro/commit/9963c6e4d50c392c3d1ac4492237020f15ccb1de) & [#5842](https://github.com/withastro/astro/pull/5842) [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481) Thanks [@wulinsheng123](https://github.com/wulinsheng123) and [@natemoo-re](https://github.com/natemoo-re)! - **Breaking Change**: client assets are built to an `_astro` directory in the build output directory. Previously these were built to various locations, including `assets/`, `chunks/` and the root of build output.

  You can control this location with the new `build` configuration option named `assets`.

- [#5707](https://github.com/withastro/astro/pull/5707) [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b) Thanks [@bluwy](https://github.com/bluwy)! - Remove `astro:build:start` backwards compatibility code

- [#5806](https://github.com/withastro/astro/pull/5806) [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53) Thanks [@matthewp](https://github.com/matthewp)! - Make astro a peerDependency of integrations

  This marks `astro` as a peerDependency of several packages that are already getting `major` version bumps. This is so we can more properly track the dependency between them and what version of Astro they are being used with.

### Patch Changes

- [#5768](https://github.com/withastro/astro/pull/5768) [`2f6745019`](https://github.com/withastro/astro/commit/2f6745019ac25785032ac3659c2433b6e224f383) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix set-cookies not working in certain cases when using Node 18+

- [#5904](https://github.com/withastro/astro/pull/5904) [`f5adbd6b5`](https://github.com/withastro/astro/commit/f5adbd6b55ca13a7523dff2cfc5dccdab9980fa7) Thanks [@matthewp](https://github.com/matthewp)! - Support prerender in \_redirects

- [#5885](https://github.com/withastro/astro/pull/5885) [`8f1ae06e5`](https://github.com/withastro/astro/commit/8f1ae06e58f37c7d9e3b9076268b6e91546bdc07) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix issue with prerendered pages when using `edge-functions` adapter

- Updated dependencies [[`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b), [`16dc36a87`](https://github.com/withastro/astro/commit/16dc36a870df47a4151a8ed2d91d0bd1bb812458), [`01f3f463b`](https://github.com/withastro/astro/commit/01f3f463bf2918b310d130a9fabbf3ee21d14029), [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144), [`05caf445d`](https://github.com/withastro/astro/commit/05caf445d4d2728f1010aeb2179a9e756c2fd17d), [`49ab4f231`](https://github.com/withastro/astro/commit/49ab4f231c23b34891c3ee86f4b92bf8d6d267a3), [`a342a486c`](https://github.com/withastro/astro/commit/a342a486c2831461e24e6c2f1ca8a9d3e15477b6), [`8fb28648f`](https://github.com/withastro/astro/commit/8fb28648f66629741cb976bfe34ccd9d8f55661e), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`c2180746b`](https://github.com/withastro/astro/commit/c2180746b4f6d9ef1b6f86924f21f52cc6ab4e63), [`ae8a012a7`](https://github.com/withastro/astro/commit/ae8a012a7b6884a03c50494332ee37b4505c2c3b), [`cf2de5422`](https://github.com/withastro/astro/commit/cf2de5422c26bfdea4c75f76e57b57299ded3e3a), [`ce5c5dbd4`](https://github.com/withastro/astro/commit/ce5c5dbd46afbe738b03600758bf5c35113de522), [`ec09bb664`](https://github.com/withastro/astro/commit/ec09bb6642064dbd7d2f3369afb090363ae18de2), [`665a2c222`](https://github.com/withastro/astro/commit/665a2c2225e42881f5a9550599e8f3fc1deea0b4), [`259a539d7`](https://github.com/withastro/astro/commit/259a539d7d70c783330c797794b15716921629cf), [`f7aa1ec25`](https://github.com/withastro/astro/commit/f7aa1ec25d1584f7abd421903fbef66b1c050e2a), [`4987d6f44`](https://github.com/withastro/astro/commit/4987d6f44cfd0d81d88f21f5c380503403dc1e6a), [`304823811`](https://github.com/withastro/astro/commit/304823811eddd8e72aa1d8e2d39b40ab5cda3565), [`302e0ef8f`](https://github.com/withastro/astro/commit/302e0ef8f5d5232e3348afe680e599f3e537b5c5), [`55cea0a9d`](https://github.com/withastro/astro/commit/55cea0a9d8c8df91a46590fc04a9ac28089b3432), [`dd56c1941`](https://github.com/withastro/astro/commit/dd56c19411b126439b8bc42d681b6fa8c06e8c61), [`9963c6e4d`](https://github.com/withastro/astro/commit/9963c6e4d50c392c3d1ac4492237020f15ccb1de), [`46ecd5de3`](https://github.com/withastro/astro/commit/46ecd5de34df619e2ee73ccea39a57acd37bc0b8), [`be901dc98`](https://github.com/withastro/astro/commit/be901dc98c4a7f6b5536540aa8f7ba5108e939a0), [`f6cf92b48`](https://github.com/withastro/astro/commit/f6cf92b48317a19a3840ad781b77d6d3cae143bb), [`e818cc046`](https://github.com/withastro/astro/commit/e818cc0466a942919ea3c41585e231c8c80cb3d0), [`8c100a6fe`](https://github.com/withastro/astro/commit/8c100a6fe6cc652c3799d1622e12c2c969f30510), [`116d8835c`](https://github.com/withastro/astro/commit/116d8835ca9e78f8b5e477ee5a3d737b69f80706), [`840412128`](https://github.com/withastro/astro/commit/840412128b00a04515156e92c314a929d6b94f6d), [`1f49cddf9`](https://github.com/withastro/astro/commit/1f49cddf9e9ffc651efc171b2cbde9fbe9e8709d), [`7325df412`](https://github.com/withastro/astro/commit/7325df412107fc0e65cd45c1b568fb686708f723), [`16c7d0bfd`](https://github.com/withastro/astro/commit/16c7d0bfd49d2b9bfae45385f506bcd642f9444a), [`c55fbcb8e`](https://github.com/withastro/astro/commit/c55fbcb8edca1fe118a44f68c9f9436a4719d171), [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d), [`2a5786419`](https://github.com/withastro/astro/commit/2a5786419599b8674473c699300172b9aacbae2e), [`4a1cabfe6`](https://github.com/withastro/astro/commit/4a1cabfe6b9ef8a6fbbcc0727a0dc6fa300cedaa), [`a8d3e7924`](https://github.com/withastro/astro/commit/a8d3e79246605d252dcddad159e358e2d79bd624), [`fa8c131f8`](https://github.com/withastro/astro/commit/fa8c131f88ef67d14c62f1c00c97ed74d43a80ac), [`64b8082e7`](https://github.com/withastro/astro/commit/64b8082e776b832f1433ed288e6f7888adb626d0), [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`23dc9ea96`](https://github.com/withastro/astro/commit/23dc9ea96a10343852d965efd41fe6665294f1fb), [`63a6ceb38`](https://github.com/withastro/astro/commit/63a6ceb38d88331451dca64d0034c7c58e3d26f1), [`a3a7fc929`](https://github.com/withastro/astro/commit/a3a7fc9298e6d88abb4b7bee1e58f05fa9558cf1), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`5fd9208d4`](https://github.com/withastro/astro/commit/5fd9208d447f5ab8909a2188b6c2491a0debd49d), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`899214298`](https://github.com/withastro/astro/commit/899214298cee5f0c975c7245e623c649e1842d73), [`3a00ecb3e`](https://github.com/withastro/astro/commit/3a00ecb3eb4bc44be758c064f2bde6e247e8a593), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0), [`1ca81c16b`](https://github.com/withastro/astro/commit/1ca81c16b8b66236e092e6eb6ec3f73f5668421c), [`b66d7195c`](https://github.com/withastro/astro/commit/b66d7195c17a55ea0931bc3744888bd4f5f01ce6)]:
  - astro@2.0.0
  - @astrojs/webapi@2.0.0

## 2.0.0-beta.4

### Patch Changes

- [#5904](https://github.com/withastro/astro/pull/5904) [`f5adbd6b5`](https://github.com/withastro/astro/commit/f5adbd6b55ca13a7523dff2cfc5dccdab9980fa7) Thanks [@matthewp](https://github.com/matthewp)! - Support prerender in \_redirects

- Updated dependencies [[`4987d6f44`](https://github.com/withastro/astro/commit/4987d6f44cfd0d81d88f21f5c380503403dc1e6a), [`304823811`](https://github.com/withastro/astro/commit/304823811eddd8e72aa1d8e2d39b40ab5cda3565), [`46ecd5de3`](https://github.com/withastro/astro/commit/46ecd5de34df619e2ee73ccea39a57acd37bc0b8), [`7325df412`](https://github.com/withastro/astro/commit/7325df412107fc0e65cd45c1b568fb686708f723), [`a8d3e7924`](https://github.com/withastro/astro/commit/a8d3e79246605d252dcddad159e358e2d79bd624), [`5fd9208d4`](https://github.com/withastro/astro/commit/5fd9208d447f5ab8909a2188b6c2491a0debd49d)]:
  - astro@2.0.0-beta.4
  - @astrojs/webapi@2.0.0-beta.1

## 2.0.0-beta.3

### Patch Changes

- [#5885](https://github.com/withastro/astro/pull/5885) [`8f1ae06e5`](https://github.com/withastro/astro/commit/8f1ae06e58f37c7d9e3b9076268b6e91546bdc07) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix issue with prerendered pages when using `edge-functions` adapter

- Updated dependencies [[`16dc36a87`](https://github.com/withastro/astro/commit/16dc36a870df47a4151a8ed2d91d0bd1bb812458), [`05caf445d`](https://github.com/withastro/astro/commit/05caf445d4d2728f1010aeb2179a9e756c2fd17d), [`a342a486c`](https://github.com/withastro/astro/commit/a342a486c2831461e24e6c2f1ca8a9d3e15477b6), [`ce5c5dbd4`](https://github.com/withastro/astro/commit/ce5c5dbd46afbe738b03600758bf5c35113de522), [`be901dc98`](https://github.com/withastro/astro/commit/be901dc98c4a7f6b5536540aa8f7ba5108e939a0), [`e818cc046`](https://github.com/withastro/astro/commit/e818cc0466a942919ea3c41585e231c8c80cb3d0), [`8c100a6fe`](https://github.com/withastro/astro/commit/8c100a6fe6cc652c3799d1622e12c2c969f30510), [`64b8082e7`](https://github.com/withastro/astro/commit/64b8082e776b832f1433ed288e6f7888adb626d0), [`899214298`](https://github.com/withastro/astro/commit/899214298cee5f0c975c7245e623c649e1842d73), [`3a00ecb3e`](https://github.com/withastro/astro/commit/3a00ecb3eb4bc44be758c064f2bde6e247e8a593), [`1ca81c16b`](https://github.com/withastro/astro/commit/1ca81c16b8b66236e092e6eb6ec3f73f5668421c), [`b66d7195c`](https://github.com/withastro/astro/commit/b66d7195c17a55ea0931bc3744888bd4f5f01ce6)]:
  - astro@2.0.0-beta.3

## 2.0.0-beta.2

### Major Changes

- [#5842](https://github.com/withastro/astro/pull/5842) [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481) Thanks [@natemoo-re](https://github.com/natemoo-re)! - **Breaking Change**: client assets are built to an `_astro` directory in the build output directory. Previously these were built to various locations, including `assets/`, `chunks/` and the root of build output.

  You can control this location with the new `build` configuration option named `assets`.

- [#5806](https://github.com/withastro/astro/pull/5806) [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53) Thanks [@matthewp](https://github.com/matthewp)! - Make astro a peerDependency of integrations

  This marks `astro` as a peerDependency of several packages that are already getting `major` version bumps. This is so we can more properly track the dependency between them and what version of Astro they are being used with.

### Patch Changes

- Updated dependencies [[`01f3f463b`](https://github.com/withastro/astro/commit/01f3f463bf2918b310d130a9fabbf3ee21d14029), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`c2180746b`](https://github.com/withastro/astro/commit/c2180746b4f6d9ef1b6f86924f21f52cc6ab4e63), [`ae8a012a7`](https://github.com/withastro/astro/commit/ae8a012a7b6884a03c50494332ee37b4505c2c3b), [`cf2de5422`](https://github.com/withastro/astro/commit/cf2de5422c26bfdea4c75f76e57b57299ded3e3a), [`ec09bb664`](https://github.com/withastro/astro/commit/ec09bb6642064dbd7d2f3369afb090363ae18de2), [`665a2c222`](https://github.com/withastro/astro/commit/665a2c2225e42881f5a9550599e8f3fc1deea0b4), [`f7aa1ec25`](https://github.com/withastro/astro/commit/f7aa1ec25d1584f7abd421903fbef66b1c050e2a), [`302e0ef8f`](https://github.com/withastro/astro/commit/302e0ef8f5d5232e3348afe680e599f3e537b5c5), [`840412128`](https://github.com/withastro/astro/commit/840412128b00a04515156e92c314a929d6b94f6d), [`1f49cddf9`](https://github.com/withastro/astro/commit/1f49cddf9e9ffc651efc171b2cbde9fbe9e8709d), [`c55fbcb8e`](https://github.com/withastro/astro/commit/c55fbcb8edca1fe118a44f68c9f9436a4719d171), [`4a1cabfe6`](https://github.com/withastro/astro/commit/4a1cabfe6b9ef8a6fbbcc0727a0dc6fa300cedaa), [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`23dc9ea96`](https://github.com/withastro/astro/commit/23dc9ea96a10343852d965efd41fe6665294f1fb), [`63a6ceb38`](https://github.com/withastro/astro/commit/63a6ceb38d88331451dca64d0034c7c58e3d26f1), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0)]:
  - astro@2.0.0-beta.2
  - @astrojs/webapi@2.0.0-beta.0

## 2.0.0-beta.1

### Patch Changes

- [#5768](https://github.com/withastro/astro/pull/5768) [`2f6745019`](https://github.com/withastro/astro/commit/2f6745019ac25785032ac3659c2433b6e224f383) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix set-cookies not working in certain cases when using Node 18+

## 2.0.0-beta.0

### Major Changes

- [#5707](https://github.com/withastro/astro/pull/5707) [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b) Thanks [@bluwy](https://github.com/bluwy)! - Remove `astro:build:start` backwards compatibility code

## 1.3.0

### Minor Changes

- [#5297](https://github.com/withastro/astro/pull/5297) [`d2960984c`](https://github.com/withastro/astro/commit/d2960984c59af7b60a3ea472c6c58fb00534a8e6) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Introduces the **experimental** Prerender API.

  > **Note**
  > This API is not yet stable and is subject to possible breaking changes!

  - Deploy an Astro server without sacrificing the speed or cacheability of static HTML.
  - The Prerender API allows you to statically prerender specific `pages/` at build time.

  **Usage**

  - First, run `astro build --experimental-prerender` or enable `experimental: { prerender: true }` in your `astro.config.mjs` file.
  - Then, include `export const prerender = true` in any file in the `pages/` directory that you wish to prerender.

## 1.2.2

### Patch Changes

- [#5534](https://github.com/withastro/astro/pull/5534) [`fabd9124b`](https://github.com/withastro/astro/commit/fabd9124bd3e654e885054f30e9c0d01eabf0470) Thanks [@bluwy](https://github.com/bluwy)! - Update esbuild dependency

## 1.2.1

### Patch Changes

- [#5301](https://github.com/withastro/astro/pull/5301) [`a79a37cad`](https://github.com/withastro/astro/commit/a79a37cad549b21f91599ff86899e456d9dcc7df) Thanks [@bluwy](https://github.com/bluwy)! - Fix environment variables usage in edge functions

## 1.2.0

### Minor Changes

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

### Patch Changes

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Add missing dependencies, support strict dependency installation (e.g. pnpm)

## 1.0.4

### Patch Changes

- [#4820](https://github.com/withastro/astro/pull/4820) [`9bfbd63f0`](https://github.com/withastro/astro/commit/9bfbd63f05d21b51f7fd726fc4c16949919529a0) Thanks [@matthewp](https://github.com/matthewp)! - Fix processing of images in Netlify Functions

## 1.0.3

### Patch Changes

- [#4722](https://github.com/withastro/astro/pull/4722) [`4bc70f354`](https://github.com/withastro/astro/commit/4bc70f3545ab950da306de9c5417a08a7532fa28) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix route validation failures on Netlify Edge

## 1.0.2

### Patch Changes

- [#4558](https://github.com/withastro/astro/pull/4558) [`742966456`](https://github.com/withastro/astro/commit/7429664566f05ecebf6d57906f950627e62e690c) Thanks [@tony-sull](https://github.com/tony-sull)! - Adding the `withastro` keyword to include the adapters on the [Integrations Catalog](https://astro.build/integrations)

## 1.0.1

### Patch Changes

- [#4274](https://github.com/withastro/astro/pull/4274) [`d3d09a2c9`](https://github.com/withastro/astro/commit/d3d09a2c9f1af4dc467783c8bf4a71800924d129) Thanks [@matthewp](https://github.com/matthewp)! - Adds 404 routing logic to Netlify redirects file

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

### Patch Changes

- Updated dependencies [[`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308)]:
  - @astrojs/webapi@1.0.0

## 0.5.0

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

* [#4018](https://github.com/withastro/astro/pull/4018) [`0cc6ede36`](https://github.com/withastro/astro/commit/0cc6ede362996b9faba57481a790d6eb7fba2045) Thanks [@okikio](https://github.com/okikio)! - Support for 404 and 500 pages in SSR

- [#3973](https://github.com/withastro/astro/pull/3973) [`5a23483ef`](https://github.com/withastro/astro/commit/5a23483efb3ba614b05a00064f84415620605204) Thanks [@matthewp](https://github.com/matthewp)! - Adds support for Astro.clientAddress

  The new `Astro.clientAddress` property allows you to get the IP address of the requested user.

  ```astro

  ```

  This property is only available when building for SSR, and only if the adapter you are using supports providing the IP address. If you attempt to access the property in a SSG app it will throw an error.

## 0.4.10

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.4.9

### Patch Changes

- [#3865](https://github.com/withastro/astro/pull/3865) [`1f9e4857`](https://github.com/withastro/astro/commit/1f9e4857ff2b2cb7db89d619618cdf546cd3b3dc) Thanks [@delucis](https://github.com/delucis)! - Small README fixes

* [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

## 0.4.8

### Patch Changes

- [#3677](https://github.com/withastro/astro/pull/3677) [`8045c8ad`](https://github.com/withastro/astro/commit/8045c8ade16fe4306448b7f98a4560ef0557d378) Thanks [@Jutanium](https://github.com/Jutanium)! - Update READMEs

## 0.4.7

### Patch Changes

- [#3734](https://github.com/withastro/astro/pull/3734) [`4acd245d`](https://github.com/withastro/astro/commit/4acd245d8f59871eb9c0083ae1a0fe7aa70c84f5) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: append shim to top of built file to avoid "can't read process of undefined" issues

## 0.4.6

### Patch Changes

- [#3673](https://github.com/withastro/astro/pull/3673) [`ba5ad785`](https://github.com/withastro/astro/commit/ba5ad7855c4252e10e76b41b88fd4c74b4b7295b) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix react dependencies to improve test reliability

## 0.4.5

### Patch Changes

- [#3612](https://github.com/withastro/astro/pull/3612) [`fca58cfd`](https://github.com/withastro/astro/commit/fca58cfd91b68501ec82350ab023170b208d8ce7) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: "vpath" import error when building for netlify edge

## 0.4.4

### Patch Changes

- [#3592](https://github.com/withastro/astro/pull/3592) [`0ddcef20`](https://github.com/withastro/astro/commit/0ddcef2043e3c2f65aaeec7a969c374c053e22f3) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds support for base64 encoded responses in Netlify Functions

## 0.4.3

### Patch Changes

- [#3535](https://github.com/withastro/astro/pull/3535) [`f3ab822e`](https://github.com/withastro/astro/commit/f3ab822e328725c3905b0adad9889ad37653c24a) Thanks [@matthewp](https://github.com/matthewp)! - Fixes Netlify Edge Function and Astro.glob

## 0.4.2

### Patch Changes

- [#3503](https://github.com/withastro/astro/pull/3503) [`207f58d1`](https://github.com/withastro/astro/commit/207f58d1715ac024cc7c81b76e26aa49fca5173f) Thanks [@williamtetlow](https://github.com/williamtetlow)! - Alias `from 'astro'` imports to `'@astro/types'`
  Update Deno and Netlify integrations to handle vite.resolves.alias as an array

## 0.4.1

### Patch Changes

- Updated dependencies [[`4de53ecc`](https://github.com/withastro/astro/commit/4de53eccef346bed843b491b7ab93987d7d85655)]:
  - @astrojs/webapi@0.12.0

## 0.4.0

### Minor Changes

- [#3381](https://github.com/withastro/astro/pull/3381) [`43d92227`](https://github.com/withastro/astro/commit/43d922277afaeca9c90364fbf0b19477fd2c6566) Thanks [@sarahetter](https://github.com/sarahetter)! - Updating out directories for Netlify Functions

* [#3377](https://github.com/withastro/astro/pull/3377) [`e1294c42`](https://github.com/withastro/astro/commit/e1294c422b3d3e98ccc745fe95d5672c9a17fe1f) Thanks [@sarahetter](https://github.com/sarahetter)! - Change out directories on dist and serverEntry

## 0.3.4

### Patch Changes

- [#3342](https://github.com/withastro/astro/pull/3342) [`352fc316`](https://github.com/withastro/astro/commit/352fc3166fe3b3d3da3feff621394b20eacb9cc3) Thanks [@thepassle](https://github.com/thepassle)! - create redirects file for netlify edge adapter

## 0.3.3

### Patch Changes

- [#3170](https://github.com/withastro/astro/pull/3170) [`19667c45`](https://github.com/withastro/astro/commit/19667c45f318ec13cdc2b51016f3fa3487b2a32d) Thanks [@matthewp](https://github.com/matthewp)! - Netlify Edge: Forward requests for static assets

## 0.3.2

### Patch Changes

- [#3160](https://github.com/withastro/astro/pull/3160) [`ae9ac5cb`](https://github.com/withastro/astro/commit/ae9ac5cbdceba0687d83d56d9d5f80479ab88710) Thanks [@matthewp](https://github.com/matthewp)! - Allows using React.lazy, Suspense in SSR and with hydration

## 0.3.1

### Patch Changes

- [#3150](https://github.com/withastro/astro/pull/3150) [`05cf1a50`](https://github.com/withastro/astro/commit/05cf1a506702f06ed48cd26cbe5ca108839ff0e6) Thanks [@matthewp](https://github.com/matthewp)! - Outputs manifest.json in correct folder for Netlify Edge Functions

## 0.3.0

### Minor Changes

- [#3148](https://github.com/withastro/astro/pull/3148) [`4cf54c60`](https://github.com/withastro/astro/commit/4cf54c60aa63bd614b242da0602790015005673d) Thanks [@matthewp](https://github.com/matthewp)! - Adds support for Netlify Edge Functions

## 0.2.3

### Patch Changes

- [#3092](https://github.com/withastro/astro/pull/3092) [`a5caf08e`](https://github.com/withastro/astro/commit/a5caf08e2494e9f779baa6b288d277490dd436b8) Thanks [@matthewp](https://github.com/matthewp)! - Fixes setting multiple cookies with the Netlify adapter

## 0.2.2

### Patch Changes

- [#3079](https://github.com/withastro/astro/pull/3079) [`9f248b05`](https://github.com/withastro/astro/commit/9f248b0563828db0e01e685aac177eaf8107906e) Thanks [@hippotastic](https://github.com/hippotastic)! - Make Netlify adapter actually append redirects

## 0.2.1

### Patch Changes

- [`815d62f1`](https://github.com/withastro/astro/commit/815d62f151a36fef7d09590d4962ca71bda61b32) Thanks [@FredKSchott](https://github.com/FredKSchott)! - no changes.

## 0.2.0

### Minor Changes

- [`732ea388`](https://github.com/withastro/astro/commit/732ea3881e216f0e6de3642c549afd019d32409f) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Improve the Netlify adapter:

  1. Remove `site` config requirement
  2. Fix an issue where query params were being stripped
  3. Pass the event body to the request object

### Patch Changes

- [#2996](https://github.com/withastro/astro/pull/2996) [`77aa3a5c`](https://github.com/withastro/astro/commit/77aa3a5c504c5f51ed1c4d2c8abc4997397deec2) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add human-readable error when a site is not provided in your astro.config

* [#3011](https://github.com/withastro/astro/pull/3011) [`c6f8bce7`](https://github.com/withastro/astro/commit/c6f8bce7c35cc4fd450fe1b6cc8297a81e413b8e) Thanks [@matthewp](https://github.com/matthewp)! - Fixes dynamic routes in the Netlify adapter

## 0.1.1-beta.1

### Patch Changes

- [#3011](https://github.com/withastro/astro/pull/3011) [`c6f8bce7`](https://github.com/withastro/astro/commit/c6f8bce7c35cc4fd450fe1b6cc8297a81e413b8e) Thanks [@matthewp](https://github.com/matthewp)! - Fixes dynamic routes in the Netlify adapter

## 0.1.1-beta.0

### Patch Changes

- [#2996](https://github.com/withastro/astro/pull/2996) [`77aa3a5c`](https://github.com/withastro/astro/commit/77aa3a5c504c5f51ed1c4d2c8abc4997397deec2) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add human-readable error when a site is not provided in your astro.config

## 0.1.0

### Minor Changes

- [`e425f896`](https://github.com/withastro/astro/commit/e425f896b668d98033ad3b998b50c1f28bc7f6ee) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Update config options to respect [RFC0019](https://github.com/withastro/rfcs/blob/main/proposals/0019-config-finalization.md)

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
