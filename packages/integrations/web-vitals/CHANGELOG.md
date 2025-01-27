# @astrojs/web-vitals

## 3.0.1

### Patch Changes

- [#12594](https://github.com/withastro/astro/pull/12594) [`4f2fd0a`](https://github.com/withastro/astro/commit/4f2fd0a0d67a748af8b611b9afc7d4c789f7c8cc) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes compatibility with Astro 5

## 3.0.0

### Major Changes

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

## 3.0.0-beta.1

### Major Changes

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

### Patch Changes

- Updated dependencies [[`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255)]:
  - @astrojs/db@0.14.0-beta.1

## 2.0.1-alpha.0

### Patch Changes

- Updated dependencies [[`b677429`](https://github.com/withastro/astro/commit/b67742961a384c10e5cd04cf5b02d0f014ea7362)]:
  - @astrojs/db@0.13.2-alpha.0

## 3.0.0

### Patch Changes

- Updated dependencies [[`d6611e8`](https://github.com/withastro/astro/commit/d6611e8bb05e7d913aeb5e59e90906b8b919d48e)]:
  - @astrojs/db@0.14.0

## 2.0.0

### Patch Changes

- Updated dependencies [[`849e4c6`](https://github.com/withastro/astro/commit/849e4c6c23e61f7fa59f583419048b998bef2475), [`a79a8b0`](https://github.com/withastro/astro/commit/a79a8b0230b06ed32ce1802f2a5f84a6cf92dbe7)]:
  - @astrojs/db@0.13.0

## 1.0.0

### Patch Changes

- Updated dependencies [[`2e70741`](https://github.com/withastro/astro/commit/2e70741362afc1e7d03c8b2a9d8edb8466dfe9c3)]:
  - @astrojs/db@0.12.0

## 0.2.1

### Patch Changes

- [#11120](https://github.com/withastro/astro/pull/11120) [`9a0e94b`](https://github.com/withastro/astro/commit/9a0e94b2e6bc41b370d8a0518004c6f3cb1b833e) Thanks [@delucis](https://github.com/delucis)! - Fixes requests to the web vitals endpoint in setups like Vercel’s `trailingSlash: true` that redirect from `/web-vitals` to `/web-vitals/`

## 0.2.0

### Minor Changes

- [#11094](https://github.com/withastro/astro/pull/11094) [`3c7a4fa`](https://github.com/withastro/astro/commit/3c7a4fabea5ebb0e8f79742731415136ae3da9a6) Thanks [@delucis](https://github.com/delucis)! - Upgrades the `web-vitals` dependency to v4 and stops collecting data for the deprecated FID (First Input Delay) metric.

### Patch Changes

- [#11096](https://github.com/withastro/astro/pull/11096) [`0dbd8ee`](https://github.com/withastro/astro/commit/0dbd8eeb77065f3ed03f481c8042f2896a5448c4) Thanks [@delucis](https://github.com/delucis)! - Adds support for deprecating the web vitals DB table, so the integration can be removed if desired

## 0.1.1

### Patch Changes

- [#10947](https://github.com/withastro/astro/pull/10947) [`e63e96b`](https://github.com/withastro/astro/commit/e63e96bf32bce270926da6e65c9a331cf9e462d4) Thanks [@delucis](https://github.com/delucis)! - Fixes a runtime issue where Vite was unintentionally pulled into the server code

## 0.1.0

### Minor Changes

- [#10883](https://github.com/withastro/astro/pull/10883) [`a37d76a`](https://github.com/withastro/astro/commit/a37d76a42ac00697be3acd575f3f7163129ea75c) Thanks [@delucis](https://github.com/delucis)! - Adds a new web-vitals integration powered by Astro DB
