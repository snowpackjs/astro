# @astrojs/vercel

## 1.0.0

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

- [#11714](https://github.com/withastro/astro/pull/11714) [`8a53517`](https://github.com/withastro/astro/commit/8a5351737d6a14fc55f1dafad8f3b04079e81af6) Thanks [@matthewp](https://github.com/matthewp)! - Remove support for functionPerRoute

  This change removes support for the `functionPerRoute` option both in Astro and `@astrojs/vercel`.

  This option made it so that each route got built as separate entrypoints so that they could be loaded as separate functions. The hope was that by doing this it would decrease the size of each function. However in practice routes use most of the same code, and increases in function size limitations made the potential upsides less important.

  Additionally there are downsides to functionPerRoute, such as hitting limits on the number of functions per project. The feature also never worked with some Astro features like i18n domains and request rewriting.

  Given this, the feature has been removed from Astro.
