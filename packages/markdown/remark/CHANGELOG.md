# @astrojs/markdown-remark

## 6.1.0

### Minor Changes

- [#12850](https://github.com/withastro/astro/pull/12850) [`db252e0`](https://github.com/withastro/astro/commit/db252e0692a0addf7239bfefc0220c525d63337d) Thanks [@colinbate](https://github.com/colinbate)! - Adds support for TOML frontmatter in `.md` and `.mdx` files

  Astro 5.2 automatically identifies the format of your Markdown and MDX frontmatter based on the delimiter used. With `+++` as a delimiter (instead of the `---` YAML code fence), your frontmatter will automatically be recognized and parsed as [TOML](https://toml.io).

  This is useful for adding existing content files with TOML frontmatter to your project from another framework such as Hugo.

  TOML frontmatter can also be used with [content collections](https://docs.astro.build/guides/content-collections/), and files with different frontmatter languages can live together in the same project.

  No configuration is required to use TOML frontmatter in your content files. Your delimiter will indicate your chosen frontmatter language:

  ```md
  +++
  date = 2025-01-30
  title = 'Use TOML frontmatter in Astro!'
  [author]
  name = 'Colin Bate'
  +++

  # Support for TOML frontmatter is here!
  ```

## 6.0.2

### Patch Changes

- [#12361](https://github.com/withastro/astro/pull/12361) [`3d89e62`](https://github.com/withastro/astro/commit/3d89e6282235a8da45d9ddfe02bcf7ec78056941) Thanks [@LunaticMuch](https://github.com/LunaticMuch)! - Upgrades the `esbuild` version to match `vite`

## 6.0.1

### Patch Changes

- [#12646](https://github.com/withastro/astro/pull/12646) [`f13417b`](https://github.com/withastro/astro/commit/f13417bfbf73130c224752379e2da33084f89554) Thanks [@bluwy](https://github.com/bluwy)! - Avoids parsing frontmatter that are not at the top of a file

- [#12570](https://github.com/withastro/astro/pull/12570) [`87231b1`](https://github.com/withastro/astro/commit/87231b1168da66bb593f681206c42fa555dfcabc) Thanks [@GrimLink](https://github.com/GrimLink)! - Removes trailing new line in code blocks to prevent generating a trailing empty `<span />` tag

- [#12664](https://github.com/withastro/astro/pull/12664) [`a71e9b9`](https://github.com/withastro/astro/commit/a71e9b93b317edc0ded49d4d50f1b7841c8cd428) Thanks [@bluwy](https://github.com/bluwy)! - Fixes frontmatter parsing if file is encoded in UTF8 with BOM

## 6.0.0

### Major Changes

- [#11861](https://github.com/withastro/astro/pull/11861) [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59) Thanks [@bluwy](https://github.com/bluwy)! - Cleans up Astro-specific metadata attached to `vfile.data` in Remark and Rehype plugins. Previously, the metadata was attached in different locations with inconsistent names. The metadata is now renamed as below:

  - `vfile.data.__astroHeadings` -> `vfile.data.astro.headings`
  - `vfile.data.imagePaths` -> `vfile.data.astro.imagePaths`

  The types of `imagePaths` has also been updated from `Set<string>` to `string[]`. The `vfile.data.astro.frontmatter` metadata is left unchanged.

  While we don't consider these APIs public, they can be accessed by Remark and Rehype plugins that want to re-use Astro's metadata. If you are using these APIs, make sure to access them in the new locations.

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

- [#11825](https://github.com/withastro/astro/pull/11825) [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce) Thanks [@bluwy](https://github.com/bluwy)! - Updates return object of `createShikiHighlighter` as `codeToHast` and `codeToHtml` to allow generating either the hast or html string directly

- [#11661](https://github.com/withastro/astro/pull/11661) [`83a2a64`](https://github.com/withastro/astro/commit/83a2a648418ad30f4eb781d1c1b5f2d8a8ac846e) Thanks [@bluwy](https://github.com/bluwy)! - Renames the following CSS variables theme color token names to better align with the Shiki v1 defaults:

  - `--astro-code-color-text` => `--astro-code-foreground`
  - `--astro-code-color-background` => `--astro-code-background`

  You can perform a global find and replace in your project to migrate to the new token names.

- [#11861](https://github.com/withastro/astro/pull/11861) [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59) Thanks [@bluwy](https://github.com/bluwy)! - Removes `InvalidAstroDataError`, `safelyGetAstroData`, and `setVfileFrontmatter` APIs in favour of `isFrontmatterValid`

### Patch Changes

- [#12075](https://github.com/withastro/astro/pull/12075) [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819) Thanks [@bluwy](https://github.com/bluwy)! - Parses frontmatter ourselves

- Updated dependencies [[`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7)]:
  - @astrojs/prism@3.2.0

## 6.0.0-beta.3

### Patch Changes

- Updated dependencies [[`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7)]:
  - @astrojs/prism@3.2.0-beta.0

## 6.0.0-beta.2

### Patch Changes

- [#12075](https://github.com/withastro/astro/pull/12075) [`a19530e`](https://github.com/withastro/astro/commit/a19530e377b7d7afad58a33b23c0a5df1c376819) Thanks [@bluwy](https://github.com/bluwy)! - Parses frontmatter ourselves

## 6.0.0-beta.1

### Major Changes

- [#12008](https://github.com/withastro/astro/pull/12008) [`5608338`](https://github.com/withastro/astro/commit/560833843c6d3ce2b6c6c473ec4ae70e744bf255) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Welcome to the Astro 5 beta! This release has no changes from the latest alpha of this package, but it does bring us one step closer to the final, stable release.

  Starting from this release, no breaking changes will be introduced unless absolutely necessary.

  To learn how to upgrade, check out the [Astro v5.0 upgrade guide in our beta docs site](https://5-0-0-beta.docs.astro.build/en/guides/upgrade-to/v5/).

## 6.0.0-alpha.1

### Major Changes

- [#11861](https://github.com/withastro/astro/pull/11861) [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59) Thanks [@bluwy](https://github.com/bluwy)! - Cleans up Astro-specific metadata attached to `vfile.data` in Remark and Rehype plugins. Previously, the metadata was attached in different locations with inconsistent names. The metadata is now renamed as below:

  - `vfile.data.__astroHeadings` -> `vfile.data.astro.headings`
  - `vfile.data.imagePaths` -> `vfile.data.astro.imagePaths`

  The types of `imagePaths` has also been updated from `Set<string>` to `string[]`. The `vfile.data.astro.frontmatter` metadata is left unchanged.

  While we don't consider these APIs public, they can be accessed by Remark and Rehype plugins that want to re-use Astro's metadata. If you are using these APIs, make sure to access them in the new locations.

- [#11825](https://github.com/withastro/astro/pull/11825) [`560ef15`](https://github.com/withastro/astro/commit/560ef15ad23bd137b56ef1048eb2df548b99fdce) Thanks [@bluwy](https://github.com/bluwy)! - Updates return object of `createShikiHighlighter` as `codeToHast` and `codeToHtml` to allow generating either the hast or html string directly

- [#11861](https://github.com/withastro/astro/pull/11861) [`3ab3b4e`](https://github.com/withastro/astro/commit/3ab3b4efbcdd2aabea5f949deedf51a5acefae59) Thanks [@bluwy](https://github.com/bluwy)! - Removes `InvalidAstroDataError`, `safelyGetAstroData`, and `setVfileFrontmatter` APIs in favour of `isFrontmatterValid`

## 6.0.0-alpha.0

### Major Changes

- [#11661](https://github.com/withastro/astro/pull/11661) [`83a2a64`](https://github.com/withastro/astro/commit/83a2a648418ad30f4eb781d1c1b5f2d8a8ac846e) Thanks [@bluwy](https://github.com/bluwy)! - Renames the following CSS variables theme color token names to better align with the Shiki v1 defaults:

  - `--astro-code-color-text` => `--astro-code-foreground`
  - `--astro-code-color-background` => `--astro-code-background`

  You can perform a global find and replace in your project to migrate to the new token names.

## 5.3.0

### Minor Changes

- [#12039](https://github.com/withastro/astro/pull/12039) [`710a1a1`](https://github.com/withastro/astro/commit/710a1a11f488ff6ed3da6d3e0723b2322ccfe27b) Thanks [@ematipico](https://github.com/ematipico)! - Adds a `markdown.shikiConfig.langAlias` option that allows [aliasing a non-supported code language to a known language](https://shiki.style/guide/load-lang#custom-language-aliases). This is useful when the language of your code samples is not [a built-in Shiki language](https://shiki.style/languages), but you want your Markdown source to contain an accurate language while also displaying syntax highlighting.

  The following example configures Shiki to highlight `cjs` code blocks using the `javascript` syntax highlighter:

  ```js
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    markdown: {
      shikiConfig: {
        langAlias: {
          cjs: 'javascript',
        },
      },
    },
  });
  ```

  Then in your Markdown, you can use the alias as the language for a code block for syntax highlighting:

  ````md
  ```cjs
  'use strict';

  function commonJs() {
    return 'I am a commonjs file';
  }
  ```
  ````

## 5.2.0

### Minor Changes

- [#11341](https://github.com/withastro/astro/pull/11341) [`49b5145`](https://github.com/withastro/astro/commit/49b5145158a603b9bb951bf914a6a9780c218704) Thanks [@madcampos](https://github.com/madcampos)! - Adds support for [Shiki's `defaultColor` option](https://shiki.style/guide/dual-themes#without-default-color).

  This option allows you to override the values of a theme's inline style, adding only CSS variables to give you more flexibility in applying multiple color themes.

  Configure `defaultColor: false` in your Shiki config to apply throughout your site, or pass to Astro's built-in `<Code>` component to style an individual code block.

  ```js title="astro.config.mjs"
  import { defineConfig } from 'astro/config';
  export default defineConfig({
    markdown: {
      shikiConfig: {
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
        defaultColor: false,
      },
    },
  });
  ```

  ```astro
  ---
  import { Code } from 'astro:components';
  ---

  <Code code={`const useMyColors = true`} lang="js" defaultColor={false} />
  ```

## 5.1.1

### Patch Changes

- [#11310](https://github.com/withastro/astro/pull/11310) [`b6afe6a`](https://github.com/withastro/astro/commit/b6afe6a782f68f4a279463a144baaf99cb96b6dc) Thanks [@bluwy](https://github.com/bluwy)! - Handles encoded image paths in internal rehype plugins and return decoded paths from markdown vfile's `data.imagePaths`

## 5.1.0

### Minor Changes

- [#10538](https://github.com/withastro/astro/pull/10538) [`ccafa8d230f65c9302421a0ce0a0adc5824bfd55`](https://github.com/withastro/astro/commit/ccafa8d230f65c9302421a0ce0a0adc5824bfd55) Thanks [@604qgc](https://github.com/604qgc)! - Adds a `data-language` attribute on the rendered `pre` elements to expose the highlighted syntax language.

  For example, the following Markdown code block will expose `data-language="python"`:

  ````
  \```python
  def func():
      print('Hello Astro!')
  \```
  ````

  This allows retrieving the language in a rehype plugin from `node.properties.dataLanguage` by accessing the `<pre>` element using `{ tagName: "pre" }`:

  ```js
  // myRehypePre.js
  import { visit } from "unist-util-visit";
  export default function myRehypePre() {
    return (tree) => {
      visit(tree, { tagName: "pre" }, (node) => {
        const lang = node.properties.dataLanguage;
        [...]
      });
    };
  }
  ```

  Note: The `<pre>` element is not exposed when using Astro's `<Code />` component which outputs flattened HTML.

  The `data-language` attribute may also be used in css rules:

  ```css
  pre::before {
    content: attr(data-language);
  }

  pre[data-language='javascript'] {
    font-size: 2rem;
  }
  ```

### Patch Changes

- Updated dependencies [[`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99)]:
  - @astrojs/prism@3.1.0

## 5.0.0

### Major Changes

- [#10629](https://github.com/withastro/astro/pull/10629) [`2cf116f80cb5e421ab5cc5eb4a654e7b78c1b8de`](https://github.com/withastro/astro/commit/2cf116f80cb5e421ab5cc5eb4a654e7b78c1b8de) Thanks [@bluwy](https://github.com/bluwy)! - Removes deprecated APIs including `remarkShiki`, `remarkPrism`, `replaceCssVariables` and several unused types

- [#10618](https://github.com/withastro/astro/pull/10618) [`374efcdff9625ca43309d89e3b9cfc9174351512`](https://github.com/withastro/astro/commit/374efcdff9625ca43309d89e3b9cfc9174351512) Thanks [@43081j](https://github.com/43081j)! - Updates Shiki syntax highlighting to lazily load shiki languages by default (only preloading `plaintext`). Additionally, the `createShikiHighlighter()` API now returns an asynchronous `highlight()` function due to this.

## 4.3.2

### Patch Changes

- [#10540](https://github.com/withastro/astro/pull/10540) [`c585528f446ccca3d4c643f4af5d550b93c18902`](https://github.com/withastro/astro/commit/c585528f446ccca3d4c643f4af5d550b93c18902) Thanks [@imkunet](https://github.com/imkunet)! - This patch allows Shiki to use all of its reserved languages instead of the
  previous behavior of forcing unknown languages to plaintext.

## 4.3.1

### Patch Changes

- [#10494](https://github.com/withastro/astro/pull/10494) [`19e42c368184013fc30d1e46753b9e9383bb2bdf`](https://github.com/withastro/astro/commit/19e42c368184013fc30d1e46753b9e9383bb2bdf) Thanks [@bluwy](https://github.com/bluwy)! - Fixes support for Shiki transformers that access the `meta` to conditionally perform transformations

## 4.3.0

### Minor Changes

- [#9960](https://github.com/withastro/astro/pull/9960) [`c081adf998d30419fed97d8fccc11340cdc512e0`](https://github.com/withastro/astro/commit/c081adf998d30419fed97d8fccc11340cdc512e0) Thanks [@StandardGage](https://github.com/StandardGage)! - Allows passing any props to the `<Code />` component

- [#10130](https://github.com/withastro/astro/pull/10130) [`5a9528741fa98d017b269c7e4f013058028bdc5d`](https://github.com/withastro/astro/commit/5a9528741fa98d017b269c7e4f013058028bdc5d) Thanks [@bluwy](https://github.com/bluwy)! - Migrates `shikiji` to `shiki` 1.0

- [#10104](https://github.com/withastro/astro/pull/10104) [`a31bbd7ff8f3ec62ee507f72d1d25140b82ffc18`](https://github.com/withastro/astro/commit/a31bbd7ff8f3ec62ee507f72d1d25140b82ffc18) Thanks [@remcohaszing](https://github.com/remcohaszing)! - Changes Astro's internal syntax highlighting to use rehype plugins instead of remark plugins. This provides better interoperability with other [rehype plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md#list-of-plugins) that deal with code blocks, in particular with third party syntax highlighting plugins and [`rehype-mermaid`](https://github.com/remcohaszing/rehype-mermaid).

  This may be a breaking change if you are currently using:

  - a remark plugin that relies on nodes of type `html`
  - a rehype plugin that depends on nodes of type `raw`.

  Please review your rendered code samples carefully, and if necessary, consider using a rehype plugin that deals with the generated `element` nodes instead. You can transform the AST of raw HTML strings, or alternatively use [`hast-util-to-html`](https://github.com/syntax-tree/hast-util-to-html) to get a string from a `raw` node.

## 4.2.1

### Patch Changes

- [#9866](https://github.com/withastro/astro/pull/9866) [`44c957f893c6bf5f5b7c78301de7b21c5975584d`](https://github.com/withastro/astro/commit/44c957f893c6bf5f5b7c78301de7b21c5975584d) Thanks [@ktym4a](https://github.com/ktym4a)! - Fixes a bug where non-UTF-8 file names are not displayed when using relative paths in markdowns.

## 4.2.0

### Minor Changes

- [#9738](https://github.com/withastro/astro/pull/9738) [`a505190933365268d48139a5f197a3cfb5570870`](https://github.com/withastro/astro/commit/a505190933365268d48139a5f197a3cfb5570870) Thanks [@bluwy](https://github.com/bluwy)! - Fixes usage in browser environments by using subpath imports

### Patch Changes

- [#9736](https://github.com/withastro/astro/pull/9736) [`53c69dcc82cdf4000aff13a6c11fffe19096cf45`](https://github.com/withastro/astro/commit/53c69dcc82cdf4000aff13a6c11fffe19096cf45) Thanks [@bluwy](https://github.com/bluwy)! - Initializes internal `cwdUrlStr` variable lazily for performance, and workaround Rollup side-effect detection bug when building for non-Node runtimes

- [#9723](https://github.com/withastro/astro/pull/9723) [`2f81cffa9da9db0e2802d303f94feaee8d2f54ec`](https://github.com/withastro/astro/commit/2f81cffa9da9db0e2802d303f94feaee8d2f54ec) Thanks [@blackmann](https://github.com/blackmann)! - Fixes a case where transformers wouldn't work on the `class` property

## 4.1.0

### Minor Changes

- [#9566](https://github.com/withastro/astro/pull/9566) [`165cfc154be477337037185c32b308616d1ed6fa`](https://github.com/withastro/astro/commit/165cfc154be477337037185c32b308616d1ed6fa) Thanks [@OliverSpeir](https://github.com/OliverSpeir)! - Allows remark plugins to pass options specifying how images in `.md` files will be optimized

- [#9643](https://github.com/withastro/astro/pull/9643) [`e9a72d9a91a3741566866bcaab11172cb0dc7d31`](https://github.com/withastro/astro/commit/e9a72d9a91a3741566866bcaab11172cb0dc7d31) Thanks [@blackmann](https://github.com/blackmann)! - Adds a new `markdown.shikiConfig.transformers` config option. You can use this option to transform the Shikiji hast (AST format of the generated HTML) to customize the final HTML. Also updates Shikiji to the latest stable version.

  See [Shikiji's documentation](https://shikiji.netlify.app/guide/transformers) for more details about creating your own custom transformers, and [a list of common transformers](https://shikiji.netlify.app/packages/transformers) you can add directly to your project.

## 4.0.1

### Patch Changes

- [#9349](https://github.com/withastro/astro/pull/9349) [`270c6cc27`](https://github.com/withastro/astro/commit/270c6cc27f20995883fcdabbff9b56d7f041f9e4) Thanks [@lilnasy](https://github.com/lilnasy)! - Fixes an issue where this package could not be installed alongside Astro 4.0.

## 4.0.0

### Major Changes

- [#9138](https://github.com/withastro/astro/pull/9138) [`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3) Thanks [@bluwy](https://github.com/bluwy)! - Updates the unified, remark, and rehype dependencies to latest. Make sure to update your custom remark and rehype plugins as well to be compatible with the latest versions.

  **Potentially breaking change:** The default value of `markdown.remarkRehype.footnoteBackLabel` is changed from `"Back to content"` to `"Back to reference 1"`. See the `mdast-util-to-hast` [commit](https://github.com/syntax-tree/mdast-util-to-hast/commit/56c88e45690be138fad9f0bf367b939d09816863) for more information.

- [#9182](https://github.com/withastro/astro/pull/9182) [`c7953645e`](https://github.com/withastro/astro/commit/c7953645eeaaf9e87c6db4494b0023d2c1878ff0) Thanks [@bluwy](https://github.com/bluwy)! - Removes deprecated APIs. All Astro packages had been refactored to not use these APIs.

### Patch Changes

- [#9147](https://github.com/withastro/astro/pull/9147) [`addb57c8e`](https://github.com/withastro/astro/commit/addb57c8e80b7b67ec61224666f3a1db5c44410c) Thanks [@bluwy](https://github.com/bluwy)! - Fixes `RemarkRehype` type's `handler` and `handlers` properties

## 4.0.0-beta.0

### Major Changes

- [#9138](https://github.com/withastro/astro/pull/9138) [`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3) Thanks [@bluwy](https://github.com/bluwy)! - Updates the unified, remark, and rehype dependencies to latest. Make sure to update your custom remark and rehype plugins as well to be compatible with the latest versions.

  **Potentially breaking change:** The default value of `markdown.remarkRehype.footnoteBackLabel` is changed from `"Back to content"` to `"Back to reference 1"`. See the `mdast-util-to-hast` [commit](https://github.com/syntax-tree/mdast-util-to-hast/commit/56c88e45690be138fad9f0bf367b939d09816863) for more information.

- [#9182](https://github.com/withastro/astro/pull/9182) [`c7953645e`](https://github.com/withastro/astro/commit/c7953645eeaaf9e87c6db4494b0023d2c1878ff0) Thanks [@bluwy](https://github.com/bluwy)! - Removes deprecated APIs. All Astro packages had been refactored to not use these APIs.

### Patch Changes

- [#9147](https://github.com/withastro/astro/pull/9147) [`addb57c8e`](https://github.com/withastro/astro/commit/addb57c8e80b7b67ec61224666f3a1db5c44410c) Thanks [@bluwy](https://github.com/bluwy)! - Fixes `RemarkRehype` type's `handler` and `handlers` properties

- Updated dependencies [[`abf601233`](https://github.com/withastro/astro/commit/abf601233f8188d118a8cb063c777478d8d9f1a3), [`6201bbe96`](https://github.com/withastro/astro/commit/6201bbe96c2a083fb201e4a43a9bd88499821a3e), [`cdabf6ef0`](https://github.com/withastro/astro/commit/cdabf6ef02be7220fd2b6bdcef924ceca089381e), [`1c48ed286`](https://github.com/withastro/astro/commit/1c48ed286538ab9e354eca4e4dcd7c6385c96721), [`37697a2c5`](https://github.com/withastro/astro/commit/37697a2c5511572dc29c0a4ea46f90c2f62be8e6), [`bd0c2e9ae`](https://github.com/withastro/astro/commit/bd0c2e9ae3389a9d3085050c1e8134ae98dff299), [`0fe3a7ed5`](https://github.com/withastro/astro/commit/0fe3a7ed5d7bb1a9fce1623e84ba14104b51223c), [`710be505c`](https://github.com/withastro/astro/commit/710be505c9ddf416e77a75343d8cae9c497d72c6), [`153a5abb9`](https://github.com/withastro/astro/commit/153a5abb905042ac68b712514dc9ec387d3e6b17)]:
  - astro@4.0.0-beta.0

## 3.5.0

### Minor Changes

- [#9083](https://github.com/withastro/astro/pull/9083) [`4537ecf0d`](https://github.com/withastro/astro/commit/4537ecf0d060f89cb8c000338a7fc5f4197a88c8) Thanks [@bluwy](https://github.com/bluwy)! - Exports `createShikiHighlighter` for low-level syntax highlighting usage

## 3.4.0

### Minor Changes

- [#8903](https://github.com/withastro/astro/pull/8903) [`c5010aad3`](https://github.com/withastro/astro/commit/c5010aad3475669648dc939e00f88bbb52489d0d) Thanks [@horo-fox](https://github.com/horo-fox)! - Adds experimental support for multiple shiki themes with the new `markdown.shikiConfig.experimentalThemes` option.

## 3.3.0

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

## 3.2.1

### Patch Changes

- [#8715](https://github.com/withastro/astro/pull/8715) [`21f482657`](https://github.com/withastro/astro/commit/21f4826576c2c812a1604e18717799da3470decd) Thanks [@cprass](https://github.com/cprass)! - Remove `is:raw` from remark Shiki plugin

- [#8737](https://github.com/withastro/astro/pull/8737) [`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c) Thanks [@ematipico](https://github.com/ematipico)! - Add provenance statement when publishing the library from CI

- Updated dependencies [[`6f60da805`](https://github.com/withastro/astro/commit/6f60da805e0014bc50dd07bef972e91c73560c3c), [`d78806dfe`](https://github.com/withastro/astro/commit/d78806dfe0301ea7ffe6c7c1f783bd415ac7cda9), [`d1c75fe15`](https://github.com/withastro/astro/commit/d1c75fe158839699c59728cf3a83888e8c72a459), [`aa265d730`](https://github.com/withastro/astro/commit/aa265d73024422967c1b1c68ad268c419c6c798f), [`78adbc443`](https://github.com/withastro/astro/commit/78adbc4433208458291e36713909762e148e1e5d), [`21e0757ea`](https://github.com/withastro/astro/commit/21e0757ea22a57d344c934045ca19db93b684436), [`357270f2a`](https://github.com/withastro/astro/commit/357270f2a3d0bf2aa634ba7e52e9d17618eff4a7)]:
  - astro@3.2.3

## 3.2.0

### Minor Changes

- [#8475](https://github.com/withastro/astro/pull/8475) [`d93987824`](https://github.com/withastro/astro/commit/d93987824d3d6b4f58267be21ab8466ee8d5d5f8) Thanks [@webpro](https://github.com/webpro)! - feat(markdown): Add support for `imageReference` paths when collecting images

- [#8532](https://github.com/withastro/astro/pull/8532) [`7522bb491`](https://github.com/withastro/astro/commit/7522bb4914f2f9e8b8f3c743bc9c941fd3aca644) Thanks [@bluwy](https://github.com/bluwy)! - Export `createMarkdownProcessor` and deprecate `renderMarkdown` API

### Patch Changes

- Updated dependencies [[`7522bb491`](https://github.com/withastro/astro/commit/7522bb4914f2f9e8b8f3c743bc9c941fd3aca644), [`ecc65abbf`](https://github.com/withastro/astro/commit/ecc65abbf9e086c5bbd1973cd4a820082b4e0dc5), [`2c4fc878b`](https://github.com/withastro/astro/commit/2c4fc878bece36b7fcf1470419c7ce6f1e1e95d0), [`c92e0acd7`](https://github.com/withastro/astro/commit/c92e0acd715171b3f4c3294099780e21576648c8), [`f95febf96`](https://github.com/withastro/astro/commit/f95febf96bb97babb28d78994332f5e47f5f637d), [`b85c8a78a`](https://github.com/withastro/astro/commit/b85c8a78a116dbbddc901438bc0b7a1917dc0238), [`45364c345`](https://github.com/withastro/astro/commit/45364c345267429e400baecd1fbc290503f8b13a)]:
  - astro@3.1.0

## 3.1.0

### Minor Changes

- [#8430](https://github.com/withastro/astro/pull/8430) [`f3f62a5a2`](https://github.com/withastro/astro/commit/f3f62a5a20f4881bb04f65f192df8e1ccf7fb601) Thanks [@bluwy](https://github.com/bluwy)! - Export remarkShiki and remarkPrism plugins

### Patch Changes

- Updated dependencies [[`f66053a1e`](https://github.com/withastro/astro/commit/f66053a1ea0a4e3bdb0b0df12bb1bf56e1ea2618), [`0fa483283`](https://github.com/withastro/astro/commit/0fa483283e54c94f173838cd558dc0dbdd11e699)]:
  - astro@3.0.11

## 3.0.0

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

- [#8169](https://github.com/withastro/astro/pull/8169) [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12) Thanks [@bluwy](https://github.com/bluwy)! - Remove pre-shiki v0.14 theme names for compatibility. Please rename to the new theme names to migrate:

  - `material-darker` -> `material-theme-darker`
  - `material-default` -> `material-theme`
  - `material-lighter` -> `material-theme-lighter`
  - `material-ocean` -> `material-theme-ocean`
  - `material-palenight` -> `material-theme-palenight`

### Patch Changes

- Updated dependencies [[`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312), [`db39206cb`](https://github.com/withastro/astro/commit/db39206cbb85b034859ac416179f141184bb2bff), [`adf9fccfd`](https://github.com/withastro/astro/commit/adf9fccfdda107c2224558f1c2e6a77847ac0a8a), [`0c7b42dc6`](https://github.com/withastro/astro/commit/0c7b42dc6780e687e416137539f55a3a427d1d10), [`46c4c0e05`](https://github.com/withastro/astro/commit/46c4c0e053f830585b9ef229ce1c259df00a80f8), [`364d861bd`](https://github.com/withastro/astro/commit/364d861bd527b8511968e2837728148f090bedef), [`2484dc408`](https://github.com/withastro/astro/commit/2484dc4080e5cd84b9a53648a1de426d7c907be2), [`81545197a`](https://github.com/withastro/astro/commit/81545197a32fd015d763fc386c8b67e0e08b7393), [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7), [`c2c71d90c`](https://github.com/withastro/astro/commit/c2c71d90c264a2524f99e0373ab59015f23ad4b1), [`cd2d7e769`](https://github.com/withastro/astro/commit/cd2d7e76981ef9b9013453aa2629838e1e9fd422), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`e45f30293`](https://github.com/withastro/astro/commit/e45f3029340db718b6ed7e91b5d14f5cf14cd71d), [`c0de7a7b0`](https://github.com/withastro/astro/commit/c0de7a7b0f042cd49cbea4f4ac1b2ab6f9fef644), [`65c354969`](https://github.com/withastro/astro/commit/65c354969e6fe0ef6d622e8f4c545e2f717ce8c6), [`3c3100851`](https://github.com/withastro/astro/commit/3c31008519ce68b5b1b1cb23b71fbe0a2d506882), [`34cb20021`](https://github.com/withastro/astro/commit/34cb2002161ba88df6bcb72fecfd12ed867c134b), [`a824863ab`](https://github.com/withastro/astro/commit/a824863ab1c451f4068eac54f28dd240573e1cba), [`44f7a2872`](https://github.com/withastro/astro/commit/44f7a28728c56c04ac377b6e917329f324874043), [`1048aca55`](https://github.com/withastro/astro/commit/1048aca550769415e528016e42b358ffbfd44b61), [`be6bbd2c8`](https://github.com/withastro/astro/commit/be6bbd2c86b9bf5268e765bb937dda00ff15781a), [`9e021a91c`](https://github.com/withastro/astro/commit/9e021a91c57d10809f588dd47968fc0e7f8b4d5c), [`7511a4980`](https://github.com/withastro/astro/commit/7511a4980fd36536464c317de33a5190427f430a), [`c37632a20`](https://github.com/withastro/astro/commit/c37632a20d06164fb97a4c2fc48df6d960398832), [`acf652fc1`](https://github.com/withastro/astro/commit/acf652fc1d5db166231e87e22d0d50444f5556d8), [`42785c7b7`](https://github.com/withastro/astro/commit/42785c7b784b151e6d582570e5d74482129e8eb8), [`8450379db`](https://github.com/withastro/astro/commit/8450379db854fb1eaa9f38f21d65db240bc616cd), [`dbc97b121`](https://github.com/withastro/astro/commit/dbc97b121f42583728f1cdfdbf14575fda943f5b), [`7d2f311d4`](https://github.com/withastro/astro/commit/7d2f311d428e3d1c8c13b9bf2a708d6435713fc2), [`2540feedb`](https://github.com/withastro/astro/commit/2540feedb06785d5a20eecc3668849f147d778d4), [`ea7ff5177`](https://github.com/withastro/astro/commit/ea7ff5177dbcd7b2508cb1eef1b22b8ee1f47079), [`68efd4a8b`](https://github.com/withastro/astro/commit/68efd4a8b29f248397667801465b3152dc98e9a7), [`7bd1b86f8`](https://github.com/withastro/astro/commit/7bd1b86f85c06fdde0a1ed9146d01bac69990671), [`036388f66`](https://github.com/withastro/astro/commit/036388f66dab68ad54b895ed86f9176958dd83c8), [`519a1c4e8`](https://github.com/withastro/astro/commit/519a1c4e8407c7abcb8d879b67a9f4b960652cae), [`1f58a7a1b`](https://github.com/withastro/astro/commit/1f58a7a1bea6888868b689dac94801d554319b02), [`2ae9d37f0`](https://github.com/withastro/astro/commit/2ae9d37f0a9cb21ab288d3c30aecb6d84db87788), [`a8f35777e`](https://github.com/withastro/astro/commit/a8f35777e7e322068a4e2f520c2c9e43ade19e58), [`70f34f5a3`](https://github.com/withastro/astro/commit/70f34f5a355f42526ee9e5355f3de8e510002ea2), [`5208a3c8f`](https://github.com/withastro/astro/commit/5208a3c8fefcec7694857fb344af351f4631fc34), [`84af8ed9d`](https://github.com/withastro/astro/commit/84af8ed9d1e6401c6ebc9c60fe8cddb44d5044b0), [`f003e7364`](https://github.com/withastro/astro/commit/f003e7364317cafdb8589913b26b28e928dd07c9), [`ffc9e2d3d`](https://github.com/withastro/astro/commit/ffc9e2d3de46049bf3d82140ef018f524fb03187), [`732111cdc`](https://github.com/withastro/astro/commit/732111cdce441639db31f40f621df48442d00969), [`0f637c71e`](https://github.com/withastro/astro/commit/0f637c71e511cb4c51712128d217a26c8eee4d40), [`33b8910cf`](https://github.com/withastro/astro/commit/33b8910cfdce5713891c50a84a0a8fe926311710), [`8a5b0c1f3`](https://github.com/withastro/astro/commit/8a5b0c1f3a4be6bb62db66ec70144109ff5b4c59), [`148e61d24`](https://github.com/withastro/astro/commit/148e61d2492456811f8a3c8daaab1c3429a2ffdc), [`e79e3779d`](https://github.com/withastro/astro/commit/e79e3779df0ad35253abcdb931d622847d9adb12), [`632579dc2`](https://github.com/withastro/astro/commit/632579dc2094cc342929261c89e689f0dd358284), [`3674584e0`](https://github.com/withastro/astro/commit/3674584e02b161a698b429ceb66723918fdc56ac), [`1db4e92c1`](https://github.com/withastro/astro/commit/1db4e92c12ed73681217f5cefd39f2f47542f961), [`e7f872e91`](https://github.com/withastro/astro/commit/e7f872e91e852b901cf221a5151077dec64305bf), [`16f09dfff`](https://github.com/withastro/astro/commit/16f09dfff7722fda99dd0412e3006a7a39c80829), [`4477bb41c`](https://github.com/withastro/astro/commit/4477bb41c8ed688785c545731ef5b184b629f4e5), [`55c10d1d5`](https://github.com/withastro/astro/commit/55c10d1d564e805efc3c1a7c48e0d9a1cdf0c7ed), [`3e834293d`](https://github.com/withastro/astro/commit/3e834293d47ab2761a7aa013916e8371871efb7f), [`96beb883a`](https://github.com/withastro/astro/commit/96beb883ad87f8bbf5b2f57e14a743763d2a6f58), [`997a0db8a`](https://github.com/withastro/astro/commit/997a0db8a4e3851edd69384cf5eadbb969e1d547), [`80f1494cd`](https://github.com/withastro/astro/commit/80f1494cdaf72e58a420adb4f7c712d4089e1923), [`0f0625504`](https://github.com/withastro/astro/commit/0f0625504145f18cba7dc6cf20291cb2abddc5a9), [`e1ae56e72`](https://github.com/withastro/astro/commit/e1ae56e724d0f83db1230359e06cd6bc26f5fa26), [`f32d093a2`](https://github.com/withastro/astro/commit/f32d093a280faafff024228c12bb438156ec34d7), [`f01eb585e`](https://github.com/withastro/astro/commit/f01eb585e7c972d940761309b1595f682b6922d2), [`b76c166bd`](https://github.com/withastro/astro/commit/b76c166bdd8e28683f62806aef968d1e0c3b06d9), [`a87cbe400`](https://github.com/withastro/astro/commit/a87cbe400314341d5f72abf86ea264e6b47c091f), [`866ed4098`](https://github.com/withastro/astro/commit/866ed4098edffb052239cdb26e076cf8db61b1d9), [`767eb6866`](https://github.com/withastro/astro/commit/767eb68666eb777965baa0d6ade20bbafecf95bf), [`32669cd47`](https://github.com/withastro/astro/commit/32669cd47555e9c7433c3998a2b6e624dfb2d8e9)]:
  - @astrojs/prism@3.0.0
  - astro@3.0.0

## 3.0.0-rc.1

### Major Changes

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

## 3.0.0-beta.0

### Patch Changes

- Updated dependencies [[`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81), [`76ddef19c`](https://github.com/withastro/astro/commit/76ddef19ccab6e5f7d3a5740cd41acf10e334b38), [`9b4f70a62`](https://github.com/withastro/astro/commit/9b4f70a629f55e461759ba46f68af7097a2e9215), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`2f951cd40`](https://github.com/withastro/astro/commit/2f951cd403dfcc2c3ca6aae618ae3e1409516e32), [`c022a4217`](https://github.com/withastro/astro/commit/c022a4217a805d223c1494e9eda4e48bbf810388), [`67becaa58`](https://github.com/withastro/astro/commit/67becaa580b8f787df58de66b7008b7098f1209c), [`bc37331d8`](https://github.com/withastro/astro/commit/bc37331d8154e3e95a8df9131e4e014e78a7a9e7), [`dfc2d93e3`](https://github.com/withastro/astro/commit/dfc2d93e3c645995379358fabbdfa9aab99f43d8), [`3dc1ca2fa`](https://github.com/withastro/astro/commit/3dc1ca2fac8d9965cc5085a5d09e72ed87b4281a), [`1be84dfee`](https://github.com/withastro/astro/commit/1be84dfee3ce8e6f5cc624f99aec4e980f6fde37), [`35f01df79`](https://github.com/withastro/astro/commit/35f01df797d23315f2bee2fc3fd795adb0559c58), [`3fdf509b2`](https://github.com/withastro/astro/commit/3fdf509b2731a9b2f972d89291e57cf78d62c769), [`78de801f2`](https://github.com/withastro/astro/commit/78de801f21fd4ca1653950027d953bf08614566b), [`59d6e569f`](https://github.com/withastro/astro/commit/59d6e569f63e175c97e82e94aa7974febfb76f7c), [`7723c4cc9`](https://github.com/withastro/astro/commit/7723c4cc93298c2e6530e55da7afda048f22cf81), [`fb5cd6b56`](https://github.com/withastro/astro/commit/fb5cd6b56dc27a71366ed5e1ab8bfe9b8f96bac5), [`631b9c410`](https://github.com/withastro/astro/commit/631b9c410d5d66fa384674027ba95d69ebb5063f)]:
  - @astrojs/prism@3.0.0-beta.0
  - astro@3.0.0-beta.0

## 2.2.1

### Patch Changes

- [#7104](https://github.com/withastro/astro/pull/7104) [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa) Thanks [@bluwy](https://github.com/bluwy)! - Specify `"files"` field to only publish necessary files

- Updated dependencies [[`4516d7b22`](https://github.com/withastro/astro/commit/4516d7b22c5979cde4537f196b53ae2826ba9561), [`e186ecc5e`](https://github.com/withastro/astro/commit/e186ecc5e292de8c6a2c441a2d588512c0813068), [`c6d7ebefd`](https://github.com/withastro/astro/commit/c6d7ebefdd554a9ef29cfeb426ac55cab80d6473), [`914c439bc`](https://github.com/withastro/astro/commit/914c439bccee9fec002c6d92beaa501c398e62ac), [`e9fc2c221`](https://github.com/withastro/astro/commit/e9fc2c2213036d47cd30a47a6cdad5633481a0f8), [`075eee08f`](https://github.com/withastro/astro/commit/075eee08f2e2b0baea008b97f3523f2cb937ee44), [`719002ca5`](https://github.com/withastro/astro/commit/719002ca5b128744fb4316d4a52c5dcd46a42759), [`fc52681ba`](https://github.com/withastro/astro/commit/fc52681ba2f8fe8bcd92eeedf3c6a52fd86a390e), [`fb84622af`](https://github.com/withastro/astro/commit/fb84622af04f795de8d17f24192de105f70fe910), [`cada10a46`](https://github.com/withastro/astro/commit/cada10a466f81f8edb0aa664f9cffdb6b5b8f307), [`cd410c5eb`](https://github.com/withastro/astro/commit/cd410c5eb71f825259279c27c4c39d0ad282c3f0), [`73ec6f6c1`](https://github.com/withastro/astro/commit/73ec6f6c16cadb71dafe9f664f0debde072c3173), [`410428672`](https://github.com/withastro/astro/commit/410428672ed97bba7ca0b3352c1a7ee564921462), [`763ff2d1e`](https://github.com/withastro/astro/commit/763ff2d1e44f54b899d7c65386f1b4b877c95737), [`c1669c001`](https://github.com/withastro/astro/commit/c1669c0011eecfe65a459d727848c18c189a54ca), [`3d525efc9`](https://github.com/withastro/astro/commit/3d525efc95cfb2deb5d9e04856d02965d66901c9), [`826e02890`](https://github.com/withastro/astro/commit/826e0289005f645b902375b98d5549c6a95ccafa)]:
  - astro@2.5.0
  - @astrojs/prism@2.1.2

## 2.2.0

### Minor Changes

- [#6932](https://github.com/withastro/astro/pull/6932) [`49514e4ce`](https://github.com/withastro/astro/commit/49514e4ce40fedb39bf7decd2c296258efbdafc7) Thanks [@bluwy](https://github.com/bluwy)! - Upgrade shiki to v0.14.1. This updates the shiki theme colors and adds the theme name to the `pre` tag, e.g. `<pre class="astro-code github-dark">`.

### Patch Changes

- Updated dependencies [[`818252acd`](https://github.com/withastro/astro/commit/818252acda3c00499cea51ffa0f26d4c2ccd3a02), [`80e3d4d3d`](https://github.com/withastro/astro/commit/80e3d4d3d0f7719d8eae5435bba3805503057511), [`3326492b9`](https://github.com/withastro/astro/commit/3326492b94f76ed2b0154dd9b9a1a9eb883c1e31), [`cac4a321e`](https://github.com/withastro/astro/commit/cac4a321e814fb805eb0e3ced469e25261a50885), [`831b67cdb`](https://github.com/withastro/astro/commit/831b67cdb8250f93f66e3b171fab024652bf80f2), [`49514e4ce`](https://github.com/withastro/astro/commit/49514e4ce40fedb39bf7decd2c296258efbdafc7), [`0883fd487`](https://github.com/withastro/astro/commit/0883fd4875548a613df122f0b87a1ca8b7a7cf7d)]:
  - astro@2.4.0

## 2.1.4

### Patch Changes

- [#6824](https://github.com/withastro/astro/pull/6824) [`2511d58d5`](https://github.com/withastro/astro/commit/2511d58d586af080a78e5ef8a63020b3e17770db) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add support for using optimized and relative images in MDX files with `experimental.assets`

- Updated dependencies [[`8539eb164`](https://github.com/withastro/astro/commit/8539eb1643864ae7e0f5a080915cd75535f7101b), [`a9c22994e`](https://github.com/withastro/astro/commit/a9c22994e41f92a586d8946988d29e3c62148778), [`948a6d7be`](https://github.com/withastro/astro/commit/948a6d7be0c76fd1dd8550270bd29821075f799c)]:
  - astro@2.3.0

## 2.1.3

### Patch Changes

- [#6744](https://github.com/withastro/astro/pull/6744) [`a1a4f45b5`](https://github.com/withastro/astro/commit/a1a4f45b51a80215fa7598da83bd0d9c5acd20d2) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix remote images in Markdown throwing errors when using `experimental.assets`

- Updated dependencies [[`489dd8d69`](https://github.com/withastro/astro/commit/489dd8d69cdd9d7c243cf8bec96051a914984b9c), [`a1a4f45b5`](https://github.com/withastro/astro/commit/a1a4f45b51a80215fa7598da83bd0d9c5acd20d2), [`a1108e037`](https://github.com/withastro/astro/commit/a1108e037115cdb67d03505286c7d3a4fc2a1ff5), [`8b88e4cf1`](https://github.com/withastro/astro/commit/8b88e4cf15c8bea7942b3985380164e0edf7250b), [`d54cbe413`](https://github.com/withastro/astro/commit/d54cbe41349e55f8544212ad9320705f07325920), [`4c347ab51`](https://github.com/withastro/astro/commit/4c347ab51e46f2319d614f8577fe502e3dc816e2), [`ff0430786`](https://github.com/withastro/astro/commit/ff043078630e678348ae4f4757b3015b3b862c16), [`2f2e572e9`](https://github.com/withastro/astro/commit/2f2e572e937fd25451bbc78a05d55b7caa1ca3ec), [`7116c021a`](https://github.com/withastro/astro/commit/7116c021a39eac15a6e1264dfbd11bef0f5d618a)]:
  - astro@2.2.0

## 2.1.2

### Patch Changes

- [#6604](https://github.com/withastro/astro/pull/6604) [`7f7a8504b`](https://github.com/withastro/astro/commit/7f7a8504b5c2df4c99d3025931860c0d50992510) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix using optimized images in Markdown not working

- Updated dependencies [[`7f7a8504b`](https://github.com/withastro/astro/commit/7f7a8504b5c2df4c99d3025931860c0d50992510), [`38e6ec21e`](https://github.com/withastro/astro/commit/38e6ec21e266ad8765d8ca2293034123b34e839a), [`f42f47dc6`](https://github.com/withastro/astro/commit/f42f47dc6a91cdb6534dab0ecbf9e8e85f00ba40)]:
  - astro@2.1.5

## 2.1.1

### Patch Changes

- [#6559](https://github.com/withastro/astro/pull/6559) [`90e5f87d0`](https://github.com/withastro/astro/commit/90e5f87d03215a833bb6ac91f9548670a25ce659) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Vendor `image-size` to fix CJS-related issues

- [#6555](https://github.com/withastro/astro/pull/6555) [`f5fddafc2`](https://github.com/withastro/astro/commit/f5fddafc248bb1ef57b7349bfecc25539ae2b5ea) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add a `validateOptions` hook to the Image Service API in order to set default options and validate the passed options

- Updated dependencies [[`04dddd783`](https://github.com/withastro/astro/commit/04dddd783da3235aa9ed523d2856adf86b792b5f), [`ea9b3dd72`](https://github.com/withastro/astro/commit/ea9b3dd72b98b3f5a542ca24a275f673faa6c7c5), [`bf024cb34`](https://github.com/withastro/astro/commit/bf024cb3429c5929d98378108230bc946a376b17), [`22955b895`](https://github.com/withastro/astro/commit/22955b895ce4343e282355db64b3a5c1415f3944), [`f413446a8`](https://github.com/withastro/astro/commit/f413446a859e497395b3612e44d1540cc6b9dad7), [`90e5f87d0`](https://github.com/withastro/astro/commit/90e5f87d03215a833bb6ac91f9548670a25ce659), [`388190102`](https://github.com/withastro/astro/commit/3881901028cbb586f5a4de1b4953e2d6730458ab), [`035c0c4df`](https://github.com/withastro/astro/commit/035c0c4df2a623bcc2f2a1cb9e490df35fa29adc), [`f112c12b1`](https://github.com/withastro/astro/commit/f112c12b15dfbb278d66699f54809674dd1bded0), [`689884251`](https://github.com/withastro/astro/commit/68988425119255382f94c983796574050006f003), [`fa132e35c`](https://github.com/withastro/astro/commit/fa132e35c23f2cfe368fd0a7239584a2bc5c4f12), [`f5fddafc2`](https://github.com/withastro/astro/commit/f5fddafc248bb1ef57b7349bfecc25539ae2b5ea), [`283734525`](https://github.com/withastro/astro/commit/28373452503bc6ca88221ffd39a5590e015e4d71), [`66858f1f2`](https://github.com/withastro/astro/commit/66858f1f238a0edf6ded2b0f693bc738785d5aa3), [`6c465e958`](https://github.com/withastro/astro/commit/6c465e958e088ff55e5b895e67c64c0dfd4277a6)]:
  - astro@2.1.4

## 2.1.0

### Minor Changes

- [#6344](https://github.com/withastro/astro/pull/6344) [`694918a56`](https://github.com/withastro/astro/commit/694918a56b01104831296be0c25456135a63c784) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add a new experimental flag (`experimental.assets`) to enable our new core Assets story.

  This unlocks a few features:

  - A new built-in image component and JavaScript API to transform and optimize images.
  - Relative images with automatic optimization in Markdown.
  - Support for validating assets using content collections.
  - and more!

  See [Assets (Experimental)](https://docs.astro.build/en/guides/assets/) on our docs site for more information on how to use this feature!

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

### Patch Changes

- Updated dependencies [[`fec583909`](https://github.com/withastro/astro/commit/fec583909ab62829dc0c1600e2387979365f2b94), [`b087b83fe`](https://github.com/withastro/astro/commit/b087b83fe266c431fe34a07d5c2293cc4ab011c6), [`694918a56`](https://github.com/withastro/astro/commit/694918a56b01104831296be0c25456135a63c784), [`a20610609`](https://github.com/withastro/astro/commit/a20610609863ae3b48afe96819b8f11ae4f414d5), [`a4a74ab70`](https://github.com/withastro/astro/commit/a4a74ab70cd2aa0d812a1f6b202c4e240a8913bf), [`75921b3cd`](https://github.com/withastro/astro/commit/75921b3cd916d439f6392c487c21532fde35ed13), [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808)]:
  - astro@2.1.0
  - @astrojs/prism@2.1.0

## 2.0.1

### Patch Changes

- [#5978](https://github.com/withastro/astro/pull/5978) [`7abb1e905`](https://github.com/withastro/astro/commit/7abb1e9056c4b4fd0abfced347df32a41cdfbf28) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Fix MDX heading IDs generation when using a frontmatter reference

- Updated dependencies [[`b53e0717b`](https://github.com/withastro/astro/commit/b53e0717b7f6b042baaeec7f87999e99c76c031c), [`60b32d585`](https://github.com/withastro/astro/commit/60b32d58565d87e87573eb268408293fc28ec657), [`883e0cc29`](https://github.com/withastro/astro/commit/883e0cc29968d51ed6c7515be035a40b28bafdad), [`dabce6b8c`](https://github.com/withastro/astro/commit/dabce6b8c684f851c3535f8acead06cbef6dce2a), [`aedf23f85`](https://github.com/withastro/astro/commit/aedf23f8582e32a6b94b81ddba9b323831f2b22a)]:
  - astro@2.0.2

## 2.0.0

### Major Changes

- [#5687](https://github.com/withastro/astro/pull/5687) [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Give remark and rehype plugins access to user frontmatter via frontmatter injection. This means `data.astro.frontmatter` is now the _complete_ Markdown or MDX document's frontmatter, rather than an empty object.

  This allows plugin authors to modify existing frontmatter, or compute new properties based on other properties. For example, say you want to compute a full image URL based on an `imageSrc` slug in your document frontmatter:

  ```ts
  export function remarkInjectSocialImagePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
      frontmatter.socialImageSrc = new URL(frontmatter.imageSrc, 'https://my-blog.com/').pathname;
    };
  }
  ```

  When using Content Collections, you can access this modified frontmatter using the `remarkPluginFrontmatter` property returned when rendering an entry.

  **Migration instructions**

  Plugin authors should now **check for user frontmatter when applying defaults.**

  For example, say a remark plugin wants to apply a default `title` if none is present. Add a conditional to check if the property is present, and update if none exists:

  ```diff
  export function remarkInjectTitlePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
  +    if (!frontmatter.title) {
        frontmatter.title = 'Default title';
  +    }
    }
  }
  ```

  This differs from previous behavior, where a Markdown file's frontmatter would _always_ override frontmatter injected via remark or reype.

- [#5785](https://github.com/withastro/astro/pull/5785) [`16107b6a1`](https://github.com/withastro/astro/commit/16107b6a10514ef1b563e585ec9add4b14f42b94) Thanks [@delucis](https://github.com/delucis)! - Drop support for legacy Astro-flavored Markdown

- [#5684](https://github.com/withastro/astro/pull/5684) [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d) & [#5769](https://github.com/withastro/astro/pull/5769) [`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Refine Markdown and MDX configuration options for ease-of-use.

  - **Markdown**

    - **Replace the `extendDefaultPlugins` option** with a `gfm` boolean and a `smartypants` boolean. These are enabled by default, and can be disabled to remove GitHub-Flavored Markdown and SmartyPants.

    - Ensure GitHub-Flavored Markdown and SmartyPants are applied whether or not custom `remarkPlugins` or `rehypePlugins` are configured. If you want to apply custom plugins _and_ remove Astro's default plugins, manually set `gfm: false` and `smartypants: false` in your config.

  - **Migrate `extendDefaultPlugins` to `gfm` and `smartypants`**

    You may have disabled Astro's built-in plugins (GitHub-Flavored Markdown and Smartypants) with the `extendDefaultPlugins` option. This has now been split into 2 flags to disable each plugin individually:

    - `markdown.gfm` to disable GitHub-Flavored Markdown
    - `markdown.smartypants` to disable SmartyPants

    ```diff
    // astro.config.mjs
    import { defineConfig } from 'astro/config';

    export default defineConfig({
      markdown: {
    -   extendDefaultPlugins: false,
    +   smartypants: false,
    +   gfm: false,
      }
    });
    ```

    Additionally, applying remark and rehype plugins **no longer disables** `gfm` and `smartypants`. You will need to opt-out manually by setting `gfm` and `smartypants` to `false`.

  - **MDX**

    - Support _all_ Markdown configuration options (except `drafts`) from your MDX integration config. This includes `syntaxHighlighting` and `shikiConfig` options to further customize the MDX renderer.

    - Simplify `extendPlugins` to an `extendMarkdownConfig` option. MDX options will default to their equivalent in your Markdown config. By setting `extendMarkdownConfig` to false, you can "eject" to set your own syntax highlighting, plugins, and more.

  - **Migrate MDX's `extendPlugins` to `extendMarkdownConfig`**

    You may have used the `extendPlugins` option to manage plugin defaults in MDX. This has been replaced by 3 flags:

    - `extendMarkdownConfig` (`true` by default) to toggle Markdown config inheritance. This replaces the `extendPlugins: 'markdown'` option.
    - `gfm` (`true` by default) and `smartypants` (`true` by default) to toggle GitHub-Flavored Markdown and SmartyPants in MDX. This replaces the `extendPlugins: 'defaults'` option.

- [#5825](https://github.com/withastro/astro/pull/5825) [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Baseline the experimental `contentCollections` flag. You're free to remove this from your astro config!

  ```diff
  import { defineConfig } from 'astro/config';

  export default defineConfig({
  - experimental: { contentCollections: true }
  })

  ```

- [#5806](https://github.com/withastro/astro/pull/5806) [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53) Thanks [@matthewp](https://github.com/matthewp)! - Make astro a `peerDependency` of integrations

  This marks `astro` as a `peerDependency` of several packages that are already getting `major` version bumps. This is so we can more properly track the dependency between them and what version of Astro they are being used with.

**Patch Changes**

- [#5837](https://github.com/withastro/astro/pull/5837) [`12f65a4d5`](https://github.com/withastro/astro/commit/12f65a4d55e3fd2993c2f67b18794dd536280c69) Thanks [@giuseppelt](https://github.com/giuseppelt)! - fix shiki css class replace logic

- Updated dependencies [[`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b), [`16dc36a87`](https://github.com/withastro/astro/commit/16dc36a870df47a4151a8ed2d91d0bd1bb812458), [`01f3f463b`](https://github.com/withastro/astro/commit/01f3f463bf2918b310d130a9fabbf3ee21d14029), [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144), [`05caf445d`](https://github.com/withastro/astro/commit/05caf445d4d2728f1010aeb2179a9e756c2fd17d), [`49ab4f231`](https://github.com/withastro/astro/commit/49ab4f231c23b34891c3ee86f4b92bf8d6d267a3), [`a342a486c`](https://github.com/withastro/astro/commit/a342a486c2831461e24e6c2f1ca8a9d3e15477b6), [`8fb28648f`](https://github.com/withastro/astro/commit/8fb28648f66629741cb976bfe34ccd9d8f55661e), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`c2180746b`](https://github.com/withastro/astro/commit/c2180746b4f6d9ef1b6f86924f21f52cc6ab4e63), [`ae8a012a7`](https://github.com/withastro/astro/commit/ae8a012a7b6884a03c50494332ee37b4505c2c3b), [`cf2de5422`](https://github.com/withastro/astro/commit/cf2de5422c26bfdea4c75f76e57b57299ded3e3a), [`ce5c5dbd4`](https://github.com/withastro/astro/commit/ce5c5dbd46afbe738b03600758bf5c35113de522), [`ec09bb664`](https://github.com/withastro/astro/commit/ec09bb6642064dbd7d2f3369afb090363ae18de2), [`665a2c222`](https://github.com/withastro/astro/commit/665a2c2225e42881f5a9550599e8f3fc1deea0b4), [`259a539d7`](https://github.com/withastro/astro/commit/259a539d7d70c783330c797794b15716921629cf), [`f7aa1ec25`](https://github.com/withastro/astro/commit/f7aa1ec25d1584f7abd421903fbef66b1c050e2a), [`4987d6f44`](https://github.com/withastro/astro/commit/4987d6f44cfd0d81d88f21f5c380503403dc1e6a), [`304823811`](https://github.com/withastro/astro/commit/304823811eddd8e72aa1d8e2d39b40ab5cda3565), [`302e0ef8f`](https://github.com/withastro/astro/commit/302e0ef8f5d5232e3348afe680e599f3e537b5c5), [`55cea0a9d`](https://github.com/withastro/astro/commit/55cea0a9d8c8df91a46590fc04a9ac28089b3432), [`dd56c1941`](https://github.com/withastro/astro/commit/dd56c19411b126439b8bc42d681b6fa8c06e8c61), [`9963c6e4d`](https://github.com/withastro/astro/commit/9963c6e4d50c392c3d1ac4492237020f15ccb1de), [`be901dc98`](https://github.com/withastro/astro/commit/be901dc98c4a7f6b5536540aa8f7ba5108e939a0), [`f6cf92b48`](https://github.com/withastro/astro/commit/f6cf92b48317a19a3840ad781b77d6d3cae143bb), [`e818cc046`](https://github.com/withastro/astro/commit/e818cc0466a942919ea3c41585e231c8c80cb3d0), [`8c100a6fe`](https://github.com/withastro/astro/commit/8c100a6fe6cc652c3799d1622e12c2c969f30510), [`116d8835c`](https://github.com/withastro/astro/commit/116d8835ca9e78f8b5e477ee5a3d737b69f80706), [`840412128`](https://github.com/withastro/astro/commit/840412128b00a04515156e92c314a929d6b94f6d), [`1f49cddf9`](https://github.com/withastro/astro/commit/1f49cddf9e9ffc651efc171b2cbde9fbe9e8709d), [`7325df412`](https://github.com/withastro/astro/commit/7325df412107fc0e65cd45c1b568fb686708f723), [`16c7d0bfd`](https://github.com/withastro/astro/commit/16c7d0bfd49d2b9bfae45385f506bcd642f9444a), [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d), [`2a5786419`](https://github.com/withastro/astro/commit/2a5786419599b8674473c699300172b9aacbae2e), [`4a1cabfe6`](https://github.com/withastro/astro/commit/4a1cabfe6b9ef8a6fbbcc0727a0dc6fa300cedaa), [`a8d3e7924`](https://github.com/withastro/astro/commit/a8d3e79246605d252dcddad159e358e2d79bd624), [`fa8c131f8`](https://github.com/withastro/astro/commit/fa8c131f88ef67d14c62f1c00c97ed74d43a80ac), [`64b8082e7`](https://github.com/withastro/astro/commit/64b8082e776b832f1433ed288e6f7888adb626d0), [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481), [`23dc9ea96`](https://github.com/withastro/astro/commit/23dc9ea96a10343852d965efd41fe6665294f1fb), [`63a6ceb38`](https://github.com/withastro/astro/commit/63a6ceb38d88331451dca64d0034c7c58e3d26f1), [`a3a7fc929`](https://github.com/withastro/astro/commit/a3a7fc9298e6d88abb4b7bee1e58f05fa9558cf1), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`5fd9208d4`](https://github.com/withastro/astro/commit/5fd9208d447f5ab8909a2188b6c2491a0debd49d), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`899214298`](https://github.com/withastro/astro/commit/899214298cee5f0c975c7245e623c649e1842d73), [`3a00ecb3e`](https://github.com/withastro/astro/commit/3a00ecb3eb4bc44be758c064f2bde6e247e8a593), [`5eba34fcc`](https://github.com/withastro/astro/commit/5eba34fcc663def20bdf6e0daad02a6a5472776b), [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0), [`1ca81c16b`](https://github.com/withastro/astro/commit/1ca81c16b8b66236e092e6eb6ec3f73f5668421c), [`b66d7195c`](https://github.com/withastro/astro/commit/b66d7195c17a55ea0931bc3744888bd4f5f01ce6)]:
  - astro@2.0.0
  - @astrojs/prism@2.0.0

## 2.0.0-beta.2

<details>
<summary>See changes in 2.0.0-beta.2</summary>

### Major Changes

- [#5785](https://github.com/withastro/astro/pull/5785) [`16107b6a1`](https://github.com/withastro/astro/commit/16107b6a10514ef1b563e585ec9add4b14f42b94) Thanks [@delucis](https://github.com/delucis)! - Drop support for legacy Astro-flavored Markdown

- [#5825](https://github.com/withastro/astro/pull/5825) [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Baseline the experimental `contentCollections` flag. You're free to remove this from your astro config!

  ```diff
  import { defineConfig } from 'astro/config';

  export default defineConfig({
  - experimental: { contentCollections: true }
  })

  ```

- [#5806](https://github.com/withastro/astro/pull/5806) [`7572f7402`](https://github.com/withastro/astro/commit/7572f7402238da37de748be58d678fedaf863b53) Thanks [@matthewp](https://github.com/matthewp)! - Make astro a peerDependency of integrations

  This marks `astro` as a peerDependency of several packages that are already getting `major` version bumps. This is so we can more properly track the dependency between them and what version of Astro they are being used with.

### Patch Changes

- [#5837](https://github.com/withastro/astro/pull/5837) [`12f65a4d5`](https://github.com/withastro/astro/commit/12f65a4d55e3fd2993c2f67b18794dd536280c69) Thanks [@giuseppelt](https://github.com/giuseppelt)! - fix shiki css class replace logic

- Updated dependencies [[`01f3f463b`](https://github.com/withastro/astro/commit/01f3f463bf2918b310d130a9fabbf3ee21d14029), [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a), [`c2180746b`](https://github.com/withastro/astro/commit/c2180746b4f6d9ef1b6f86924f21f52cc6ab4e63), [`ae8a012a7`](https://github.com/withastro/astro/commit/ae8a012a7b6884a03c50494332ee37b4505c2c3b), [`cf2de5422`](https://github.com/withastro/astro/commit/cf2de5422c26bfdea4c75f76e57b57299ded3e3a), [`ec09bb664`](https://github.com/withastro/astro/commit/ec09bb6642064dbd7d2f3369afb090363ae18de2), [`665a2c222`](https://github.com/withastro/astro/commit/665a2c2225e42881f5a9550599e8f3fc1deea0b4), [`f7aa1ec25`](https://github.com/withastro/astro/commit/f7aa1ec25d1584f7abd421903fbef66b1c050e2a), [`302e0ef8f`](https://github.com/withastro/astro/commit/302e0ef8f5d5232e3348afe680e599f3e537b5c5), [`840412128`](https://github.com/withastro/astro/commit/840412128b00a04515156e92c314a929d6b94f6d), [`1f49cddf9`](https://github.com/withastro/astro/commit/1f49cddf9e9ffc651efc171b2cbde9fbe9e8709d), [`4a1cabfe6`](https://github.com/withastro/astro/commit/4a1cabfe6b9ef8a6fbbcc0727a0dc6fa300cedaa), [`c4b0cb8bf`](https://github.com/withastro/astro/commit/c4b0cb8bf2b41887d9106440bb2e70d421a5f481), [`23dc9ea96`](https://github.com/withastro/astro/commit/23dc9ea96a10343852d965efd41fe6665294f1fb), [`63a6ceb38`](https://github.com/withastro/astro/commit/63a6ceb38d88331451dca64d0034c7c58e3d26f1), [`52209ca2a`](https://github.com/withastro/astro/commit/52209ca2ad72a30854947dcb3a90ab4db0ac0a6f), [`2303f9514`](https://github.com/withastro/astro/commit/2303f95142aa740c99213a098f82b99dd37d74a0)]:
  - astro@2.0.0-beta.2
  - @astrojs/prism@2.0.0-beta.0

</details>

## 2.0.0-beta.1

<details>
<summary>See changes in 2.0.0-beta.1</summary>

### Minor Changes

- [#5769](https://github.com/withastro/astro/pull/5769) [`93e633922`](https://github.com/withastro/astro/commit/93e633922c2e449df3bb2357b3683af1d3c0e07b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Introduce a `smartypants` flag to opt-out of Astro's default SmartyPants plugin.

  ```js
  {
    markdown: {
      smartypants: false,
    }
  }
  ```

  #### Migration

  You may have disabled Astro's built-in plugins (GitHub-Flavored Markdown and Smartypants) with the `extendDefaultPlugins` option. This has now been split into 2 flags to disable each plugin individually:

  - `markdown.gfm` to disable GitHub-Flavored Markdown
  - `markdown.smartypants` to disable SmartyPants

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    markdown: {
  -   extendDefaultPlugins: false,
  +   smartypants: false,
  +   gfm: false,
    }
  });
  ```

</details>

## 2.0.0-beta.0

<details>
<summary>See changes in 2.0.0-beta.0</summary>

### Major Changes

- [#5687](https://github.com/withastro/astro/pull/5687) [`e2019be6f`](https://github.com/withastro/astro/commit/e2019be6ffa46fa33d92cfd346f9ecbe51bb7144) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Give remark and rehype plugins access to user frontmatter via frontmatter injection. This means `data.astro.frontmatter` is now the _complete_ Markdown or MDX document's frontmatter, rather than an empty object.

  This allows plugin authors to modify existing frontmatter, or compute new properties based on other properties. For example, say you want to compute a full image URL based on an `imageSrc` slug in your document frontmatter:

  ```ts
  export function remarkInjectSocialImagePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
      frontmatter.socialImageSrc = new URL(frontmatter.imageSrc, 'https://my-blog.com/').pathname;
    };
  }
  ```

  #### Content Collections - new `remarkPluginFrontmatter` property

  We have changed _inject_ frontmatter to _modify_ frontmatter in our docs to improve discoverability. This is based on support forum feedback, where "injection" is rarely the term used.

  To reflect this, the `injectedFrontmatter` property has been renamed to `remarkPluginFrontmatter`. This should clarify this plugin is still separate from the `data` export Content Collections expose today.

  #### Migration instructions

  Plugin authors should now **check for user frontmatter when applying defaults.**

  For example, say a remark plugin wants to apply a default `title` if none is present. Add a conditional to check if the property is present, and update if none exists:

  ```diff
  export function remarkInjectTitlePlugin() {
    return function (tree, file) {
      const { frontmatter } = file.data.astro;
  +    if (!frontmatter.title) {
        frontmatter.title = 'Default title';
  +    }
    }
  }
  ```

  This differs from previous behavior, where a Markdown file's frontmatter would _always_ override frontmatter injected via remark or reype.

- [#5684](https://github.com/withastro/astro/pull/5684) [`a9c292026`](https://github.com/withastro/astro/commit/a9c2920264e36cc5dc05f4adc1912187979edb0d) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Refine Markdown and MDX configuration options for ease-of-use.

  #### Markdown

  - **Remove `remark-smartypants`** from Astro's default Markdown plugins.
  - **Replace the `extendDefaultPlugins` option** with a simplified `gfm` boolean. This is enabled by default, and can be disabled to remove GitHub-Flavored Markdown.
  - Ensure GitHub-Flavored Markdown is applied whether or not custom `remarkPlugins` or `rehypePlugins` are configured. If you want to apply custom plugins _and_ remove GFM, manually set `gfm: false` in your config.

  #### MDX

  - Support _all_ Markdown configuration options (except `drafts`) from your MDX integration config. This includes `syntaxHighlighting` and `shikiConfig` options to further customize the MDX renderer.
  - Simplify `extendDefaults` to an `extendMarkdownConfig` option. MDX options will default to their equivalent in your Markdown config. By setting `extendMarkdownConfig` to false, you can "eject" to set your own syntax highlighting, plugins, and more.

  #### Migration

  To preserve your existing Markdown and MDX setup, you may need some configuration changes:

  ##### Smartypants manual installation

  [Smartypants](https://github.com/silvenon/remark-smartypants) has been removed from Astro's default setup. If you rely on this plugin, [install `remark-smartypants`](https://github.com/silvenon/remark-smartypants#installing) and apply to your `astro.config.*`:

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';
  + import smartypants from 'remark-smartypants';

  export default defineConfig({
    markdown: {
  +   remarkPlugins: [smartypants],
    }
  });
  ```

  ##### Migrate `extendDefaultPlugins` to `gfm`

  You may have disabled Astro's built-in plugins (GitHub-Flavored Markdown and Smartypants) with the `extendDefaultPlugins` option. Since Smartypants has been removed, this has been renamed to `gfm`.

  ```diff
  // astro.config.mjs
  import { defineConfig } from 'astro/config';

  export default defineConfig({
    markdown: {
  -   extendDefaultPlugins: false,
  +   gfm: false,
    }
  });
  ```

  Additionally, applying remark and rehype plugins **no longer disables** `gfm`. You will need to opt-out manually by setting `gfm` to `false`.

  ##### Migrate MDX's `extendPlugins` to `extendMarkdownConfig`

  You may have used the `extendPlugins` option to manage plugin defaults in MDX. This has been replaced by 2 flags:

  - `extendMarkdownConfig` (`true` by default) to toggle Markdown config inheritance. This replaces the `extendPlugins: 'markdown'` option.
  - `gfm` (`true` by default) to toggle GitHub-Flavored Markdown in MDX. This replaces the `extendPlugins: 'defaults'` option.

</details>

## 1.2.0

### Minor Changes

- [#5654](https://github.com/withastro/astro/pull/5654) [`2c65b433b`](https://github.com/withastro/astro/commit/2c65b433bf840a1bb93b0a1947df5949e33512ff) Thanks [@delucis](https://github.com/delucis)! - Refactor and export `rehypeHeadingIds` plugin

  The `rehypeHeadingIds` plugin injects IDs for all headings in a Markdown document and can now also handle MDX inputs if needed. You can import and use this plugin if you need heading IDs to be injected _before_ other rehype plugins run.

### Patch Changes

- [#5648](https://github.com/withastro/astro/pull/5648) [`853081d1c`](https://github.com/withastro/astro/commit/853081d1c857d8ad8a9634c37ed8fd123d32d241) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Prevent relative image paths in `src/content/`

## 1.1.3

### Patch Changes

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Fix non-hoisted remark/rehype plugin loading

- [#4842](https://github.com/withastro/astro/pull/4842) [`812658ad2`](https://github.com/withastro/astro/commit/812658ad2ab3732a99e35c4fd903e302e723db46) Thanks [@bluwy](https://github.com/bluwy)! - Add missing dependencies, support strict dependency installation (e.g. pnpm)

## 1.1.2

### Patch Changes

- [#4787](https://github.com/withastro/astro/pull/4787) [`df54595a8`](https://github.com/withastro/astro/commit/df54595a8836448a621fceeb38fbaacde1bb27cf) Thanks [@merceyz](https://github.com/merceyz)! - declare `hast-util-to-html` as a dependency

## 1.1.1

### Patch Changes

- [#4519](https://github.com/withastro/astro/pull/4519) [`a2e8e76c3`](https://github.com/withastro/astro/commit/a2e8e76c303e8d6f39c24c122905a10f06907997) Thanks [@JuanM04](https://github.com/JuanM04)! - Upgraded Shiki to v0.11.1

## 1.1.0

### Minor Changes

- [#4474](https://github.com/withastro/astro/pull/4474) [`ac0321824`](https://github.com/withastro/astro/commit/ac03218247763e4782824e220a384fd20ae6d769) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add "extends" to markdown plugin config to preserve Astro defaults

* [#4138](https://github.com/withastro/astro/pull/4138) [`839097c84`](https://github.com/withastro/astro/commit/839097c84e830542c17c18d8337a88de8885c356) Thanks [@gtnbssn](https://github.com/gtnbssn)! - Makes remark-rehype options available in astro.config.mjs

## 1.1.0-next.0

### Minor Changes

- [#4474](https://github.com/withastro/astro/pull/4474) [`ac0321824`](https://github.com/withastro/astro/commit/ac03218247763e4782824e220a384fd20ae6d769) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add "extends" to markdown plugin config to preserve Astro defaults

* [#4138](https://github.com/withastro/astro/pull/4138) [`839097c84`](https://github.com/withastro/astro/commit/839097c84e830542c17c18d8337a88de8885c356) Thanks [@gtnbssn](https://github.com/gtnbssn)! - Makes remark-rehype options available in astro.config.mjs

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

### Patch Changes

- Updated dependencies [[`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308)]:
  - @astrojs/prism@1.0.0

## 0.14.1

### Patch Changes

- [#4176](https://github.com/withastro/astro/pull/4176) [`2675b8633`](https://github.com/withastro/astro/commit/2675b8633c5d5c45b237ec87940d5eaf1bfb1b4b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Support frontmatter injection for MD and MDX using remark and rehype plugins

* [#4137](https://github.com/withastro/astro/pull/4137) [`471c6f784`](https://github.com/withastro/astro/commit/471c6f784e21399676c8b2002665ffdf83a1c59e) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Speed up internal markdown builds with new vite-plugin markdown

- [#4169](https://github.com/withastro/astro/pull/4169) [`16034f0dd`](https://github.com/withastro/astro/commit/16034f0dd5b3683e9e022dbd413e85bd18d2b031) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix double-escaping of non-highlighted code blocks in Astro-flavored markdown

## 0.14.0

### Minor Changes

- [#4114](https://github.com/withastro/astro/pull/4114) [`64432bcb8`](https://github.com/withastro/astro/commit/64432bcb873efd0e4297c00fc9583a1fe516dfe7) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Refactor `@astrojs/mdx` and `@astrojs/markdown-remark` to use `@astrojs/prism` instead of duplicating the code

### Patch Changes

- Updated dependencies [[`64432bcb8`](https://github.com/withastro/astro/commit/64432bcb873efd0e4297c00fc9583a1fe516dfe7)]:
  - @astrojs/prism@0.7.0

## 0.13.0

### Minor Changes

- [`ba11b3399`](https://github.com/withastro/astro/commit/ba11b33996d79c32da947986edb0f32dbcc04aaf) Thanks [@RafidMuhymin](https://github.com/RafidMuhymin)! - fixed generated slugs in markdown that ends with a dash

* [#4016](https://github.com/withastro/astro/pull/4016) [`00fab4ce1`](https://github.com/withastro/astro/commit/00fab4ce135eb799cac69140403d7724686733d6) Thanks [@bholmesdev](https://github.com/bholmesdev)! - The use of components and JSX expressions in Markdown are no longer supported by default.

  For long term support, migrate to the `@astrojs/mdx` integration for MDX support (including `.mdx` pages!).

  Not ready to migrate to MDX? Add the legacy flag to your Astro config to re-enable the previous Markdown support.

  ```js
  // https://astro.build/config
  export default defineConfig({
    legacy: {
      astroFlavoredMarkdown: true,
    },
  });
  ```

- [#4031](https://github.com/withastro/astro/pull/4031) [`6e27a5fdc`](https://github.com/withastro/astro/commit/6e27a5fdc21276cad26cd50e16a2709a40a7cbac) Thanks [@natemoo-re](https://github.com/natemoo-re)! - **BREAKING** Renamed Markdown utility function `getHeaders()` to `getHeadings()`.

### Patch Changes

- [#4008](https://github.com/withastro/astro/pull/4008) [`399d7e269`](https://github.com/withastro/astro/commit/399d7e269834d11c046b390705a9a53d3738f3cf) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Avoid parsing JSX, components, and Astro islands when using "plain" md mode. This brings `markdown.mode: 'md'` in-line with our docs description.

## 0.12.0

### Minor Changes

- [#3924](https://github.com/withastro/astro/pull/3924) [`07fb544da`](https://github.com/withastro/astro/commit/07fb544dab142a3d4bb9d0d878aab34eaea447b2) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Remove unused ssr-utils file

### Patch Changes

- Updated dependencies [[`31f9c0bf0`](https://github.com/withastro/astro/commit/31f9c0bf029ffa4b470e620f2c32e1370643e81e)]:
  - @astrojs/prism@0.6.1

## 0.11.7

### Patch Changes

- [#3919](https://github.com/withastro/astro/pull/3919) [`01a55467d`](https://github.com/withastro/astro/commit/01a55467d561974f843a9e0cd6963af7c840abb9) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Add back missing ssr-utils.js file

## 0.11.6

### Patch Changes

- [#3911](https://github.com/withastro/astro/pull/3911) [`ca45c0c27`](https://github.com/withastro/astro/commit/ca45c0c270f5ca3f7d2fb113a235d415cecdb333) Thanks [@JuanM04](https://github.com/JuanM04)! - Don't throw when Shiki doesn't recognize a language

- Updated dependencies [[`b48767985`](https://github.com/withastro/astro/commit/b48767985359bd359df8071324952ea5f2bc0d86)]:
  - @astrojs/prism@0.6.0

## 0.11.5

### Patch Changes

- [#3669](https://github.com/withastro/astro/pull/3669) [`93e1020b1`](https://github.com/withastro/astro/commit/93e1020b1e8549b08cf5646e1ebc3ae34e14ebc8) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Tooling: reintroduce smoke test across example projects

## 0.11.4

### Patch Changes

- Updated dependencies [[`1cc5b7890`](https://github.com/withastro/astro/commit/1cc5b78905633608e5b07ad291f916f54e67feb1)]:
  - @astrojs/prism@0.5.0

## 0.11.3

### Patch Changes

- [#3638](https://github.com/withastro/astro/pull/3638) [`80c71c7c`](https://github.com/withastro/astro/commit/80c71c7c56d15dc05ec0c5a848130aad222d7d51) Thanks [@tony-sull](https://github.com/tony-sull)! - Fix: HTML comments in markdown code blocks should not be wrapped in JS comments

* [#3612](https://github.com/withastro/astro/pull/3612) [`fca58cfd`](https://github.com/withastro/astro/commit/fca58cfd91b68501ec82350ab023170b208d8ce7) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: "vpath" import error when building for netlify edge

- [#3630](https://github.com/withastro/astro/pull/3630) [`48e67fe0`](https://github.com/withastro/astro/commit/48e67fe05398dc4b1fca12db36c1b37bb341277a) Thanks [@tony-sull](https://github.com/tony-sull)! - Encodes ampersand characters in code blocks

* [#3620](https://github.com/withastro/astro/pull/3620) [`05aa7244`](https://github.com/withastro/astro/commit/05aa72442cd4512b94abdb39623e8caa2c1839b0) Thanks [@hippotastic](https://github.com/hippotastic)! - Remove extra newlines around Markdown components

## 0.11.2

### Patch Changes

- [#3572](https://github.com/withastro/astro/pull/3572) [`5c73f614`](https://github.com/withastro/astro/commit/5c73f614e8f579e04fe61c948b69be7bc6d81d5d) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix remarkMdxish performance issue on huge sites

## 0.11.1

### Patch Changes

- [#3564](https://github.com/withastro/astro/pull/3564) [`76fb01cf`](https://github.com/withastro/astro/commit/76fb01cff1002f2a37e93869378802156c4eca7c) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix autolinking of URLs inside links

* [#3554](https://github.com/withastro/astro/pull/3554) [`c549f161`](https://github.com/withastro/astro/commit/c549f161cadd76a666672556f2c2d63b5f97f00d) Thanks [@hippotastic](https://github.com/hippotastic)! - Allow AlpineJS syntax extensions in Markdown

## 0.11.0

### Minor Changes

- [#3502](https://github.com/withastro/astro/pull/3502) [`939fe159`](https://github.com/withastro/astro/commit/939fe159255cecf1cab5c1b3da2670d30ac8e4a7) Thanks [@nokazn](https://github.com/nokazn)! - Fix cases for JSX-like expressions in code blocks of headings

### Patch Changes

- [#3514](https://github.com/withastro/astro/pull/3514) [`6c955ca6`](https://github.com/withastro/astro/commit/6c955ca643a7a071609ce8a5258cc7faf5a636b2) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix Markdown errors missing source filename

* [#3516](https://github.com/withastro/astro/pull/3516) [`30578015`](https://github.com/withastro/astro/commit/30578015919e019cd8dd354288a45c1fc63bd01f) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix: Allow self-closing tags in Markdown

## 0.10.2

### Patch Changes

- [#3486](https://github.com/withastro/astro/pull/3486) [`119ecf8d`](https://github.com/withastro/astro/commit/119ecf8d469f034eaf1b1217523954d29f492cb6) Thanks [@hippotastic](https://github.com/hippotastic)! - Fix components in markdown regressions

## 0.10.1

### Patch Changes

- [#3444](https://github.com/withastro/astro/pull/3444) [`51db2b9b`](https://github.com/withastro/astro/commit/51db2b9b4efd899bdd7efc481a5f226b3b040614) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: markdown imports failing due to internal dependency issue

## 0.10.0

### Minor Changes

- [#3410](https://github.com/withastro/astro/pull/3410) [`cfae9760`](https://github.com/withastro/astro/commit/cfae9760b252052b6189e96398b819a4337634a8) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Significantally more stable behavior for "Markdown + Components" usage, which now handles component serialization much more similarly to MDX. Also supports switching between Components and Markdown without extra newlines, removes wrapping `<p>` tags from standalone components, and improves JSX expression handling.

## 0.9.4

### Patch Changes

- [#3275](https://github.com/withastro/astro/pull/3275) [`8f8f05c1`](https://github.com/withastro/astro/commit/8f8f05c1b99d073a43af3020ba3922ea2d5b466d) Thanks [@matthewp](https://github.com/matthewp)! - Fixes regression in passing JS args to islands

## 0.9.3

### Patch Changes

- [#3234](https://github.com/withastro/astro/pull/3234) [`de123b28`](https://github.com/withastro/astro/commit/de123b28b3ff398b800cb598f20326ca85a0fb60) Thanks [@JuanM04](https://github.com/JuanM04)! - Removed `rehype-slug` in favor of our own implementation. The behavior of the slugging should remain the same

* [#3234](https://github.com/withastro/astro/pull/3234) [`de123b28`](https://github.com/withastro/astro/commit/de123b28b3ff398b800cb598f20326ca85a0fb60) Thanks [@JuanM04](https://github.com/JuanM04)! - Moved some type from `astro` to `@astrojs/markdown-remark`

## 0.9.2

### Patch Changes

- [#3152](https://github.com/withastro/astro/pull/3152) [`9ba1f4f8`](https://github.com/withastro/astro/commit/9ba1f4f8251155b69398a8af22d6ab8587b96120) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix JSX expression inconsistencies within markdown files

## 0.9.1

### Patch Changes

- [#3108](https://github.com/withastro/astro/pull/3108) [`ef198ff8`](https://github.com/withastro/astro/commit/ef198ff8351ac8fbc868e209f9cd410dc8b6f265) Thanks [@FredKSchott](https://github.com/FredKSchott)! - shiki: Add `diff` symbol handling to disable `user-select` on `+`/`-` symbols.

## 0.9.0

### Minor Changes

- [`53162534`](https://github.com/withastro/astro/commit/53162534450e160f65b95e7ef1523a106347ca28) Thanks [@FredKSchott](https://github.com/FredKSchott)! - - Removed `renderMarkdownWithFrontmatter` because it wasn't being used
  - All options of `renderMarkdown` are now required — see the exported interface `AstroMarkdownOptions`
  - New types: RemarkPlugin, RehypePlugin and ShikiConfig

## 0.8.2

### Patch Changes

- [#2970](https://github.com/withastro/astro/pull/2970) [`b835e285`](https://github.com/withastro/astro/commit/b835e285defb4f31fc5ac1039c7f607c07f3c00b) Thanks [@JuanM04](https://github.com/JuanM04)! - Improved type checking

## 0.8.1

### Patch Changes

- [#2971](https://github.com/withastro/astro/pull/2971) [`ad3c3916`](https://github.com/withastro/astro/commit/ad3c391696c5b9cc350a22831717682e73e25776) Thanks [@JuanM04](https://github.com/JuanM04)! - Escape expressions when mode == 'md'

## 0.8.0

### Minor Changes

- [`e425f896`](https://github.com/withastro/astro/commit/e425f896b668d98033ad3b998b50c1f28bc7f6ee) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Update config options to respect [RFC0019](https://github.com/withastro/rfcs/blob/main/proposals/0019-config-finalization.md)

## 0.7.0

### Minor Changes

- [#2824](https://github.com/withastro/astro/pull/2824) [`0a3d3e51`](https://github.com/withastro/astro/commit/0a3d3e51a66af80fa949ba0f5e2104439d2be634) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Change shiki to our default markdown syntax highlighter. This includes updates to all relevant starter projects that used Prism-specific styles.

### Patch Changes

- [#2870](https://github.com/withastro/astro/pull/2870) [`d763ec18`](https://github.com/withastro/astro/commit/d763ec183ea391ad79ca16bf2b2e76848fc1180c) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Fix a shiki performance issue affecting large sites

- Updated dependencies [[`2db97f10`](https://github.com/withastro/astro/commit/2db97f10dc50f9498413181b78c477fe8833895b)]:
  - @astrojs/prism@0.4.1

## 0.7.0-next.1

### Patch Changes

- [#2870](https://github.com/withastro/astro/pull/2870) [`d763ec18`](https://github.com/withastro/astro/commit/d763ec183ea391ad79ca16bf2b2e76848fc1180c) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Fix a shiki performance issue affecting large sites

- Updated dependencies [[`2db97f10`](https://github.com/withastro/astro/commit/2db97f10dc50f9498413181b78c477fe8833895b)]:
  - @astrojs/prism@0.4.1-next.0

## 0.7.0-next.0

### Minor Changes

- [#2824](https://github.com/withastro/astro/pull/2824) [`0a3d3e51`](https://github.com/withastro/astro/commit/0a3d3e51a66af80fa949ba0f5e2104439d2be634) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Change shiki to our default markdown syntax highlighter. This includes updates to all relevant starter projects that used Prism-specific styles.

## 0.6.4

### Patch Changes

- [#2706](https://github.com/withastro/astro/pull/2706) [`b2c37385`](https://github.com/withastro/astro/commit/b2c37385f94614232d9a378ef2ef3264d5405cc8) Thanks [@JuanM04](https://github.com/JuanM04)! - Changed `data-astro-raw` to `is:raw` internally

## 0.6.3

### Patch Changes

- [#2697](https://github.com/withastro/astro/pull/2697) [`91765d79`](https://github.com/withastro/astro/commit/91765d79b1ec1181417fb6a4604a9e20564bb10e) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Improve performance by optimizing calls to `getHighlighter`

## 0.6.2

### Patch Changes

- [#2628](https://github.com/withastro/astro/pull/2628) [`9b7e2ab2`](https://github.com/withastro/astro/commit/9b7e2ab2516cd36520364490df8e3482008292e3) Thanks [@JuanM04](https://github.com/JuanM04)! - Fixed shiki to work with `{ "type": "module" }`

## 0.6.1

### Patch Changes

- [#2534](https://github.com/withastro/astro/pull/2534) [`cfeaa941`](https://github.com/withastro/astro/commit/cfeaa9414acdecec6f5d66ee0e33fe4fde574eee) Thanks [@JuanM04](https://github.com/JuanM04)! - Now you can use local plugins by passing a function instead of an `import`

* [#2518](https://github.com/withastro/astro/pull/2518) [`2bc91543`](https://github.com/withastro/astro/commit/2bc91543ceeb5f3dd45e201bf75d79f186e85141) Thanks [@JuanM04](https://github.com/JuanM04)! - Added the ability to use custom themes and langs with Shiki (`<Code />` and `@astrojs/markdown-remark`)

- [#2497](https://github.com/withastro/astro/pull/2497) [`6fe1b027`](https://github.com/withastro/astro/commit/6fe1b0279fce5a7a0e90ff79746ea0b641da3e21) Thanks [@JuanM04](https://github.com/JuanM04)! - Add Shiki as an alternative to Prism

* [#2518](https://github.com/withastro/astro/pull/2518) [`2bc91543`](https://github.com/withastro/astro/commit/2bc91543ceeb5f3dd45e201bf75d79f186e85141) Thanks [@JuanM04](https://github.com/JuanM04)! - Added `wrap` to Shiki config

- [#2564](https://github.com/withastro/astro/pull/2564) [`d71c4620`](https://github.com/withastro/astro/commit/d71c46207af40de6811596ca4f5e10aa9006377b) Thanks [@JuanM04](https://github.com/JuanM04)! - Fixed curly braces inside Shiki codeblocks

## 0.6.1-next.2

### Patch Changes

- [#2564](https://github.com/withastro/astro/pull/2564) [`d71c4620`](https://github.com/withastro/astro/commit/d71c46207af40de6811596ca4f5e10aa9006377b) Thanks [@JuanM04](https://github.com/JuanM04)! - Fixed curly braces inside Shiki codeblocks

## 0.6.1-next.1

### Patch Changes

- [#2534](https://github.com/withastro/astro/pull/2534) [`cfeaa941`](https://github.com/withastro/astro/commit/cfeaa9414acdecec6f5d66ee0e33fe4fde574eee) Thanks [@JuanM04](https://github.com/JuanM04)! - Now you can use local plugins by passing a function instead of an `import`

* [#2518](https://github.com/withastro/astro/pull/2518) [`2bc91543`](https://github.com/withastro/astro/commit/2bc91543ceeb5f3dd45e201bf75d79f186e85141) Thanks [@JuanM04](https://github.com/JuanM04)! - Added the ability to use custom themes and langs with Shiki (`<Code />` and `@astrojs/markdown-remark`)

- [#2518](https://github.com/withastro/astro/pull/2518) [`2bc91543`](https://github.com/withastro/astro/commit/2bc91543ceeb5f3dd45e201bf75d79f186e85141) Thanks [@JuanM04](https://github.com/JuanM04)! - Added `wrap` to Shiki config

## 0.6.1-next.0

### Patch Changes

- [#2497](https://github.com/withastro/astro/pull/2497) [`6fe1b027`](https://github.com/withastro/astro/commit/6fe1b0279fce5a7a0e90ff79746ea0b641da3e21) Thanks [@JuanM04](https://github.com/JuanM04)! - Add Shiki as an alternative to Prism

## 0.6.0

### Minor Changes

- [#2202](https://github.com/withastro/astro/pull/2202) [`45cea6ae`](https://github.com/withastro/astro/commit/45cea6aec5a310fed4cb8da0d96670d6b99a2539) Thanks [@jonathantneal](https://github.com/jonathantneal)! - Officially drop support for Node v12. The minimum supported version is now Node v14.15+,

### Patch Changes

- Updated dependencies [[`45cea6ae`](https://github.com/withastro/astro/commit/45cea6aec5a310fed4cb8da0d96670d6b99a2539)]:
  - @astrojs/prism@0.4.0

## 0.5.0

### Minor Changes

- 679d4395: - Upgraded dependencies
  - Replaced `remark-slug` with `rehype-slug` because [it was deprecated](https://github.com/remarkjs/remark-slug)
  - Replaced `@silvenon/remark-smartypants` with `remark-smartypants` because its name was changed
  - Disable **all** built-in plugins when custom remark and/or rehype plugins are added
  - Removed `remark-footnotes` because [`remark-gfm` now supports footnotes](https://github.com/remarkjs/remark-gfm/releases/tag/3.0.0)
  - Re-added `remark-smartypants` and `rehype-slug` to the default plugins list

## 0.4.0

### Minor Changes

- e6aaeff5: Initial release.

### Patch Changes

- Updated dependencies [e6aaeff5]
  - @astrojs/prism@0.3.0

## 0.4.0-next.2

### Patch Changes

- 00d2b625: Move gray-matter to deps

## 0.4.0-next.1

### Patch Changes

- 7eaabbb0: Fix bug where code blocks would not be escaped properly

## 0.4.0-next.0

### Minor Changes

- d84bfe71: Adds prism support within the Markdown plugin.

### Patch Changes

- Updated dependencies [d84bfe71]
  - @astrojs/prism@0.3.0-next.0

## 0.3.1

### Patch Changes

- b03f8771: Fix parsing of an empty `<pre></pre>` tag in markdown files, which expected the pre tag to have a child
- b03f8771: Fix the importing of `unified` `Plugin` and `UnifiedPlugin` types

## 0.3.0

### Minor Changes

- 397d8f3d: Upgrade `@astrojs/markdown-support` dependencies. The `remark-rehype@9` upgrade enables accessible footnotes with `remark-footnotes`.

## 0.2.4

### Patch Changes

- a421329f: Fix the left-brace issue

## 0.2.3

### Patch Changes

- 460e625: Move remaining missing dependencies

## 0.2.2

### Patch Changes

- 7015356: Move rehype-raw to a dependency

## 0.2.1

### Patch Changes

- 70f0a09: Added remark-slug to default plugins

## 0.2.0

### Minor Changes

- d396943: Add support for [`remark`](https://github.com/remarkjs/remark#readme) and [`rehype`](https://github.com/rehypejs/rehype#readme) plugins for both `.md` pages and `.astro` pages using the [`<Markdown>`](/docs/guides/markdown-content.md) component.

  For example, the `astro.config.mjs` could be updated to include the following. [Read the Markdown documentation](/docs/guides/markdown-content.md) for more information.

  > **Note** Enabling custom `remarkPlugins` or `rehypePlugins` removes Astro's built-in support for [GitHub-flavored Markdown](https://github.github.com/gfm/) support, [Footnotes](https://github.com/remarkjs/remark-footnotes) syntax, [Smartypants](https://github.com/silvenon/remark-smartypants). You must explicitly add these plugins to your `astro.config.mjs` file, if desired.

  ```js
  export default {
    markdownOptions: {
      remarkPlugins: ['remark-slug', ['remark-autolink-headings', { behavior: 'prepend' }]],
      rehypePlugins: ['rehype-slug', ['rehype-autolink-headings', { behavior: 'prepend' }]],
    },
  };
  ```

### Patch Changes

- f83407e: Expose `html` to `Astro.fetchContent` (#571)

## 0.1.2

### Patch Changes

- f9f2da4: Add repository key to all package.json

## 0.1.1

### Patch Changes

- 50e6f49: Fixes issues with using astro via the create script
