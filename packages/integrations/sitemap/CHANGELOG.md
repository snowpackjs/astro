# @astrojs/sitemap

## 3.2.1

### Patch Changes

- [#12156](https://github.com/withastro/astro/pull/12156) [`07754f5`](https://github.com/withastro/astro/commit/07754f5873b05ab4dae31ded7264fe4056c2dfc8) Thanks [@mingjunlu](https://github.com/mingjunlu)! - Adds missing `xslURL` property to `SitemapOptions` type.

## 3.2.0

### Minor Changes

- [#11485](https://github.com/withastro/astro/pull/11485) [`fbe1bc5`](https://github.com/withastro/astro/commit/fbe1bc51d89994c4919c12768908658604513bd3) Thanks [@sondr3](https://github.com/sondr3)! - Adds new `xslURL` option to enable styling of sitemaps

## 3.1.6

### Patch Changes

- [#11263](https://github.com/withastro/astro/pull/11263) [`7d59750`](https://github.com/withastro/astro/commit/7d597506615fa5a34327304e8321be7b9c4b799d) Thanks [@wackbyte](https://github.com/wackbyte)! - Refactor to use Astro's integration logger for logging

## 3.1.5

### Patch Changes

- [#10779](https://github.com/withastro/astro/pull/10779) [`cefeadf`](https://github.com/withastro/astro/commit/cefeadf0a4a51420130445b6dc5ab1e5b331732b) Thanks [@adrianlyjak](https://github.com/adrianlyjak)! - Fixes false positives for status code routes like `404` and `500` when generating sitemaps.

## 3.1.4

### Patch Changes

- [#10772](https://github.com/withastro/astro/pull/10772) [`0e22462d1534afc8f7bb6782f86db680c7a5f245`](https://github.com/withastro/astro/commit/0e22462d1534afc8f7bb6782f86db680c7a5f245) Thanks [@gislerro](https://github.com/gislerro)! - Fixes an issue where the root url does not follow the `trailingSlash` config option

## 3.1.3

### Patch Changes

- [#10795](https://github.com/withastro/astro/pull/10795) [`1ce22881c657becf0397b83ac393fb5d2399104c`](https://github.com/withastro/astro/commit/1ce22881c657becf0397b83ac393fb5d2399104c) Thanks [@bluwy](https://github.com/bluwy)! - Improves performance when generating the sitemap data

## 3.1.2

### Patch Changes

- [#10557](https://github.com/withastro/astro/pull/10557) [`5f7e9c47e01116f6ec74b33770f480404680956a`](https://github.com/withastro/astro/commit/5f7e9c47e01116f6ec74b33770f480404680956a) Thanks [@mingjunlu](https://github.com/mingjunlu)! - Fixes an issue where the base path is missing in `sitemap-index.xml`.

## 3.1.1

### Patch Changes

- [#10179](https://github.com/withastro/astro/pull/10179) [`6343f6a438d790fa16a0dd268f4a51def4fa0f33`](https://github.com/withastro/astro/commit/6343f6a438d790fa16a0dd268f4a51def4fa0f33) Thanks [@ematipico](https://github.com/ematipico)! - Revert https://github.com/withastro/astro/pull/9846

  The feature to customize the file name of the sitemap was reverted due to some internal issues with one of the dependencies. With an non-deterministic behaviour, the sitemap file was sometime emitted with incorrect syntax.

- [#9975](https://github.com/withastro/astro/pull/9975) [`ec7d2ebbd96b8c2dfdadaf076bbf7953007536ed`](https://github.com/withastro/astro/commit/ec7d2ebbd96b8c2dfdadaf076bbf7953007536ed) Thanks [@moose96](https://github.com/moose96)! - Fixes URL generation for routes that rest parameters and start with `/`

## 3.1.0

### Minor Changes

- [#9846](https://github.com/withastro/astro/pull/9846) [`9b78c992750cdb99c40a89a00ea2a0d1c00877d7`](https://github.com/withastro/astro/commit/9b78c992750cdb99c40a89a00ea2a0d1c00877d7) Thanks [@ktym4a](https://github.com/ktym4a)! - Adds a new configuration option `prefix` that allows you to change the default `sitemap-*.xml` file name.

  By default, running `astro build` creates both `sitemap-index.xml` and `sitemap-0.xml` in your output directory.

  To change the names of these files (e.g. to `astrosite-index.xml` and `astrosite-0.xml`), set the `prefix` option in your `sitemap` integration configuration:

  ```
  import { defineConfig } from 'astro/config';
  import sitemap from '@astrojs/sitemap';
  export default defineConfig({
    site: 'https://example.com',
    integrations: [
      sitemap({
        prefix: 'astrosite-',
      }),
    ],
  });
  ```

  This option is useful when Google Search Console is unable to fetch your default sitemap files, but can read renamed files.

## 3.0.5

### Patch Changes

- [#9704](https://github.com/withastro/astro/pull/9704) [`b325fada567892b63ecae87c1ff845c8514457ba`](https://github.com/withastro/astro/commit/b325fada567892b63ecae87c1ff845c8514457ba) Thanks [@andremralves](https://github.com/andremralves)! - Fixes generated URLs when using a `base` with a SSR adapter

## 3.0.4

### Patch Changes

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 3.0.3

### Patch Changes

- [#8762](https://github.com/withastro/astro/pull/8762) [`35cd810f0`](https://github.com/withastro/astro/commit/35cd810f0f988010fbb8e6d7ab205de5d816e2b2) Thanks [@evadecker](https://github.com/evadecker)! - Upgrades Zod to 3.22.4

## 3.0.2

### Patch Changes

- [#8824](https://github.com/withastro/astro/pull/8824) [`10b103820`](https://github.com/withastro/astro/commit/10b103820e22e51dcfb0592c542cdf2c5eeb2f52) Thanks [@silent1mezzo](https://github.com/silent1mezzo)! - Display output directory in the sitemap build result

## 3.0.1

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

## 3.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 3.0.0-rc.1

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 3.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 2.0.2

### Patch Changes

- [#8063](https://github.com/withastro/astro/pull/8063) [`bee284cb7`](https://github.com/withastro/astro/commit/bee284cb7741ee594e8b38b1a618763e9058740b) Thanks [@martrapp](https://github.com/martrapp)! - docs: fix github search link in README.md

## 2.0.1

### Patch Changes

- [#7722](https://github.com/withastro/astro/pull/7722) [`77ffcc8f8`](https://github.com/withastro/astro/commit/77ffcc8f8b0ca9f8b9da29525f03028e666fd8df) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Ensure nested 404 and 500 pages are always excluded

## 2.0.0

### Major Changes

- [#7656](https://github.com/withastro/astro/pull/7656) [`dd931a780`](https://github.com/withastro/astro/commit/dd931a78065a9f46ade0588b35dcc2ea7dbed974) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Sitemap only includes `page` routes (generated by `.astro` files) rather than all routes (pages, endpoints, or redirects). This behavior matches our existing documentation, but is a breaking change nonetheless.

### Patch Changes

- [#7656](https://github.com/withastro/astro/pull/7656) [`dd931a780`](https://github.com/withastro/astro/commit/dd931a78065a9f46ade0588b35dcc2ea7dbed974) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Ensure trailing slash is only added to page routes

## 1.4.0

### Minor Changes

- [#7655](https://github.com/withastro/astro/pull/7655) [`c258492b7`](https://github.com/withastro/astro/commit/c258492b7218cc7e5b7be38f48ec1bb1296292d5) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Ensure sitemap only excludes numerical pages matching `/404` and `/500` exactly

## 1.3.3

### Patch Changes

- [#7263](https://github.com/withastro/astro/pull/7263) [`dff0d0dda`](https://github.com/withastro/astro/commit/dff0d0dda2f20c02901594739a654834d3451c8e) Thanks [@andremralves](https://github.com/andremralves)! - Fix sitemap does not filter pages

## 1.3.2

### Patch Changes

- [#7028](https://github.com/withastro/astro/pull/7028) [`6ca3b5a9e`](https://github.com/withastro/astro/commit/6ca3b5a9e8b9aa19a9436043f8ead41e7938c32e) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - exported enum type to support typescript > 5.0

## 1.3.1

### Patch Changes

- [#7029](https://github.com/withastro/astro/pull/7029) [`1b90a7a5d`](https://github.com/withastro/astro/commit/1b90a7a5d5f16e3e1fa0329b509c6c6e76248181) Thanks [@TheOtterlord](https://github.com/TheOtterlord)! - Fix generation for static dynamic routes

## 1.3.0

### Minor Changes

- [#6534](https://github.com/withastro/astro/pull/6534) [`ad907196c`](https://github.com/withastro/astro/commit/ad907196cb42f21d9540ae0d77aa742bf7adf030) Thanks [@atilafassina](https://github.com/atilafassina)! - Adds support to SSR routes to sitemap generation.

## 1.2.2

### Patch Changes

- [#6658](https://github.com/withastro/astro/pull/6658) [`1ec1df126`](https://github.com/withastro/astro/commit/1ec1df12641290ec8b3a417a6284fd8d752c02bf) Thanks [@andremralves](https://github.com/andremralves)! - Fix sitemap generation with a base path

## 1.2.1

### Patch Changes

- [#6494](https://github.com/withastro/astro/pull/6494) [`a13e9d7e3`](https://github.com/withastro/astro/commit/a13e9d7e33baccf51e7d4815f99b481ad174bc57) Thanks [@Yan-Thomas](https://github.com/Yan-Thomas)! - Consistency improvements to several package descriptions

## 1.2.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 1.1.0

### Minor Changes

- [#6262](https://github.com/withastro/astro/pull/6262) [`4fcefa34f`](https://github.com/withastro/astro/commit/4fcefa34f979e23b8c48940b5a5da57fdabc32a4) Thanks [@vic1707](https://github.com/vic1707)! - update `ChangeFreq` to support typescript configurations with string literal or predefined value.

## 1.0.1

### Patch Changes

- [#5478](https://github.com/withastro/astro/pull/5478) [`1c7eef308`](https://github.com/withastro/astro/commit/1c7eef308e808aa5ed4662b53e67ec8d1b814d1f) Thanks [@nemo0](https://github.com/nemo0)! - Update READMEs for consistency

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.3.0

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

### Patch Changes

- [#3978](https://github.com/withastro/astro/pull/3978) [`b37d7078a`](https://github.com/withastro/astro/commit/b37d7078a009869bf482912397a073dca490d3da) Thanks [@Chrissdroid](https://github.com/Chrissdroid)! - Update README to reflect `@astrojs/sitemap@0.2.0` changes

* [#4004](https://github.com/withastro/astro/pull/4004) [`ef9c4152b`](https://github.com/withastro/astro/commit/ef9c4152b2b399e25bf4e8aa7b37adcf6d0d8f17) Thanks [@sarah11918](https://github.com/sarah11918)! - [READMEs] removed "experimental" from astro add instructions

## 0.2.6

### Patch Changes

- [#3885](https://github.com/withastro/astro/pull/3885) [`bf5d1cc1e`](https://github.com/withastro/astro/commit/bf5d1cc1e71da38a14658c615e9481f2145cc6e7) Thanks [@delucis](https://github.com/delucis)! - Integration README fixes

## 0.2.5

### Patch Changes

- [#3865](https://github.com/withastro/astro/pull/3865) [`1f9e4857`](https://github.com/withastro/astro/commit/1f9e4857ff2b2cb7db89d619618cdf546cd3b3dc) Thanks [@delucis](https://github.com/delucis)! - Small README fixes

* [#3854](https://github.com/withastro/astro/pull/3854) [`b012ee55`](https://github.com/withastro/astro/commit/b012ee55b107dea0730286263b27d83e530fad5d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - [astro add] Support adapters and third party packages

## 0.2.4

### Patch Changes

- [#3677](https://github.com/withastro/astro/pull/3677) [`8045c8ad`](https://github.com/withastro/astro/commit/8045c8ade16fe4306448b7f98a4560ef0557d378) Thanks [@Jutanium](https://github.com/Jutanium)! - Update READMEs

## 0.2.3

### Patch Changes

- [#3723](https://github.com/withastro/astro/pull/3723) [`52f75369`](https://github.com/withastro/astro/commit/52f75369efe5a0a1b320478984c90b6727d52159) Thanks [@alextim](https://github.com/alextim)! - fix: if `serialize` function returns `undefined` for the passed entry, such entry will be excluded from sitemap

## 0.2.2

### Patch Changes

- [#3689](https://github.com/withastro/astro/pull/3689) [`3f8ee70e`](https://github.com/withastro/astro/commit/3f8ee70e2bc5b49c65a0444d9606232dadbc2fca) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add warning log for sitemap + SSR adapter, with suggestion to use customPages configuration option

## 0.2.1

### Patch Changes

- [#3661](https://github.com/withastro/astro/pull/3661) [`2ff11df4`](https://github.com/withastro/astro/commit/2ff11df438a6a901e72d1f1979c79deb0ad199f2) Thanks [@matthewp](https://github.com/matthewp)! - Fixes the last build

## 0.2.0

### Minor Changes

- [#3579](https://github.com/withastro/astro/pull/3579) [`1031c06f`](https://github.com/withastro/astro/commit/1031c06f9c6794d9ee6fb18c145ca5614e6f0583) Thanks [@alextim](https://github.com/alextim)! - # Key features

  - Split up your large sitemap into multiple sitemaps by custom limit.
  - Ability to add sitemap specific attributes such as `lastmod` etc.
  - Final output customization via JS function.
  - Localization support.
  - Reliability: all config options are validated.

  ## Important changes

  The integration always generates at least two files instead of one:

  - `sitemap-index.xml` - index file;
  - `sitemap-{i}.xml` - actual sitemap.

## 0.1.2

### Patch Changes

- [#3563](https://github.com/withastro/astro/pull/3563) [`09803129`](https://github.com/withastro/astro/commit/098031294f4e25619d0ae5a6ffc871c7401d98ae) Thanks [@alextim](https://github.com/alextim)! - Remove unused dependency

## 0.1.1

### Patch Changes

- [#3553](https://github.com/withastro/astro/pull/3553) [`c601ce59`](https://github.com/withastro/astro/commit/c601ce59b5740e7ff48c6575a6168d6a2408f7a3) Thanks [@caioferrarezi](https://github.com/caioferrarezi)! - Prevent sitemap URLs with trimmed paths

## 0.1.0

### Minor Changes

- [`e425f896`](https://github.com/withastro/astro/commit/e425f896b668d98033ad3b998b50c1f28bc7f6ee) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Update config options to respect [RFC0019](https://github.com/withastro/rfcs/blob/main/proposals/0019-config-finalization.md)

### Patch Changes

- [`e425f896`](https://github.com/withastro/astro/commit/e425f896b668d98033ad3b998b50c1f28bc7f6ee) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Add new sitemap configuration options:
  - `filter`: filter pages to include in your sitemap
  - `canonicalURL`: override your astro.config `site` with a custom base URL

## 0.0.2

### Patch Changes

- [#2885](https://github.com/withastro/astro/pull/2885) [`6b004363`](https://github.com/withastro/astro/commit/6b004363f99f27e581d1e2d53a2ebff39d7afb8a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add README across Astro built-in integrations

* [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site

## 0.0.2-next.0

### Patch Changes

- [#2847](https://github.com/withastro/astro/pull/2847) [`3b621f7a`](https://github.com/withastro/astro/commit/3b621f7a613b45983b090794fa7c015f23ed6140) Thanks [@tony-sull](https://github.com/tony-sull)! - Adds keywords to the official integrations to support discoverability on Astro's Integrations site
