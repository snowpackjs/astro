# @astrojs/markdoc

## 0.12.7

### Patch Changes

- [#13011](https://github.com/withastro/astro/pull/13011) [`cf30880`](https://github.com/withastro/astro/commit/cf3088060d45227dcb48e041c4ed5e0081d71398) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite

## 0.12.6

### Patch Changes

- [#12361](https://github.com/withastro/astro/pull/12361) [`3d89e62`](https://github.com/withastro/astro/commit/3d89e6282235a8da45d9ddfe02bcf7ec78056941) Thanks [@LunaticMuch](https://github.com/LunaticMuch)! - Upgrades the `esbuild` version to match `vite`

- [#12967](https://github.com/withastro/astro/pull/12967) [`0ef1613`](https://github.com/withastro/astro/commit/0ef1613ea36439a76965290053ccc3f8afb9f400) Thanks [@bluwy](https://github.com/bluwy)! - Fixes rendering components when the `nodes.document.render` Markdoc config is set to `null`

- Updated dependencies [[`3d89e62`](https://github.com/withastro/astro/commit/3d89e6282235a8da45d9ddfe02bcf7ec78056941)]:
  - @astrojs/markdown-remark@6.0.2

## 0.12.5

### Patch Changes

- [#12930](https://github.com/withastro/astro/pull/12930) [`a20a4d7`](https://github.com/withastro/astro/commit/a20a4d7b8ffe3ae941b5c510b319ac6f9783aabe) Thanks [@bluwy](https://github.com/bluwy)! - Fixes rendering code blocks within if tags

## 0.12.4

### Patch Changes

- [#12799](https://github.com/withastro/astro/pull/12799) [`739dbfb`](https://github.com/withastro/astro/commit/739dbfba4214107cf8fc40c702834dad33eed3b0) Thanks [@ascorbic](https://github.com/ascorbic)! - Upgrades Vite to pin esbuild

## 0.12.3

### Patch Changes

- [#12694](https://github.com/withastro/astro/pull/12694) [`495f46b`](https://github.com/withastro/astro/commit/495f46bca78665732e51c629d93a68fa392b88a4) Thanks [@ematipico](https://github.com/ematipico)! - Fixes a bug where the experimental feature `experimental.svg` was incorrectly used when generating ESM images

## 0.12.2

### Patch Changes

- Updated dependencies [[`f13417b`](https://github.com/withastro/astro/commit/f13417bfbf73130c224752379e2da33084f89554), [`87231b1`](https://github.com/withastro/astro/commit/87231b1168da66bb593f681206c42fa555dfcabc), [`a71e9b9`](https://github.com/withastro/astro/commit/a71e9b93b317edc0ded49d4d50f1b7841c8cd428)]:
  - @astrojs/markdown-remark@6.0.1

## 0.12.1

### Patch Changes

- [#12594](https://github.com/withastro/astro/pull/12594) [`4f2fd0a`](https://github.com/withastro/astro/commit/4f2fd0a0d67a748af8b611b9afc7d4c789f7c8cc) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes compatibility with Astro 5

## 0.12.0

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

### Patch Changes

- [#11825](https://github.com/withastro/astro/pull/11825) [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce) Thanks [@bluwy](https://github.com/bluwy)! - Uses latest version of `@astrojs/markdown-remark` with updated Shiki APIs

- [#12075](https://github.com/withastro/astro/pull/12075) [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819) Thanks [@bluwy](https://github.com/bluwy)! - Parses frontmatter ourselves

- [#12584](https://github.com/withastro/astro/pull/12584) [`fa07002`](https://github.com/withastro/astro/commit/fa07002352147d45da193f28fd6e02d2d42dc67a) Thanks [@ascorbic](https://github.com/ascorbic)! - Correctly renders boolean HTML attributes

- Updated dependencies [[`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59), [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255), [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7), [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce), [`83a2a64`](https://github.com/withastro/astro/commit/83a2a648418ad30f4eb781d1c1b5f2d8a8ac846e), [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59), [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819), [`1dc8f5e`](https://github.com/withastro/astro/commit/1dc8f5eb7c515c89aadc85cfa0a300d4f65e8671)]:
  - @astrojs/markdown-remark@6.0.0
  - @astrojs/prism@3.2.0
  - @astrojs/internal-helpers@0.4.2

## 0.12.0-beta.1

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

### Patch Changes

- Updated dependencies [[`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7)]:
  - @astrojs/prism@3.2.0-beta.0
  - @astrojs/markdown-remark@6.0.0-beta.3

## 0.11.5-beta.1

### Patch Changes

- [#12075](https://github.com/withastro/astro/pull/12075) [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819) Thanks [@bluwy](https://github.com/bluwy)! - Parses frontmatter ourselves

- Updated dependencies [[`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819)]:
  - @astrojs/markdown-remark@6.0.0-beta.2

## 0.11.5-beta.0

### Patch Changes

- Updated dependencies [[`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255)]:
  - @astrojs/markdown-remark@6.0.0-beta.1

## 1.0.0-alpha.1

### Patch Changes

- [#11825](https://github.com/withastro/astro/pull/11825) [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce) Thanks [@bluwy](https://github.com/bluwy)! - Uses latest version of `@astrojs/markdown-remark` with updated Shiki APIs

- Updated dependencies [[`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59), [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce), [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59)]:
  - @astrojs/markdown-remark@6.0.0-alpha.1

## 1.0.0-alpha.0

### Patch Changes

- Updated dependencies [[`b6fbdaa`](https://github.com/withastro/astro/commit/b6fbdaa94a9ecec706a99e1938fbf5cd028c72e0), [`89bab1e`](https://github.com/withastro/astro/commit/89bab1e70786123fbe933a9d7a1b80c9334dcc5f), [`d74617c`](https://github.com/withastro/astro/commit/d74617cbd3278feba05909ec83db2d73d57a153e), [`83a2a64`](https://github.com/withastro/astro/commit/83a2a648418ad30f4eb781d1c1b5f2d8a8ac846e), [`e90f559`](https://github.com/withastro/astro/commit/e90f5593d23043579611452a84b9e18ad2407ef9), [`2df49a6`](https://github.com/withastro/astro/commit/2df49a6fb4f6d92fe45f7429430abe63defeacd6), [`8a53517`](https://github.com/withastro/astro/commit/8a5351737d6a14fc55f1dafad8f3b04079e81af6)]:
  - astro@5.0.0-alpha.0
  - @astrojs/markdown-remark@6.0.0-alpha.0

## 0.11.5

### Patch Changes

- Updated dependencies [[`710a1a1`](https://github.com/withastro/astro/commit/710a1a11f488ff6ed3da6d3e0723b2322ccfe27b)]:
  - @astrojs/markdown-remark@5.3.0

## 0.11.4

### Patch Changes

- [#11846](https://github.com/withastro/astro/pull/11846) [`ed7bbd9`](https://github.com/withastro/astro/commit/ed7bbd990f80cacf9c5ec2a70ad7501631b92d3f) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fixes an issue preventing to use Astro components as Markdoc tags and nodes when configured using the `extends` property.

## 0.11.3

### Patch Changes

- Updated dependencies [[`49b5145`](https://github.com/withastro/astro/commit/49b5145158a603b9bb951bf914a6a9780c218704)]:
  - @astrojs/markdown-remark@5.2.0

## 0.11.2

### Patch Changes

- [#11450](https://github.com/withastro/astro/pull/11450) [`eb303e1`](https://github.com/withastro/astro/commit/eb303e1ad5dade7787c0d9bbb520c21292cf3950) Thanks [@schpet](https://github.com/schpet)! - Adds support for markdown-it's typographer option

## 0.11.1

### Patch Changes

- Updated dependencies [[`b6afe6a`](https://github.com/withastro/astro/commit/b6afe6a782f68f4a279463a144baaf99cb96b6dc), [`41064ce`](https://github.com/withastro/astro/commit/41064cee78c1cccd428f710a24c483aeb275fd95)]:
  - @astrojs/markdown-remark@5.1.1
  - @astrojs/internal-helpers@0.4.1

## 0.11.0

### Minor Changes

- [#10833](https://github.com/withastro/astro/pull/10833) [`8d5f3e8`](https://github.com/withastro/astro/commit/8d5f3e8656027023f9fda51c66b0213ffe16d3a5) Thanks [@renovate](https://github.com/apps/renovate)! - Updates `@markdoc/markdoc` to v0.4

### Patch Changes

- [#10833](https://github.com/withastro/astro/pull/10833) [`8d5f3e8`](https://github.com/withastro/astro/commit/8d5f3e8656027023f9fda51c66b0213ffe16d3a5) Thanks [@renovate](https://github.com/apps/renovate)! - Updates `esbuild` dependency to v0.20. This should not affect projects in most cases.

## 0.10.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

### Patch Changes

- Updated dependencies [[`ccafa8d230f65c9302421a0ce0a0adc5824bfd55`](https://github.com/withastro/astro/commit/ccafa8d230f65c9302421a0ce0a0adc5824bfd55), [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99)]:
  - @astrojs/markdown-remark@5.1.0
  - @astrojs/prism@3.1.0

## 0.9.5

### Patch Changes

- [#10649](https://github.com/withastro/astro/pull/10649) [`90cfade88c2b9a34d8a5fe711ce329732d690409`](https://github.com/withastro/astro/commit/90cfade88c2b9a34d8a5fe711ce329732d690409) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add automatic resolution for Markdoc partials. This allows you to render other Markdoc files inside of a given entry. Reference files using the `partial` tag with a `file` attribute for the relative file path:

  ```md
  <!--src/content/blog/post.mdoc-->

  {% partial file="my-partials/_diagram.mdoc" /%}

  <!--src/content/blog/my-partials/_diagram.mdoc-->

  ## Diagram

  This partial will render inside of `post.mdoc.`

  ![Diagram](./diagram.png)
  ```

## 0.9.4

### Patch Changes

- [#10632](https://github.com/withastro/astro/pull/10632) [`da2fb875fc58b65a21d37a3d29f570fa20b5219c`](https://github.com/withastro/astro/commit/da2fb875fc58b65a21d37a3d29f570fa20b5219c) Thanks [@bluwy](https://github.com/bluwy)! - Moves `@astrojs/markdown-remark` as a dependency

- Updated dependencies [[`2cf116f80cb5e421ab5cc5eb4a654e7b78c1b8de`](https://github.com/withastro/astro/commit/2cf116f80cb5e421ab5cc5eb4a654e7b78c1b8de), [`374efcdff9625ca43309d89e3b9cfc9174351512`](https://github.com/withastro/astro/commit/374efcdff9625ca43309d89e3b9cfc9174351512)]:
  - @astrojs/markdown-remark@5.0.0

## 0.9.3

### Patch Changes

- Updated dependencies [[`20463a6c1e1271d8dc3cb0ab3419ee5c72abd218`](https://github.com/withastro/astro/commit/20463a6c1e1271d8dc3cb0ab3419ee5c72abd218)]:
  - @astrojs/internal-helpers@0.4.0

## 0.9.2

### Patch Changes

- Updated dependencies [[`1ea0a25b94125e4f6f2ac82b42f638e22d7bdffd`](https://github.com/withastro/astro/commit/1ea0a25b94125e4f6f2ac82b42f638e22d7bdffd)]:
  - @astrojs/internal-helpers@0.3.0

## 0.9.1

### Patch Changes

- [#10278](https://github.com/withastro/astro/pull/10278) [`a548a3a99c2835c19662fc38636f92b2bda26614`](https://github.com/withastro/astro/commit/a548a3a99c2835c19662fc38636f92b2bda26614) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes original images sometimes being kept / deleted when they shouldn't in both MDX and Markdoc

## 0.9.0

### Minor Changes

- [#9958](https://github.com/withastro/astro/pull/9958) [`14ce8a6ebfc9daf951d2dca54737d857c229667c`](https://github.com/withastro/astro/commit/14ce8a6ebfc9daf951d2dca54737d857c229667c) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Adds support for using a custom tag (component) for optimized images

  Starting from this version, when a tag called `image` is used, its `src` attribute will automatically be resolved if it's a local image. Astro will pass the result `ImageMetadata` object to the underlying component as the `src` prop. For non-local images (i.e. images using URLs or absolute paths), Astro will continue to pass the `src` as a string.

  ```ts
  // markdoc.config.mjs
  import { component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

  export default defineMarkdocConfig({
    tags: {
      image: {
        attributes: nodes.image.attributes,
        render: component('./src/components/MarkdocImage.astro'),
      },
    },
  });
  ```

  ```astro
  ---
  // src/components/MarkdocImage.astro
  import { Image } from 'astro:assets';

  interface Props {
    src: ImageMetadata | string;
    alt: string;
    width: number;
    height: number;
  }

  const { src, alt, width, height } = Astro.props;
  ---

  <Image {src} {alt} {width} {height} />
  ```

  ```mdoc
  {% image src="./astro-logo.png" alt="Astro Logo" width="100" height="100" %}
  ```

## 0.8.3

### Patch Changes

- [#9643](https://github.com/withastro/astro/pull/9643) [`e9a72d9a91a3741566866bcaab11172cb0dc7d31`](https://github.com/withastro/astro/commit/e9a72d9a91a3741566866bcaab11172cb0dc7d31) Thanks [@blackmann](https://github.com/blackmann)! - Removes unnecessary `shikiji` dependency

## 0.8.2

### Patch Changes

- [#9479](https://github.com/withastro/astro/pull/9479) [`1baf0b0d3cbd0564954c2366a7278794fad6726e`](https://github.com/withastro/astro/commit/1baf0b0d3cbd0564954c2366a7278794fad6726e) Thanks [@sarah11918](https://github.com/sarah11918)! - Updates README

## 0.8.1

### Patch Changes

- [#9452](https://github.com/withastro/astro/pull/9452) [`e83b5095f`](https://github.com/withastro/astro/commit/e83b5095f164f48ba40fc715a805fc66a3e39dcf) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Upgrades vite to latest

## 0.8.0

### Minor Changes

- [#9263](https://github.com/withastro/astro/pull/9263) [`3cbd8ea75`](https://github.com/withastro/astro/commit/3cbd8ea7534910e3beae396dcfa93ce87dcdd91f) Thanks [@bluwy](https://github.com/bluwy)! - Removes internal `propagators` handling for Astro 3

## 1.0.0-beta.1

### Minor Changes

- [#9263](https://github.com/withastro/astro/pull/9263) [`3cbd8ea75`](https://github.com/withastro/astro/commit/3cbd8ea7534910e3beae396dcfa93ce87dcdd91f) Thanks [@bluwy](https://github.com/bluwy)! - Removes internal `propagators` handling for Astro 3

## 1.0.0-beta.0

### Patch Changes

- Updated dependencies [[`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3), [`6201bbe96`](https://github.com/withastro/astro/commit/6201bbe96c2a083fb201e4a43a9bd88499821a3e), [`cdabf6ef0`](https://github.com/withastro/astro/commit/cdabf6ef02be7220fd2b6bdcef924ceca089381e), [`1c48ed286`](https://github.com/withastro/astro/commit/1c48ed286538ab9e354eca4e4dcd7c6385c96721), [`37697a2c5`](https://github.com/withastro/astro/commit/37697a2c5511572dc29c0a4ea46f90c2f62be8e6), [`bd0c2e9ae`](https://github.com/withastro/astro/commit/bd0c2e9ae3389a9d3085050c1e8134ae98dff299), [`0fe3a7ed5`](https://github.com/withastro/astro/commit/0fe3a7ed5d7bb1a9fce1623e84ba14104b51223c), [`710be505c`](https://github.com/withastro/astro/commit/710be505c9ddf416e77a75343d8cae9c497d72c6), [`153a5abb9`](https://github.com/withastro/astro/commit/153a5abb905042ac68b712514dc9ec387d3e6b17)]:
  - astro@4.0.0-beta.0

## 0.7.2

### Patch Changes

- [#9083](https://github.com/withastro/astro/pull/9083) [`4537ecf0d`](https://github.com/withastro/astro/commit/4537ecf0d060f89cb8c000338a7fc5f4197a88c8) Thanks [@bluwy](https://github.com/bluwy)! - Uses new `createShikiHighlighter` API from `@astrojs/markdown-remark` to avoid code duplication

## 0.7.1

### Patch Changes

- [#8759](https://github.com/withastro/astro/pull/8759) [`01c801108`](https://github.com/withastro/astro/commit/01c801108f1f5429436e4fc930018bf96ed31f79) Thanks [@lutaok](https://github.com/lutaok)! - Fix build process on markdoc integration when root folder contains spaces

- [#8762](https://github.com/withastro/astro/pull/8762) [`35cd810f0`](https://github.com/withastro/astro/commit/35cd810f0f988010fbb8e6d7ab205de5d816e2b2) Thanks [@evadecker](https://github.com/evadecker)! - Upgrades Zod to 3.22.4

## 0.7.0

### Minor Changes

- [#8802](https://github.com/withastro/astro/pull/8802) [`73b8d60f8`](https://github.com/withastro/astro/commit/73b8d60f8c3eeae74035202b0ea0d4848e736c7d) Thanks [@AndyClifford](https://github.com/AndyClifford)! - Added ignoreIndentation as a markdoc integration option to enable better readability of source code.

### Patch Changes

- Updated dependencies [[`26b77b8fe`](https://github.com/withastro/astro/commit/26b77b8fef0e03bfc5550aecaa1f56a4fc1cd297)]:
  - astro@3.3.4

## 0.6.0

### Minor Changes

- [#8502](https://github.com/withastro/astro/pull/8502) [`c4270e476`](https://github.com/withastro/astro/commit/c4270e47681ee2453f3fea07fed7b238645fd6ea) Thanks [@bluwy](https://github.com/bluwy)! - Updates the internal `shiki` syntax highlighter to `shikiji`, an ESM-focused alternative that simplifies bundling and maintenance.

  There are no new options and no changes to how you author code blocks and syntax highlighting.

  **Potentially breaking change:** While this refactor should be transparent for most projects, the transition to `shikiji` now produces a smaller HTML markup by attaching a fallback `color` style to the `pre` or `code` element, instead of to the line `span` directly. For example:

  Before:

  ```html
  <code class="astro-code" style="background-color: #24292e">
    <pre>
      <span class="line" style="color: #e1e4e8">my code</span>
    </pre>
  </code>
  ```

  After:

  ```html
  <code class="astro-code" style="background-color: #24292e; color: #e1e4e8">
    <pre>
      <span class="line">my code<span>
    </pre>
  </code>
  ```

  This does not affect the colors as the `span` will inherit the `color` from the parent, but if you're relying on a specific HTML markup, please check your site carefully after upgrading to verify the styles.

### Patch Changes

- Updated dependencies [[`2993055be`](https://github.com/withastro/astro/commit/2993055bed2764c31ff4b4f55b81ab6b1ae6b401), [`c4270e476`](https://github.com/withastro/astro/commit/c4270e47681ee2453f3fea07fed7b238645fd6ea), [`bd5aa1cd3`](https://github.com/withastro/astro/commit/bd5aa1cd35ecbd2784f30dd836ff814684fee02b), [`f369fa250`](https://github.com/withastro/astro/commit/f369fa25055a3497ebaf61c88fb0e8af56c73212), [`391729686`](https://github.com/withastro/astro/commit/391729686bcc8404a7dd48c5987ee380daf3200f), [`f999365b8`](https://github.com/withastro/astro/commit/f999365b8248b8b14f3743e68a42d450d06acff3), [`b2ae9ee0c`](https://github.com/withastro/astro/commit/b2ae9ee0c42b11ffc1d3f070d1d5ac881aef84ed), [`0abff97fe`](https://github.com/withastro/astro/commit/0abff97fed3db14be3c75ff9ece3aab67c4ba783), [`3bef32f81`](https://github.com/withastro/astro/commit/3bef32f81c56bc600ca307f1bd40787e23e625a5)]:
  - astro@3.3.0

## 0.5.2

### Patch Changes

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

- Updated dependencies [[`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c), [`d78806dfe`](https://github.com/withastro/astro/commit/d78806dfe0301ea7ffe6c7c1f783bd415ac7cda9), [`d1c75fe15`](https://github.com/withastro/astro/commit/d1c75fe158839699c59728cf3a83888e8c72a459), [`aa265d730`](https://github.com/withastro/astro/commit/aa265d73024422967c1b1c68ad268c419c6c798f), [`78adbc443`](https://github.com/withastro/astro/commit/78adbc4433208458291e36713909762e148e1e5d), [`21e0757ea`](https://github.com/withastro/astro/commit/21e0757ea22a57d344c934045ca19db93b684436), [`357270f2a`](https://github.com/withastro/astro/commit/357270f2a3d0bf2aa634ba7e52e9d17618eff4a7)]:
  - @astrojs/internal-helpers@0.2.1
  - astro@3.2.3

## 0.5.1

### Patch Changes

- [#8710](https://github.com/withastro/astro/pull/8710) [`4c2bec681`](https://github.com/withastro/astro/commit/4c2bec681b0752e7215b8a32bd2d44bf477adac1) Thanks [@matthewp](https://github.com/matthewp)! - Fixes View transition styles being missing when component used multiple times

- Updated dependencies [[`455af3235`](https://github.com/withastro/astro/commit/455af3235b3268852e6988accecc796f03f6d16e), [`4c2bec681`](https://github.com/withastro/astro/commit/4c2bec681b0752e7215b8a32bd2d44bf477adac1)]:
  - astro@3.2.2

## 0.5.0

### Minor Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8169](https://github.com/withastro/astro/pull/8169) [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12) Thanks [@bluwy](https://github.com/bluwy)! - Remove pre-shiki v0.14 theme names for compatibility. Please rename to the new theme names to migrate:

  - `material-darker` -> `material-theme-darker`
  - `material-default` -> `material-theme`
  - `material-lighter` -> `material-theme-lighter`
  - `material-ocean` -> `material-theme-ocean`
  - `material-palenight` -> `material-theme-palenight`

### Patch Changes

- Updated dependencies [[`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312), [`db39206cb`](https://github.com/withastro/astro/commit/db39206cbb85b034859ac416179f141184bb2bff), [`2aa6d8ace`](https://github.com/withastro/astro/commit/2aa6d8ace398a41c2dec5473521d758816b08191), [`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`0c7b42dc6`](https://github.com/withastro/astro/commit/0c7b42dc6780e687e416137539f55a3a427d1d10), [`46c4c0e05`](https://github.com/withastro/astro/commit/46c4c0e053f830585b9ef229ce1c259df00a80f8), [`364d861bd`](https://github.com/withastro/astro/commit/364d861bd527b8511968e2837728148f090bedef), [`2484dc408`](https://github.com/withastro/astro/commit/2484dc4080e5cd84b9a53648a1de426d7c907be2), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`c2c71d90c`](https://github.com/withastro/astro/commit/c2c71d90c264a2524f99e0373ab59015f23ad4b1), [`cd2d7e769`](https://github.com/withastro/astro/commit/cd2d7e76981ef9b9013453aa2629838e1e9fd422), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`e45f30293`](https://github.com/withastro/astro/commit/e45f3029340db718b6ed7e91b5d14f5cf14cd71d), [`c0de7a7b0`](https://github.com/withastro/astro/commit/c0de7a7b0f042cd49cbea4f4ac1b2ab6f9fef644), [`65c354969`](https://github.com/withastro/astro/commit/65c354969e6fe0ef6d622e8f4c545e2f717ce8c6), [`3c3100851`](https://github.com/withastro/astro/commit/3c31008519ce68b5b1b1cb23b71fbe0a2d506882), [`34cb20021`](https://github.com/withastro/astro/commit/34cb2002161ba88df6bcb72fecfd12ed867c134b), [`a824863ab`](https://github.com/withastro/astro/commit/a824863ab1c451f4068eac54f28dd240573e1cba), [`44f7a2872`](https://github.com/withastro/astro/commit/44f7a28728c56c04ac377b6e917329f324874043), [`1048aca55`](https://github.com/withastro/astro/commit/1048aca550769415e528016e42b358ffbfd44b61), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`9e021a91c`](https://github.com/withastro/astro/commit/9e021a91c57d10809f588dd47968fc0e7f8b4d5c), [`7511a4980`](https://github.com/withastro/astro/commit/7511a4980fd36536464c317de33a5190427f430a), [`c37632a20`](https://github.com/withastro/astro/commit/c37632a20d06164fb97a4c2fc48df6d960398832), [`acf652fc1`](https://github.com/withastro/astro/commit/acf652fc1d5db166231e87e22d0d50444f5556d8), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`8450379db`](https://github.com/withastro/astro/commit/8450379db854fb1eaa9f38f21d65db240bc616cd), [`dbc97b121`](https://github.com/withastro/astro/commit/dbc97b121f42583728f1cdfdbf14575fda943f5b), [`7d2f311d4`](https://github.com/withastro/astro/commit/7d2f311d428e3d1c8c13b9bf2a708d6435713fc2), [`2540feedb`](https://github.com/withastro/astro/commit/2540feedb06785d5a20eecc3668849f147d778d4), [`ea7ff5177`](https://github.com/withastro/astro/commit/ea7ff5177dbcd7b2508cb1eef1b22b8ee1f47079), [`68efd4a8b`](https://github.com/withastro/astro/commit/68efd4a8b29f248397667801465b3152dc98e9a7), [`7bd1b86f8`](https://github.com/withastro/astro/commit/7bd1b86f85c06fdde0a1ed9146d01bac69990671), [`036388f66`](https://github.com/withastro/astro/commit/036388f66dab68ad54b895ed86f9176958dd83c8), [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae), [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`a8f35777e`](https://github.com/withastro/astro/commit/a8f35777e7e322068a4e2f520c2c9e43ade19e58), [`70f34f5a3`](https://github.com/withastro/astro/commit/70f34f5a355f42526ee9e5355f3de8e510002ea2), [`5208a3c8f`](https://github.com/withastro/astro/commit/5208a3c8fefcec7694857fb344af351f4631fc34), [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`ffc9e2d3d`](https://github.com/withastro/astro/commit/ffc9e2d3de46049bf3d82140ef018f524fb03187), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`0f637c71e`](https://github.com/withastro/astro/commit/0f637c71e511cb4c51712128d217a26c8eee4d40), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`8a5b0c1f3`](https://github.com/withastro/astro/commit/8a5b0c1f3a4be6bb62db66ec70144109ff5b4c59), [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`632579dc2`](https://github.com/withastro/astro/commit/632579dc2094cc342929261c89e689f0dd358284), [`3674584e0`](https://github.com/withastro/astro/commit/3674584e02b161a698b429ceb66723918fdc56ac), [`1db4e92c1`](https://github.com/withastro/astro/commit/1db4e92c12ed73681217f5cefd39f2f47542f961), [`e7f872e91`](https://github.com/withastro/astro/commit/e7f872e91e852b901cf221a5151077dec64305bf), [`16f09dfff`](https://github.com/withastro/astro/commit/16f09dfff7722fda99dd0412e3006a7a39c80829), [`4477bb41c`](https://github.com/withastro/astro/commit/4477bb41c8ed688785c545731ef5b184b629f4e5), [`55c10d1d5`](https://github.com/withastro/astro/commit/55c10d1d564e805efc3c1a7c48e0d9a1cdf0c7ed), [`3e834293d`](https://github.com/withastro/astro/commit/3e834293d47ab2761a7aa013916e8371871efb7f), [`96beb883a`](https://github.com/withastro/astro/commit/96beb883ad87f8bbf5b2f57e14a743763d2a6f58), [`997a0db8a`](https://github.com/withastro/astro/commit/997a0db8a4e3851edd69384cf5eadbb969e1d547), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`0f0625504`](https://github.com/withastro/astro/commit/0f0625504145f18cba7dc6cf20291cb2abddc5a9), [`e1ae56e72`](https://github.com/withastro/astro/commit/e1ae56e724d0f83db1230359e06cd6bc26f5fa26), [`f32d093a2`](https://github.com/withastro/astro/commit/f32d093a280faafff024228c12bb438156ec34d7), [`f01eb585e`](https://github.com/withastro/astro/commit/f01eb585e7c972d940761309b1595f682b6922d2), [`b76c166bd`](https://github.com/withastro/astro/commit/b76c166bdd8e28683f62806aef968d1e0c3b06d9), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`866ed4098`](https://github.com/withastro/astro/commit/866ed4098edffb052239cdb26e076cf8db61b1d9), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf), [`32669cd47`](https://github.com/withastro/astro/commit/32669cd47555e9c7433c3998a2b6e624dfb2d8e9)]:
  - @astrojs/prism@3.0.0
  - astro@3.0.0
  - @astrojs/internal-helpers@0.2.0

## 0.5.0-rc.1

### Minor Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8169](https://github.com/withastro/astro/pull/8169) [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12) Thanks [@bluwy](https://github.com/bluwy)! - Remove pre-shiki v0.14 theme names for compatibility. Please rename to the new theme names to migrate:

  - `material-darker` -> `material-theme-darker`
  - `material-default` -> `material-theme`
  - `material-lighter` -> `material-theme-lighter`
  - `material-ocean` -> `material-theme-ocean`
  - `material-palenight` -> `material-theme-palenight`

### Patch Changes

- Updated dependencies [[`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`582132328`](https://github.com/withastro/astro/commit/5821323285646aee7ff9194a505f708028e4db57), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`95120efbe`](https://github.com/withastro/astro/commit/95120efbe817163663492181cbeb225849354493), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`179796405`](https://github.com/withastro/astro/commit/179796405e053b559d83f84507e5a465861a029a), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf)]:
  - astro@3.0.0-rc.5
  - @astrojs/prism@3.0.0-rc.1
  - @astrojs/internal-helpers@0.2.0-rc.2

## 1.0.0-beta.1

### Patch Changes

- Updated dependencies [[`2aa6d8ace`](https://github.com/withastro/astro/commit/2aa6d8ace398a41c2dec5473521d758816b08191)]:
  - @astrojs/internal-helpers@0.2.0-beta.1
  - astro@3.0.0-beta.2

## 1.0.0-beta.0

### Minor Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

### Patch Changes

- Updated dependencies [[`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81), [`76ddef19c`](https://github.com/withastro/astro/commit/76ddef19ccab6e5f7d3a5740cd41acf10e334b38), [`9b4f70a62`](https://github.com/withastro/astro/commit/9b4f70a629f55e461759ba46f68af7097a2e9215), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`2f951cd40`](https://github.com/withastro/astro/commit/2f951cd403dfcc2c3ca6aae618ae3e1409516e32), [`c022a4217`](https://github.com/withastro/astro/commit/c022a4217a805d223c1494e9eda4e48bbf810388), [`67becaa58`](https://github.com/withastro/astro/commit/67becaa580b8f787df58de66b7008b7098f1209c), [`bc37331d8`](https://github.com/withastro/astro/commit/bc37331d8154e3e95a8df9131e4e014e78a7a9e7), [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8), [`3dc1ca2fa`](https://github.com/withastro/astro/commit/3dc1ca2fac8d9965cc5085a5d09e72ed87b4281a), [`1be84dfee`](https://github.com/withastro/astro/commit/1be84dfee3ce8e6f5cc624f99aec4e980f6fde37), [`35f01df79`](https://github.com/withastro/astro/commit/35f01df797d23315f2bee2fc3fd795adb0559c58), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`78de801f2`](https://github.com/withastro/astro/commit/78de801f21fd4ca1653950027d953bf08614566b), [`59d6e569f`](https://github.com/withastro/astro/commit/59d6e569f63e175c97e82e94aa7974febfb76f7c), [`7723c4cc9`](https://github.com/withastro/astro/commit/7723c4cc93298c2e6530e55da7afda048f22cf81), [`fb5cd6b56`](https://github.com/withastro/astro/commit/fb5cd6b56dc27a71366ed5e1ab8bfe9b8f96bac5), [`631b9c410`](https://github.com/withastro/astro/commit/631b9c410d5d66fa384674027ba95d69ebb5063f)]:
  - @astrojs/prism@3.0.0-beta.0
  - astro@3.0.0-beta.0
  - @astrojs/internal-helpers@0.2.0-beta.0

## 0.4.4

### Patch Changes

- [#7597](https://github.com/withastro/astro/pull/7597) [`7461e82c8`](https://github.com/withastro/astro/commit/7461e82c81438df956861197536f9ceeaf63d6b3) Thanks [@alex-sherwin](https://github.com/alex-sherwin)! - Adds an "allowHTML" Markdoc integration option.

  When enabled, all HTML in Markdoc files will be processed, including HTML elements within Markdoc tags and nodes.

  Enable this feature in the `markdoc` integration configuration:

  ```js
  // astro.config.mjs
  export default defineConfig({
    integrations: [markdoc({ allowHTML: true })],
  });
  ```

- Updated dependencies [[`0f677c009`](https://github.com/withastro/astro/commit/0f677c009d102bc12232a966634136be58f34739), [`188eeddd4`](https://github.com/withastro/astro/commit/188eeddd47a61e04639670496924c37866180749)]:
  - astro@2.9.3

## 0.4.3

### Patch Changes

- [#7706](https://github.com/withastro/astro/pull/7706) [`4f6b5ae2b`](https://github.com/withastro/astro/commit/4f6b5ae2ba8eb162e03f25cbd600a905d434f529) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix Markdoc integration not being able to import `emitESMImage` from Astro

- Updated dependencies [[`72bbfac97`](https://github.com/withastro/astro/commit/72bbfac976c2965a523eea88ff0543e64d848d80), [`d401866f9`](https://github.com/withastro/astro/commit/d401866f93bfe25a50c171bc54b2b1ee0f483cc9), [`4f6b5ae2b`](https://github.com/withastro/astro/commit/4f6b5ae2ba8eb162e03f25cbd600a905d434f529), [`06c255716`](https://github.com/withastro/astro/commit/06c255716ae8e922fb9d4ffa5595cbb34146fff6)]:
  - astro@2.8.5

## 0.4.2

### Patch Changes

- [#7593](https://github.com/withastro/astro/pull/7593) [`c135633bf`](https://github.com/withastro/astro/commit/c135633bf6a84e751249920cba9009f0e394e29a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add a documentation link to the configuration error hint for those migration pre-v0.4.0 config to the latest version.

- [#7599](https://github.com/withastro/astro/pull/7599) [`8df6a423c`](https://github.com/withastro/astro/commit/8df6a423c5088a68cc409b5415b09aff0c10a0f1) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix hyphens in Markdoc tag names causing build failures

- Updated dependencies [[`904921cbe`](https://github.com/withastro/astro/commit/904921cbe44e168477c751774a2e01a6cc972a16), [`3669e2d27`](https://github.com/withastro/astro/commit/3669e2d2762bf8a4909be00ed212a6c5e847eedf), [`831dfd151`](https://github.com/withastro/astro/commit/831dfd1516c8b900ec4a0c151a40121655cdedc6)]:
  - astro@2.8.1

## 0.4.1

### Patch Changes

- [#7575](https://github.com/withastro/astro/pull/7575) [`30d04db98`](https://github.com/withastro/astro/commit/30d04db98107b40669e964c3ec4ac77dc2d65645) Thanks [@bluwy](https://github.com/bluwy)! - Handle internal access change

- Updated dependencies [[`9e5fafa2b`](https://github.com/withastro/astro/commit/9e5fafa2b25b5128084c7072aa282642fcfbb14b), [`9e5fafa2b`](https://github.com/withastro/astro/commit/9e5fafa2b25b5128084c7072aa282642fcfbb14b), [`9e5fafa2b`](https://github.com/withastro/astro/commit/9e5fafa2b25b5128084c7072aa282642fcfbb14b), [`6e9c29579`](https://github.com/withastro/astro/commit/6e9c295799cb6524841adbcbec21ff628d8d19c8), [`9e5fafa2b`](https://github.com/withastro/astro/commit/9e5fafa2b25b5128084c7072aa282642fcfbb14b), [`9e5fafa2b`](https://github.com/withastro/astro/commit/9e5fafa2b25b5128084c7072aa282642fcfbb14b)]:
  - astro@2.8.0

## 0.4.0

### Minor Changes

- [#7468](https://github.com/withastro/astro/pull/7468) [`fb7af5511`](https://github.com/withastro/astro/commit/fb7af551148f5ca6c4f98a4e556c8948c5690919) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Updates the Markdoc config object for rendering Astro components as tags or nodes. Rather than importing components directly, Astro includes a new `component()` function to specify your component path. This unlocks using Astro components from npm packages and `.ts` files.

  ### Migration

  Update all component imports to instead import the new `component()` function and use it to render your Astro components:

  ```diff
  // markdoc.config.mjs
  import {
    defineMarkdocConfig,
  + component,
  } from '@astrojs/markdoc/config';
  - import Aside from './src/components/Aside.astro';

  export default defineMarkdocConfig({
    tags: {
      aside: {
        render: Aside,
  +     render: component('./src/components/Aside.astro'),
      }
    }
  });
  ```

### Patch Changes

- [#7467](https://github.com/withastro/astro/pull/7467) [`f6feff7a2`](https://github.com/withastro/astro/commit/f6feff7a2991fb94e11ee1b70ac606e4c053062b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Restart the dev server whenever your markdoc config changes.

- Updated dependencies [[`6dfd7081b`](https://github.com/withastro/astro/commit/6dfd7081b7a1532ab0fe3af8bcf079b10a5640a9), [`83016795e`](https://github.com/withastro/astro/commit/83016795e9e149bc64e2441d477cf8c65ef5a117), [`d3247851f`](https://github.com/withastro/astro/commit/d3247851f04e911c134cfedc22db17b7d61c53d9), [`a3928016c`](https://github.com/withastro/astro/commit/a3928016cc375842cf47e7a227835cd17e48a409), [`2726098bc`](https://github.com/withastro/astro/commit/2726098bc82f910edda4198b9fb94f2bfd048976), [`f4fea3b02`](https://github.com/withastro/astro/commit/f4fea3b02b0737053c7c7521a7d4dd235648918a)]:
  - astro@2.7.2

## 0.3.3

### Patch Changes

- [#7351](https://github.com/withastro/astro/pull/7351) [`a30f2f3de`](https://github.com/withastro/astro/commit/a30f2f3de440c39c88a4e0ed3f47064a6b5a54f7) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix cloudflare build errors for a bad "./config" entrypoint and "node:crypto" getting included unexpectedly.

- [#7341](https://github.com/withastro/astro/pull/7341) [`491c2db42`](https://github.com/withastro/astro/commit/491c2db424434167327e780ad57b8f665498003d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Improve error message for unsupported Zod transforms from the content config.

- Updated dependencies [[`491c2db42`](https://github.com/withastro/astro/commit/491c2db424434167327e780ad57b8f665498003d), [`0a8d178c9`](https://github.com/withastro/astro/commit/0a8d178c90f033fbba40666c54bcfc58c53ac905)]:
  - astro@2.6.3

## 0.3.2

### Patch Changes

- [#7311](https://github.com/withastro/astro/pull/7311) [`a11b62ee1`](https://github.com/withastro/astro/commit/a11b62ee1f5d524b0ba942818525b623a6d6eb99) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix Markdoc type errors for `render` and `defineMarkdocConfig()` when using a TypeScript Markdoc config file.

- [#7309](https://github.com/withastro/astro/pull/7309) [`2a4bb23b2`](https://github.com/withastro/astro/commit/2a4bb23b2f7f82b3fabdad4d64101fcc778acaa4) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix missing styles and scripts for components when using `document: { render: null }` in the Markdoc config.

- Updated dependencies [[`8034edd9e`](https://github.com/withastro/astro/commit/8034edd9ecf805073395ba7f68f73cd5fc4d2c73)]:
  - astro@2.6.1

## 0.3.1

### Patch Changes

- [#7224](https://github.com/withastro/astro/pull/7224) [`563293c5d`](https://github.com/withastro/astro/commit/563293c5d67e2bf13b9c735581969a0341861b44) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Allow HTML comments `<!--like this-->` in Markdoc files.

- [#7185](https://github.com/withastro/astro/pull/7185) [`339529fc8`](https://github.com/withastro/astro/commit/339529fc820bac2d514b63198ecf54a1d88c0917) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Bring back improved style and script handling across content collection files. This addresses bugs found in a previous release to `@astrojs/markdoc`.

- Updated dependencies [[`6e27f2f6d`](https://github.com/withastro/astro/commit/6e27f2f6dbd52f980c487e875faf1b066f65cffd), [`96ae37eb0`](https://github.com/withastro/astro/commit/96ae37eb09f7406f40fba93e14b2a26ccd46640c), [`fea306936`](https://github.com/withastro/astro/commit/fea30693609cc517d8660972151f4d12a0dd4e82), [`5156c4f90`](https://github.com/withastro/astro/commit/5156c4f90e0922f62d25fa0c82bbefae39f4c2b6), [`9e7366567`](https://github.com/withastro/astro/commit/9e7366567e2b83d46a46db35e74ad508d1978039), [`339529fc8`](https://github.com/withastro/astro/commit/339529fc820bac2d514b63198ecf54a1d88c0917)]:
  - astro@2.5.7

## 0.3.0

### Minor Changes

- [#7244](https://github.com/withastro/astro/pull/7244) [`bef3a75db`](https://github.com/withastro/astro/commit/bef3a75dbc48d584daff9f7f3d5a8937b0356170) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Remove the auto-generated `$entry` variable for Markdoc entries. To access frontmatter as a variable, you can pass `entry.data` as a prop where you render your content:

  ```astro
  ---
  import { getEntry } from 'astro:content';

  const entry = await getEntry('docs', 'why-markdoc');
  const { Content } = await entry.render();
  ---

  <Content frontmatter={entry.data} />
  ```

### Patch Changes

- [#7187](https://github.com/withastro/astro/pull/7187) [`1efaef6be`](https://github.com/withastro/astro/commit/1efaef6be0265c68eac706623778e8ad23b33247) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add support for syntax highlighting with Shiki. Apply to your Markdoc config using the `extends` property:

  ```js
  // markdoc.config.mjs
  import { defineMarkdocConfig } from '@astrojs/markdoc/config';
  import shiki from '@astrojs/markdoc/shiki';

  export default defineMarkdocConfig({
    extends: [
      shiki({
        /** Shiki config options */
      }),
    ],
  });
  ```

  Learn more in the [`@astrojs/markdoc` README.](https://docs.astro.build/en/guides/integrations-guide/markdoc/#syntax-highlighting)

- [#7209](https://github.com/withastro/astro/pull/7209) [`16b836411`](https://github.com/withastro/astro/commit/16b836411980f18c58ca15712d92cec1b3c95670) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add a built-in extension for syntax highlighting with Prism. Apply to your Markdoc config using the `extends` property:

  ```js
  // markdoc.config.mjs
  import { defineMarkdocConfig } from '@astrojs/markdoc/config';
  import prism from '@astrojs/markdoc/prism';

  export default defineMarkdocConfig({
    extends: [prism()],
  });
  ```

  Learn more in the [`@astrojs/markdoc` README.](https://docs.astro.build/en/guides/integrations-guide/markdoc/#syntax-highlighting)

- Updated dependencies [[`8b041bf57`](https://github.com/withastro/astro/commit/8b041bf57c76830c4070330270521e05d8e58474), [`6c7df28ab`](https://github.com/withastro/astro/commit/6c7df28ab34b756b8426443bf6976e24d4611a62), [`ee2aca80a`](https://github.com/withastro/astro/commit/ee2aca80a71afe843af943b11966fcf77f556cfb), [`7851f9258`](https://github.com/withastro/astro/commit/7851f9258fae2f54795470253df9ce4bcd5f9cb0), [`bef3a75db`](https://github.com/withastro/astro/commit/bef3a75dbc48d584daff9f7f3d5a8937b0356170), [`52af9ad18`](https://github.com/withastro/astro/commit/52af9ad18840ffa4e2996386c82cbe34d9fd076a), [`f5063d0a0`](https://github.com/withastro/astro/commit/f5063d0a01e3179da902fdc0a2b22f88cb3c95c7), [`cf621340b`](https://github.com/withastro/astro/commit/cf621340b00fda441f4ef43196c0363d09eae70c), [`2bda7fb0b`](https://github.com/withastro/astro/commit/2bda7fb0bce346f7725086980e1648e2636bbefb), [`af3c5a2e2`](https://github.com/withastro/astro/commit/af3c5a2e25bd3e7b2a3f7f08e41ee457093c8cb1), [`f2f18b440`](https://github.com/withastro/astro/commit/f2f18b44055c6334a39d6379de88fe41e518aa1e)]:
  - astro@2.5.6

## 0.2.3

### Patch Changes

- [#7178](https://github.com/withastro/astro/pull/7178) [`57e65d247`](https://github.com/withastro/astro/commit/57e65d247f67de61bcc3a585c2254feb61ed2e74) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: revert Markdoc asset bleed changes. Production build issues were discovered that deserve a different fix.

- Updated dependencies [[`904131aec`](https://github.com/withastro/astro/commit/904131aec3bacb2824ad60457a45772eba27b5ab), [`57e65d247`](https://github.com/withastro/astro/commit/57e65d247f67de61bcc3a585c2254feb61ed2e74)]:
  - astro@2.5.5

## 0.2.2

### Patch Changes

- [#6758](https://github.com/withastro/astro/pull/6758) [`f558a9e20`](https://github.com/withastro/astro/commit/f558a9e2056fc8f2e2d5814e74f199e398159fc4) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Improve style and script handling across content collection files. This addresses style bleed present in `@astrojs/markdoc` v0.1.0

- Updated dependencies [[`f558a9e20`](https://github.com/withastro/astro/commit/f558a9e2056fc8f2e2d5814e74f199e398159fc4), [`b41963b77`](https://github.com/withastro/astro/commit/b41963b775149b802eea9e12c5fe266bb9a02944)]:
  - astro@2.5.3

## 0.2.1

### Patch Changes

- [#7141](https://github.com/withastro/astro/pull/7141) [`a9e1cd7e5`](https://github.com/withastro/astro/commit/a9e1cd7e58794fe220539c2ed935c9eb96bab55a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix inconsistent Markdoc heading IDs for documents with the same headings.

- Updated dependencies [[`72f686a68`](https://github.com/withastro/astro/commit/72f686a68930de52f9a274c13c98acad59925b31), [`319a0a7a0`](https://github.com/withastro/astro/commit/319a0a7a0a6a950387c942b467746d590bb32fda), [`852d59a8d`](https://github.com/withastro/astro/commit/852d59a8d68e124f10852609e0f1619d5838ac76), [`530fb9ebe`](https://github.com/withastro/astro/commit/530fb9ebee77646921ec29d45d9b66484bdfb521), [`3257dd289`](https://github.com/withastro/astro/commit/3257dd28901c785a6a661211b98c5ef2cb3b9aa4)]:
  - astro@2.5.1

## 0.2.0

### Minor Changes

- [#6850](https://github.com/withastro/astro/pull/6850) [`c6d7ebefd`](https://github.com/withastro/astro/commit/c6d7ebefdd554a9ef29cfeb426ac55cab80d6473) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Content collections now support data formats including JSON and YAML. You can also create relationships, or references, between collections to pull information from one collection entry into another. Learn more on our [updated Content Collections docs](https://docs.astro.build/en/guides/content-collections/).

- [#7095](https://github.com/withastro/astro/pull/7095) [`fb84622af`](https://github.com/withastro/astro/commit/fb84622af04f795de8d17f24192de105f70fe910) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Generate heading `id`s and populate the `headings` property for all Markdoc files

### Patch Changes

- [#7111](https://github.com/withastro/astro/pull/7111) [`6b4fcde37`](https://github.com/withastro/astro/commit/6b4fcde3760140733ad03a162dd0682004c106b2) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: add `headings` to Markdoc `render()` return type.

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

- Updated dependencies [[`4516d7b22`](https://github.com/withastro/astro/commit/4516d7b22c5979cde4537f196b53ae2826ba9561), [`e186ecc5e`](https://github.com/withastro/astro/commit/e186ecc5e292de8c6a2c441a2d588512c0813068), [`c6d7ebefd`](https://github.com/withastro/astro/commit/c6d7ebefdd554a9ef29cfeb426ac55cab80d6473), [`914c439bc`](https://github.com/withastro/astro/commit/914c439bccee9fec002c6d92beaa501c398e62ac), [`e9fc2c221`](https://github.com/withastro/astro/commit/e9fc2c2213036d47cd30a47a6cdad5633481a0f8), [`075eee08f`](https://github.com/withastro/astro/commit/075eee08f2e2b0baea008b97f3523f2cb937ee44), [`719002ca5`](https://github.com/withastro/astro/commit/719002ca5b128744fb4316d4a52c5dcd46a42759), [`fc52681ba`](https://github.com/withastro/astro/commit/fc52681ba2f8fe8bcd92eeedf3c6a52fd86a390e), [`fb84622af`](https://github.com/withastro/astro/commit/fb84622af04f795de8d17f24192de105f70fe910), [`cada10a46`](https://github.com/withastro/astro/commit/cada10a466f81f8edb0aa664f9cffdb6b5b8f307), [`cd410c5eb`](https://github.com/withastro/astro/commit/cd410c5eb71f825259279c27c4c39d0ad282c3f0), [`73ec6f6c1`](https://github.com/withastro/astro/commit/73ec6f6c16cadb71dafe9f664f0debde072c3173), [`410428672`](https://github.com/withastro/astro/commit/410428672ed97bba7ca0b3352c1a7ee564921462), [`763ff2d1e`](https://github.com/withastro/astro/commit/763ff2d1e44f54b899d7c65386f1b4b877c95737), [`c1669c001`](https://github.com/withastro/astro/commit/c1669c0011eecfe65a459d727848c18c189a54ca), [`3d525efc9`](https://github.com/withastro/astro/commit/3d525efc95cfb2deb5d9e04856d02965d66901c9)]:
  - astro@2.5.0

## 0.1.3

### Patch Changes

- [#7045](https://github.com/withastro/astro/pull/7045) [`3a9f72c7f`](https://github.com/withastro/astro/commit/3a9f72c7f30ed173438fd0a222a094e5997b917d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Improve Markdoc validation errors with full message and file preview.

- Updated dependencies [[`48395c815`](https://github.com/withastro/astro/commit/48395c81522f7527126699c4f185f7b4488a4b9a), [`630f8c8ef`](https://github.com/withastro/astro/commit/630f8c8ef68fedfa393899c13a072e50145895e8)]:
  - astro@2.4.4

## 0.1.2

### Patch Changes

- [#6932](https://github.com/withastro/astro/pull/6932) [`49514e4ce`](https://github.com/withastro/astro/commit/49514e4ce40fedb39bf7decd2c296258efbdafc7) Thanks [@bluwy](https://github.com/bluwy)! - Upgrade shiki to v0.14.1. This updates the shiki theme colors and adds the theme name to the `pre` tag, e.g. `<pre class="astro-code github-dark">`.

- Updated dependencies [[`818252acd`](https://github.com/withastro/astro/commit/818252acda3c00499cea51ffa0f26d4c2ccd3a02), [`80e3d4d3d`](https://github.com/withastro/astro/commit/80e3d4d3d0f7719d8eae5435bba3805503057511), [`3326492b9`](https://github.com/withastro/astro/commit/3326492b94f76ed2b0154dd9b9a1a9eb883c1e31), [`cac4a321e`](https://github.com/withastro/astro/commit/cac4a321e814fb805eb0e3ced469e25261a50885), [`831b67cdb`](https://github.com/withastro/astro/commit/831b67cdb8250f93f66e3b171fab024652bf80f2), [`49514e4ce`](https://github.com/withastro/astro/commit/49514e4ce40fedb39bf7decd2c296258efbdafc7), [`0883fd487`](https://github.com/withastro/astro/commit/0883fd4875548a613df122f0b87a1ca8b7a7cf7d)]:
  - astro@2.4.0

## 0.1.1

### Patch Changes

- [#6723](https://github.com/withastro/astro/pull/6723) [`73fcc7627`](https://github.com/withastro/astro/commit/73fcc7627e27a001d3ed2f4d046999d91f1aef85) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: when using `render: null` in your config, content is now rendered without a wrapper element.

- Updated dependencies [[`489dd8d69`](https://github.com/withastro/astro/commit/489dd8d69cdd9d7c243cf8bec96051a914984b9c), [`a1a4f45b5`](https://github.com/withastro/astro/commit/a1a4f45b51a80215fa7598da83bd0d9c5acd20d2), [`a1108e037`](https://github.com/withastro/astro/commit/a1108e037115cdb67d03505286c7d3a4fc2a1ff5), [`8b88e4cf1`](https://github.com/withastro/astro/commit/8b88e4cf15c8bea7942b3985380164e0edf7250b), [`d54cbe413`](https://github.com/withastro/astro/commit/d54cbe41349e55f8544212ad9320705f07325920), [`4c347ab51`](https://github.com/withastro/astro/commit/4c347ab51e46f2319d614f8577fe502e3dc816e2), [`ff0430786`](https://github.com/withastro/astro/commit/ff043078630e678348ae4f4757b3015b3b862c16), [`2f2e572e9`](https://github.com/withastro/astro/commit/2f2e572e937fd25451bbc78a05d55b7caa1ca3ec), [`7116c021a`](https://github.com/withastro/astro/commit/7116c021a39eac15a6e1264dfbd11bef0f5d618a)]:
  - astro@2.2.0

## 0.1.0

### Minor Changes

- [#6653](https://github.com/withastro/astro/pull/6653) [`7c439868a`](https://github.com/withastro/astro/commit/7c439868a3bc7d466418da9af669966014f3d9fe) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Simplify Markdoc configuration with a new `markdoc.config.mjs` file. This lets you import Astro components directly to render as Markdoc tags and nodes, without the need for the previous `components` property. This new configuration also unlocks passing variables to your Markdoc from the `Content` component ([see the new docs](https://docs.astro.build/en/guides/integrations-guide/markdoc/#pass-markdoc-variables)).

  ## Migration

  Move any existing Markdoc config from your `astro.config` to a new `markdoc.config.mjs` file at the root of your project. This should be applied as a default export, with the optional `defineMarkdocConfig()` helper for autocomplete in your editor.

  This example configures an `aside` Markdoc tag. Note that components should be imported and applied to the `render` attribute _directly,_ instead of passing the name as a string:

  ```js
  // markdoc.config.mjs
  import { defineMarkdocConfig } from '@astrojs/markdoc/config';
  import Aside from './src/components/Aside.astro';

  export default defineMarkdocConfig({
    tags: {
      aside: {
        render: Aside,
      },
    },
  });
  ```

  You should also remove the `components` prop from your `Content` components. Since components are imported into your config directly, this is no longer needed.

  ```diff
  ---
  - import Aside from '../components/Aside.astro';
  import { getEntryBySlug } from 'astro:content';

  const entry = await getEntryBySlug('docs', 'why-markdoc');
  const { Content } = await entry.render();
  ---

  <Content
  - components={{ Aside }}
  />
  ```

### Patch Changes

- Updated dependencies [[`1f783e320`](https://github.com/withastro/astro/commit/1f783e32075c20b13063599696644f5d47b75d8d), [`2e92e9aa9`](https://github.com/withastro/astro/commit/2e92e9aa976735c3ddb647152bb9c4850136e386), [`adecda7d6`](https://github.com/withastro/astro/commit/adecda7d6009793c5d20519a997e3b7afb08ad57), [`386336441`](https://github.com/withastro/astro/commit/386336441ad70017eea22db0683591126131db21), [`7c439868a`](https://github.com/withastro/astro/commit/7c439868a3bc7d466418da9af669966014f3d9fe), [`25cd3e574`](https://github.com/withastro/astro/commit/25cd3e574999c1c7294a089ad8c39df27ccdbf17), [`4bf87c64f`](https://github.com/withastro/astro/commit/4bf87c64ff7e9ca49e0f5c27e06bd49faaf60542), [`fc0ed9c53`](https://github.com/withastro/astro/commit/fc0ed9c53cd374860bbdb2503318a55ca09a2662)]:
  - astro@2.1.8

## 0.0.5

### Patch Changes

- [#6630](https://github.com/withastro/astro/pull/6630) [`cfcf2e2ff`](https://github.com/withastro/astro/commit/cfcf2e2ffdaa68ace5c84329c05b83559a29d638) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support automatic image optimization for Markdoc images when using `experimental.assets`. You can [follow our Assets guide](https://docs.astro.build/en/guides/assets/#enabling-assets-in-your-project) to enable this feature in your project. Then, start using relative or aliased image sources in your Markdoc files for automatic optimization:

  ```md
  <!--Relative paths-->

  ![The Milky Way Galaxy](../assets/galaxy.jpg)

  <!--Or configured aliases-->

  ![Houston smiling and looking cute](~/assets/houston-smiling.jpg)
  ```

- Updated dependencies [[`b7194103e`](https://github.com/withastro/astro/commit/b7194103e39267bf59dcd6ba00f522e424219d16), [`cfcf2e2ff`](https://github.com/withastro/astro/commit/cfcf2e2ffdaa68ace5c84329c05b83559a29d638), [`45da39a86`](https://github.com/withastro/astro/commit/45da39a8642d64eb318840b18dfc2b5ccc6561bc), [`7daef9a29`](https://github.com/withastro/astro/commit/7daef9a2993b5d457f3d243a1ebfd1dd383b3327)]:
  - astro@2.1.7

## 0.0.4

### Patch Changes

- [#6588](https://github.com/withastro/astro/pull/6588) [`f42f47dc6`](https://github.com/withastro/astro/commit/f42f47dc6a91cdb6534dab0ecbf9e8e85f00ba40) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Allow access to content collection entry information (including parsed frontmatter and the entry slug) from your Markdoc using the `$entry` variable:

  ```mdx
  ---
  title: Hello Markdoc!
  ---

  # {% $entry.data.title %}
  ```

- [#6607](https://github.com/withastro/astro/pull/6607) [`86273b588`](https://github.com/withastro/astro/commit/86273b5881cc61ebee11d40280b4c0aba8f4bb2e) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: Update Markdoc renderer internals to remove unneeded dependencies

- [#6622](https://github.com/withastro/astro/pull/6622) [`b37b86540`](https://github.com/withastro/astro/commit/b37b865400e77e92878d7e150244acce47e933c6) Thanks [@paulrudy](https://github.com/paulrudy)! - Fix README instructions for installing Markdoc manually.

## 0.0.3

### Patch Changes

- [#6552](https://github.com/withastro/astro/pull/6552) [`392ba3e4d`](https://github.com/withastro/astro/commit/392ba3e4d55f73ce9194bd94a2243f1aa62af079) Thanks [@bluwy](https://github.com/bluwy)! - Fix integration return type

## 0.0.2

### Patch Changes

- [#6494](https://github.com/withastro/astro/pull/6494) [`a13e9d7e3`](https://github.com/withastro/astro/commit/a13e9d7e33baccf51e7d4815f99b481ad174bc57) Thanks [@Yan-Thomas](https://github.com/Yan-Thomas)! - Consistency improvements to several package descriptions

## 0.0.1

### Patch Changes

- [#6209](https://github.com/withastro/astro/pull/6209) [`fec583909`](https://github.com/withastro/astro/commit/fec583909ab62829dc0c1600e2387979365f2b94) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce the (experimental) `@astrojs/markdoc` integration. This unlocks Markdoc inside your Content Collections, bringing support for Astro and UI components in your content. This also improves Astro core internals to make Content Collections extensible to more file types in the future.

  You can install this integration using the `astro add` command:

  ```
  astro add markdoc
  ```

  [Read the `@astrojs/markdoc` documentation](https://docs.astro.build/en/guides/integrations-guide/markdoc/) for usage instructions, and browse the [new `with-markdoc` starter](https://astro.new/with-markdoc) to try for yourself.
