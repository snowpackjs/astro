# create-astro

## 4.11.0

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

- [#12083](https://github.com/withastro/astro/pull/12083) [`9263e96`](https://github.com/withastro/astro/commit/9263e965932b9a6a116801c063c6b7105c39643e) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Reworks the experience of creating a new Astro project using the `create astro` CLI command.

  - Updates the list of templates to include Starlight and combines the "minimal" and "basics" templates into a new, refreshed "Basics" template to serve as the single, minimal Astro project starter.
  - Removes the TypeScript question. Astro is TypeScript-only, so this question was often misleading. The "Strict" preset is now the default, but it can still be changed manually in `tsconfig.json`.
  - `astro check` is no longer automatically added to the build script.
  - Added a new `--add` flag to install additional integrations after creating a project. For example, `pnpm create astro --add react` will create a new Astro project and install the React integration.

## 4.11.0-beta.1

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

## 4.11.0-beta.0

### Minor Changes

- [#12083](https://github.com/withastro/astro/pull/12083) [`9263e96`](https://github.com/withastro/astro/commit/9263e965932b9a6a116801c063c6b7105c39643e) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Reworks the experience of creating a new Astro project using the `create astro` CLI command.

  - Updates the list of templates to include Starlight and combines the "minimal" and "basics" templates into a new, refreshed "Basics" template to serve as the single, minimal Astro project starter.
  - Removes the TypeScript question. Astro is TypeScript-only, so this question was often misleading. The "Strict" preset is now the default, but it can still be changed manually in `tsconfig.json`.
  - `astro check` is no longer automatically added to the build script.
  - Added a new `--add` flag to install additional integrations after creating a project. For example, `pnpm create astro --add react` will create a new Astro project and install the React integration.

## 4.10.0

### Minor Changes

- [#12154](https://github.com/withastro/astro/pull/12154) [`9988dd6`](https://github.com/withastro/astro/commit/9988dd67e2e4647c974979470d2e63d80433b611) Thanks [@bluwy](https://github.com/bluwy)! - Improves default template download speed by downloading from a branch containing the template only

- [#12186](https://github.com/withastro/astro/pull/12186) [`49c4f64`](https://github.com/withastro/astro/commit/49c4f64673390f7035258d662755988f0fb71a94) Thanks [@Terfno](https://github.com/Terfno)! - Ensures new line at the end of the generated `package.json` and `tsconfig.json` files

## 4.9.2

### Patch Changes

- [#12143](https://github.com/withastro/astro/pull/12143) [`2385d58`](https://github.com/withastro/astro/commit/2385d58389ee975a53f4089f2a7220d97cf3cdff) Thanks [@bluwy](https://github.com/bluwy)! - Uses `@bluwy/giget-core` instead of `giget` for smaller installation size when downloading the CLI

## 4.9.1

### Patch Changes

- [#12118](https://github.com/withastro/astro/pull/12118) [`f47b347`](https://github.com/withastro/astro/commit/f47b347da899c6e1dcd0b2e7887f7fce6ec8e270) Thanks [@Namchee](https://github.com/Namchee)! - Removes the `strip-ansi` dependency in favor of the native Node API

## 4.9.0

### Minor Changes

- [#11924](https://github.com/withastro/astro/pull/11924) [`7d70ba3`](https://github.com/withastro/astro/commit/7d70ba317889b9281c7891038779a68fcb8f0778) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Updates the default Astro config with `// @ts-check` if the Typescript preset is `strict` or `strictest`

## 4.8.4

### Patch Changes

- [#11766](https://github.com/withastro/astro/pull/11766) [`d12dcbf`](https://github.com/withastro/astro/commit/d12dcbff606dd8330075ba77d73ed3cbc79d7421) Thanks [@bluwy](https://github.com/bluwy)! - Fixes initial git commit when initializing git

## 4.8.3

### Patch Changes

- [#11733](https://github.com/withastro/astro/pull/11733) [`391324d`](https://github.com/withastro/astro/commit/391324df969db71d1c7ca25c2ed14c9eb6eea5ee) Thanks [@bluwy](https://github.com/bluwy)! - Reverts back to `arg` package for CLI argument parsing

## 4.8.2

### Patch Changes

- [#11645](https://github.com/withastro/astro/pull/11645) [`849e4c6`](https://github.com/withastro/astro/commit/849e4c6c23e61f7fa59f583419048b998bef2475) Thanks [@bluwy](https://github.com/bluwy)! - Refactors internally to use `node:util` `parseArgs` instead of `arg`

## 4.8.1

### Patch Changes

- [#11567](https://github.com/withastro/astro/pull/11567) [`d27cf6d`](https://github.com/withastro/astro/commit/d27cf6df7bd612642a1e8da5948333b00b70e8bd) Thanks [@ascorbic](https://github.com/ascorbic)! - Logs underlying error when a template cannot be downloaded

## 4.8.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

## 4.7.5

### Patch Changes

- [#10487](https://github.com/withastro/astro/pull/10487) [`2330f22d6cf8cd150c19ec40359aed4d6b43ddec`](https://github.com/withastro/astro/commit/2330f22d6cf8cd150c19ec40359aed4d6b43ddec) Thanks [@satyarohith](https://github.com/satyarohith)! - Fixes a case where a promise wasn't awaited, causing an issue in Deno.

## 4.7.4

### Patch Changes

- [#10255](https://github.com/withastro/astro/pull/10255) [`2aec2cdc21f48f9b4f1dd82e2fd16fa3d653ccc5`](https://github.com/withastro/astro/commit/2aec2cdc21f48f9b4f1dd82e2fd16fa3d653ccc5) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fixes an issue where TypeScript and `@astrojs/check` versions would occasionally print as `undefined`.

## 4.7.3

### Patch Changes

- [#10117](https://github.com/withastro/astro/pull/10117) [`51b6ff7403c1223b1c399e88373075972c82c24c`](https://github.com/withastro/astro/commit/51b6ff7403c1223b1c399e88373075972c82c24c) Thanks [@hippotastic](https://github.com/hippotastic)! - Fixes an issue where `create astro`, `astro add` and `@astrojs/upgrade` would fail due to unexpected package manager CLI output.

## 4.7.2

### Patch Changes

- [#9813](https://github.com/withastro/astro/pull/9813) [`fecba30a1abb7ca65dfb8f506dde77117fa447d1`](https://github.com/withastro/astro/commit/fecba30a1abb7ca65dfb8f506dde77117fa447d1) Thanks [@florian-lefebvre](https://github.com/florian-lefebvre)! - Fixes `@astrojs/check` and `typescript` addition to `package.json` dependencies when the user has decided not to auto-install dependencies

## 4.7.1

### Patch Changes

- [#9476](https://github.com/withastro/astro/pull/9476) [`651f45b4010ad9b8d9f61fdc748618e220fe5375`](https://github.com/withastro/astro/commit/651f45b4010ad9b8d9f61fdc748618e220fe5375) Thanks [@ElianCodes](https://github.com/ElianCodes)! - Improves seasonal message handling by automatically detecting the local date

## 4.7.0

### Minor Changes

- [#9470](https://github.com/withastro/astro/pull/9470) [`607303be198931825dac9f3bc97867b4886feaf3`](https://github.com/withastro/astro/commit/607303be198931825dac9f3bc97867b4886feaf3) Thanks [@onsclom](https://github.com/onsclom)! - Improves the `create astro` CLI experience by asking all the questions upfront, then creating your new Astro project based on your responses.

## 4.6.0

### Minor Changes

- [#9358](https://github.com/withastro/astro/pull/9358) [`35e4c17fe`](https://github.com/withastro/astro/commit/35e4c17fe245179dd88af679a5f0a08785b7bfef) Thanks [@xiBread](https://github.com/xiBread)! - feat: make Houston festive for the holiday season

## 4.5.2

### Patch Changes

- [#9105](https://github.com/withastro/astro/pull/9105) [`6201bbe96`](https://github.com/withastro/astro/commit/6201bbe96c2a083fb201e4a43a9bd88499821a3e) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Stop clearing the console on start

## 4.5.2-beta.0

### Patch Changes

- [#9105](https://github.com/withastro/astro/pull/9105) [`6201bbe96`](https://github.com/withastro/astro/commit/6201bbe96c2a083fb201e4a43a9bd88499821a3e) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Stop clearing the console on start

## 4.5.1

### Patch Changes

- [#9048](https://github.com/withastro/astro/pull/9048) [`1e97708cd`](https://github.com/withastro/astro/commit/1e97708cda779510d638abaefdb4abf707b697e3) Thanks [@skirianov](https://github.com/skirianov)! - Fixes an issue where a successful "Dependencies installed" message is displayed even when installing dependencies fails.

## 4.5.0

### Minor Changes

- [#8959](https://github.com/withastro/astro/pull/8959) [`6169b6e56`](https://github.com/withastro/astro/commit/6169b6e56152b1ba944416d85551994788cfb887) Thanks [@ElianCodes](https://github.com/ElianCodes)! - Undo the halloween theme and restore `fancy` behaviour

### Patch Changes

- [#8939](https://github.com/withastro/astro/pull/8939) [`71455c16c`](https://github.com/withastro/astro/commit/71455c16c371aaca4b5a551b713a77c6820efd78) Thanks [@wktk](https://github.com/wktk)! - Fixes TypeScript installation issue with yarn

## 4.4.1

### Patch Changes

- [#8911](https://github.com/withastro/astro/pull/8911) [`b236d88ad`](https://github.com/withastro/astro/commit/b236d88addc48d784bd60119fe45750dda900f16) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Ensure an existing template's `package.json` `scripts` are respected when modifying `build`.

## 4.4.0

### Minor Changes

- [#8853](https://github.com/withastro/astro/pull/8853) [`ce807a2bf`](https://github.com/withastro/astro/commit/ce807a2bfef325683bfdb01065a73c4e2b0a5fe5) Thanks [@rayriffy](https://github.com/rayriffy)! - Automatically installs the required dependencies to run the astro check command when the user indicates they plan to write TypeScript.

### Patch Changes

- [#8841](https://github.com/withastro/astro/pull/8841) [`f2dd895d7`](https://github.com/withastro/astro/commit/f2dd895d71e0fccfbc1b98890ceefb69f32524d5) Thanks [@Genteure](https://github.com/Genteure)! - No longer attempts to delete the directory after a template download fails if the path is `.`, `./` or starts with `../`.

## 4.3.0

### Minor Changes

- [#8846](https://github.com/withastro/astro/pull/8846) [`3baab3d93`](https://github.com/withastro/astro/commit/3baab3d93b8d16517cb089b0fa2c4028f21e780f) Thanks [@ElianCodes](https://github.com/ElianCodes)! - feat: make Houston wear scary hats and say new things for spooky season

## 4.2.1

### Patch Changes

- [#8634](https://github.com/withastro/astro/pull/8634) [`b64dd45c0`](https://github.com/withastro/astro/commit/b64dd45c0d641f9f2ed997e2cbdf8a6b0193195f) Thanks [@TheOtterlord](https://github.com/TheOtterlord)! - Fix `--yes` behaviour to prevent it overriding `--template`

## 4.2.0

### Minor Changes

- [#8551](https://github.com/withastro/astro/pull/8551) [`1d5b3f079`](https://github.com/withastro/astro/commit/1d5b3f079d0b4aa5a5c46f97b8b724ab88497fbe) Thanks [@jacobthesheep](https://github.com/jacobthesheep)! - Adds `--yes` and `dry-run` flags to project-name and the `yes` flag to template.

## 4.1.0

### Minor Changes

- [#8456](https://github.com/withastro/astro/pull/8456) [`ed952b4ce`](https://github.com/withastro/astro/commit/ed952b4cea6f60a4e158a5b20cc36f5e91a6b07f) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve startup performance by removing dependencies, lazily initializing async contextual values

## 4.0.2

### Patch Changes

- [#8427](https://github.com/withastro/astro/pull/8427) [`b81ff8fce`](https://github.com/withastro/astro/commit/b81ff8fcefe6c30312d7b2050a63b1520d79b25f) Thanks [@aswind7](https://github.com/aswind7)! - trim project name of the user input

- [#8306](https://github.com/withastro/astro/pull/8306) [`d2f2a11cd`](https://github.com/withastro/astro/commit/d2f2a11cdb42b0de79be21c798eda8e7e7b2a277) Thanks [@jacobthesheep](https://github.com/jacobthesheep)! - Support detecting Bun when logging messages with package manager information.

## 4.0.1

### Patch Changes

- [#8292](https://github.com/withastro/astro/pull/8292) [`4e88ffd81`](https://github.com/withastro/astro/commit/4e88ffd813a3a9fa37b2ddd1a2eff181d4a99c0f) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Correctly remove new `.codesandbox` folder when copying template

## 4.0.0

### Major Changes

- [#8188](https://github.com/withastro/astro/pull/8188) [`d0679a666`](https://github.com/withastro/astro/commit/d0679a666f37da0fca396d42b9b32bbb25d29312) Thanks [@ematipico](https://github.com/ematipico)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 4.0.0-rc.2

### Major Changes

- [#8179](https://github.com/withastro/astro/pull/8179) [`6011d52d3`](https://github.com/withastro/astro/commit/6011d52d38e43c3e3d52bc3bc41a60e36061b7b7) Thanks [@matthewp](https://github.com/matthewp)! - Astro 3.0 Release Candidate

## 4.0.0-beta.1

### Patch Changes

- [#7944](https://github.com/withastro/astro/pull/7944) [`dff0f0f8d`](https://github.com/withastro/astro/commit/dff0f0f8ddd531c5d92a90ac00fdb86d71f77509) Thanks [@colinhacks](https://github.com/colinhacks)! - Update 'dev' command for Bun users

- [#8102](https://github.com/withastro/astro/pull/8102) [`e6e1de4f0`](https://github.com/withastro/astro/commit/e6e1de4f08ddba3a7703136a81f275de1976dc9e) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Verify internet connection and that `--template` exists before continuing

## 4.0.0-beta.0

### Major Changes

- [`1eae2e3f7`](https://github.com/withastro/astro/commit/1eae2e3f7d693c9dfe91c8ccfbe606d32bf2fb81) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 16. The lowest supported version by Astro and all integrations is now v18.14.1. As a reminder, Node 16 will be deprecated on the 11th September 2023.

## 3.2.2

### Patch Changes

- [#7944](https://github.com/withastro/astro/pull/7944) [`dff0f0f8d`](https://github.com/withastro/astro/commit/dff0f0f8ddd531c5d92a90ac00fdb86d71f77509) Thanks [@colinhacks](https://github.com/colinhacks)! - Update 'dev' command for Bun users

- [#8102](https://github.com/withastro/astro/pull/8102) [`e6e1de4f0`](https://github.com/withastro/astro/commit/e6e1de4f08ddba3a7703136a81f275de1976dc9e) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Verify internet connection and that `--template` exists before continuing

## 3.2.1

### Patch Changes

- [#8089](https://github.com/withastro/astro/pull/8089) [`04755e846`](https://github.com/withastro/astro/commit/04755e84658ea10914a09f3d07f302267326d610) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix install step to avoid uncaught errors

## 3.2.0

### Minor Changes

- [#8077](https://github.com/withastro/astro/pull/8077) [`44cf30a25`](https://github.com/withastro/astro/commit/44cf30a25209b331e6e8a95a4b40a768ede3604a) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Reduce dependency installation size, swap `execa` for light `node:child_process` wrapper

## 3.1.13

### Patch Changes

- [#8028](https://github.com/withastro/astro/pull/8028) [`8292c4131`](https://github.com/withastro/astro/commit/8292c41311ec41d9d50921fbb2bdeed69e039443) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve yarn berry support

## 3.1.12

### Patch Changes

- [#7993](https://github.com/withastro/astro/pull/7993) [`315d58f27`](https://github.com/withastro/astro/commit/315d58f27b022c9d4285cf13f445ed18c26c327e) Thanks [@delucis](https://github.com/delucis)! - Add support for more Starlight templates

## 3.1.11

### Patch Changes

- [#7939](https://github.com/withastro/astro/pull/7939) [`89cd4b877`](https://github.com/withastro/astro/commit/89cd4b877e870ce4a263dd45f42f818fd2c4d5a6) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Handle error state for version number

## 3.1.10

### Patch Changes

- [#7580](https://github.com/withastro/astro/pull/7580) [`2ca5bdde2`](https://github.com/withastro/astro/commit/2ca5bdde2b1acc2be1586a99686a9a48cdef65dc) Thanks [@sankethchebbi](https://github.com/sankethchebbi)! - Update dependency installation grammar

## 3.1.9

### Patch Changes

- [#7527](https://github.com/withastro/astro/pull/7527) [`9e2426f75`](https://github.com/withastro/astro/commit/9e2426f75637a6318961f483de90b635f3fdadeb) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Default registry logic to fallback to NPM if registry command fails (sorry, Bun users!)

- [#7539](https://github.com/withastro/astro/pull/7539) [`1170877b5`](https://github.com/withastro/astro/commit/1170877b51aaa13203e8c488dcf4e39d1b5553ee) Thanks [@jc1144096387](https://github.com/jc1144096387)! - Update registry logic, improving edge cases (http support, redirects, registries ending with '/')

## 3.1.8

### Patch Changes

- [#7435](https://github.com/withastro/astro/pull/7435) [`3f9f5c117`](https://github.com/withastro/astro/commit/3f9f5c117e4e9e4a0c0a648cb6db9a3073cd5727) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix registry failures using unexpected package managers when running create-astro

## 3.1.7

### Patch Changes

- [#7326](https://github.com/withastro/astro/pull/7326) [`1430ffb47`](https://github.com/withastro/astro/commit/1430ffb4734edbb67cbeaaee7e89a9f78e00473c) Thanks [@calebdwilliams](https://github.com/calebdwilliams)! - Ensure create-astro respects package manager registry configuration

## 3.1.6

### Patch Changes

- [#7277](https://github.com/withastro/astro/pull/7277) [`229affca4`](https://github.com/withastro/astro/commit/229affca405ce77bf80bcea6a91891f689a3161b) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Add `starlight` template alias

## 3.1.5

### Patch Changes

- [#7086](https://github.com/withastro/astro/pull/7086) [`c5f1275e9`](https://github.com/withastro/astro/commit/c5f1275e9d2f212a08e56bc25e0b59c7d7e9f11d) Thanks [@MoustaphaDev](https://github.com/MoustaphaDev)! - Fix create astro regression

## 3.1.4

### Patch Changes

- [#7052](https://github.com/withastro/astro/pull/7052) [`8c14bffbd`](https://github.com/withastro/astro/commit/8c14bffbd9ea63bc4b4e9f9417352fdf4e7e65b4) Thanks [@ematipico](https://github.com/ematipico)! - Don't exit if dependencies fail to install

## 3.1.3

### Patch Changes

- [#6682](https://github.com/withastro/astro/pull/6682) [`335602344`](https://github.com/withastro/astro/commit/33560234437647f2d768578e7b285c858bff7898) Thanks [@andremralves](https://github.com/andremralves)! - add validation for non-printable characters

## 3.1.2

### Patch Changes

- [#6677](https://github.com/withastro/astro/pull/6677) [`4a3262060`](https://github.com/withastro/astro/commit/4a32620600966ea89ddb5e1669d89a53e85ccf9a) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Fix: Log an error when passing a `--template` that does not exist

## 3.1.1

### Patch Changes

- [#6594](https://github.com/withastro/astro/pull/6594) [`a661907b4`](https://github.com/withastro/astro/commit/a661907b40e76aa56e7d7bd7e745bb16456b13e7) Thanks [@btea](https://github.com/btea)! - wrap `projectDir` in quotes if it contains spaces

## 3.1.0

### Minor Changes

- [#6213](https://github.com/withastro/astro/pull/6213) [`afbbc4d5b`](https://github.com/withastro/astro/commit/afbbc4d5bfafc1779bac00b41c2a1cb1c90f2808) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Updated compilation settings to disable downlevelling for Node 14

## 3.0.5

### Patch Changes

- [#6375](https://github.com/withastro/astro/pull/6375) [`754c5ca9a`](https://github.com/withastro/astro/commit/754c5ca9aa93d4e8674059ce79f6b694c147db83) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Respect original `package.json` indentation

## 3.0.4

### Patch Changes

- [#6352](https://github.com/withastro/astro/pull/6352) [`c87c16cfa`](https://github.com/withastro/astro/commit/c87c16cfaddea3a05af87c3258d57ef1a31516f7) Thanks [@SerekKiri](https://github.com/SerekKiri)! - Add missing flags to help command

## 3.0.3

### Patch Changes

- [#6314](https://github.com/withastro/astro/pull/6314) [`7f61e8fe3`](https://github.com/withastro/astro/commit/7f61e8fe36b62a1833180c18b6f4304e9a01fce4) Thanks [@MilesPernicious](https://github.com/MilesPernicious)! - Prompt for git initialization last, so all configurations can get added to the initial commit

- [#6294](https://github.com/withastro/astro/pull/6294) [`d0dbee872`](https://github.com/withastro/astro/commit/d0dbee872fd09800fba644ccbf4011ce01149706) Thanks [@liruifengv](https://github.com/liruifengv)! - `create-astro` help info add `--typescript` flag

## 3.0.2

### Patch Changes

- [#6278](https://github.com/withastro/astro/pull/6278) [`0f5d122cd`](https://github.com/withastro/astro/commit/0f5d122cd538b65ec7208ddae5e60cfaddaf4b2c) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Revert to giget 1.0.0 until upstream issue is fixed

## 3.0.1

### Patch Changes

- [#6266](https://github.com/withastro/astro/pull/6266) [`066b4b4ef`](https://github.com/withastro/astro/commit/066b4b4efcde2320d29040c5bd385c67f30c701a) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve error handling during tasks that display a spinner

## 3.0.0

### Major Changes

- [#6082](https://github.com/withastro/astro/pull/6082) [`8d2187d8b`](https://github.com/withastro/astro/commit/8d2187d8b8587b2a3a0207d9ffa8667c43686436) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Redesigned `create-astro` experience

## 2.0.2

### Patch Changes

- [#5953](https://github.com/withastro/astro/pull/5953) [`5c64324c0`](https://github.com/withastro/astro/commit/5c64324c0a1b06e836c3d53668940faca4cb517d) Thanks [@ZermattChris](https://github.com/ZermattChris)! - Check for a pre-existing .git directory and if found, skip trying to create a new one.

## 2.0.1

### Patch Changes

- [#5958](https://github.com/withastro/astro/pull/5958) [`d0d7f6118`](https://github.com/withastro/astro/commit/d0d7f6118299bf328de5abd0b66450d8ac620da3) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix typescript prompt handling

## 2.0.0

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

### Patch Changes

- [#5898](https://github.com/withastro/astro/pull/5898) [`d8919b1a2`](https://github.com/withastro/astro/commit/d8919b1a2197616b70ec57f0fb00b0bde6943e43) Thanks [@TheOtterlord](https://github.com/TheOtterlord)! - Support headless runs with `-y` / `--yes`

- [#5920](https://github.com/withastro/astro/pull/5920) [`f27bb3d79`](https://github.com/withastro/astro/commit/f27bb3d79f9774f01037e60e656b1f9d8e03367d) Thanks [@delucis](https://github.com/delucis)! - Improve error message for third-party template 404s

## 2.0.0-beta.1

<details>
<summary>See changes in 2.0.0-beta.1</summary>

### Patch Changes

- [#5898](https://github.com/withastro/astro/pull/5898) [`d8919b1a2`](https://github.com/withastro/astro/commit/d8919b1a2197616b70ec57f0fb00b0bde6943e43) Thanks [@TheOtterlord](https://github.com/TheOtterlord)! - Support headless runs with `-y` / `--yes`

- [#5920](https://github.com/withastro/astro/pull/5920) [`f27bb3d79`](https://github.com/withastro/astro/commit/f27bb3d79f9774f01037e60e656b1f9d8e03367d) Thanks [@delucis](https://github.com/delucis)! - Improve error message for third-party template 404s

</details>

## 2.0.0-beta.0

<details>
<summary>See changes in 2.0.0-beta.0</summary>

### Major Changes

- [#5782](https://github.com/withastro/astro/pull/5782) [`1f92d64ea`](https://github.com/withastro/astro/commit/1f92d64ea35c03fec43aff64eaf704dc5a9eb30a) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Remove support for Node 14. Minimum supported Node version is now >=16.12.0

</details>

## 1.2.4

### Patch Changes

- [#5579](https://github.com/withastro/astro/pull/5579) [`2c2c65297`](https://github.com/withastro/astro/commit/2c2c65297a18c52691f09621ead55144efd601d4) Thanks [@yuhang-dong](https://github.com/yuhang-dong)! - Upgrade giget to support env proxy config

- [#5616](https://github.com/withastro/astro/pull/5616) [`61302ab7a`](https://github.com/withastro/astro/commit/61302ab7a09cc4c298c903d725e35355eb069497) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Skip Houston on Windows until we can debug the prompt issue

## 1.2.3

### Patch Changes

- [#5404](https://github.com/withastro/astro/pull/5404) [`505abfd64`](https://github.com/withastro/astro/commit/505abfd6430b1f71e52d10b02bf9beb5847df8b6) Thanks [@liruifengv](https://github.com/liruifengv)! - fix error when don't have template input

## 1.2.2

### Patch Changes

- [#5319](https://github.com/withastro/astro/pull/5319) [`b211eadef`](https://github.com/withastro/astro/commit/b211eadeffd6260700254c1492c8e6528d279ad1) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix bug with `setRawMode`. Respect `--skip-houston` in all cases.

## 1.2.1

### Patch Changes

- [#5240](https://github.com/withastro/astro/pull/5240) [`d9be7e36b`](https://github.com/withastro/astro/commit/d9be7e36b872eb48516dc9d0d5c9d333aac4950b) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improve error messages when `create-astro` fails

- [#5226](https://github.com/withastro/astro/pull/5226) [`641b6d7d5`](https://github.com/withastro/astro/commit/641b6d7d583886fde9529f296846d7e0a50e8624) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Allow Windows users to pass `--fancy` to enable full unicode support

## 1.2.0

### Minor Changes

- [#5088](https://github.com/withastro/astro/pull/5088) [`040837628`](https://github.com/withastro/astro/commit/04083762810a1a9e078a7e68edab945c8063b1ab) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Introducing your new automated assistant: Houston! 🎉

  ```
  ╭─────╮  Houston:
  │ ◠ ◡ ◠  Initiating launch sequence... right... now!
  ╰─────╯
  ```

  Updates template and TypeScript prompts for clarity and friendliness.

  Migrates template copying from [`degit`](https://github.com/Rich-Harris/degit) (unmaintained) to [`giget`](https://github.com/unjs/giget) for stability.

## 1.1.0

### Minor Changes

- [#4810](https://github.com/withastro/astro/pull/4810) [`7481ffda0`](https://github.com/withastro/astro/commit/7481ffda028d9028d8e28bc7c6e9960ab80acf0f) Thanks [@mrienstra](https://github.com/mrienstra)! - Always write chosen config to `tsconfig.json`.

  - Before: Only when `strict` & `strictest` was selected
  - After: Also when `base` is selected (via "Relaxed" or "I prefer not to use TypeScript")

## 1.0.2

### Patch Changes

- [#4805](https://github.com/withastro/astro/pull/4805) [`c84d85ba4`](https://github.com/withastro/astro/commit/c84d85ba4d85f250d87bbc98c74665992f6c2768) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Add support for running in cloned empty git repository

## 1.0.1

### Patch Changes

- [#4439](https://github.com/withastro/astro/pull/4439) [`77ce6be30`](https://github.com/withastro/astro/commit/77ce6be30c9cb8054ebf69a4943b984eed90152e) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add tsconfig templates for users to extend from

## 1.0.1-next.0

### Patch Changes

- [#4439](https://github.com/withastro/astro/pull/4439) [`77ce6be30`](https://github.com/withastro/astro/commit/77ce6be30c9cb8054ebf69a4943b984eed90152e) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add tsconfig templates for users to extend from

## 1.0.0

### Major Changes

- [`04ad44563`](https://github.com/withastro/astro/commit/04ad445632c67bdd60c1704e1e0dcbcaa27b9308) - > Astro v1.0 is out! Read the [official announcement post](https://astro.build/blog/astro-1/).

  **No breaking changes**. This package is now officially stable and compatible with `astro@1.0.0`!

## 0.15.1

### Patch Changes

- [#4183](https://github.com/withastro/astro/pull/4183) [`77c018e51`](https://github.com/withastro/astro/commit/77c018e5159e9084304ca650487b6e99c828d3cf) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fix relaxed and default TypeScript settings not working

## 0.15.0

### Minor Changes

- [#4179](https://github.com/withastro/astro/pull/4179) [`d344f9e3e`](https://github.com/withastro/astro/commit/d344f9e3ec1f69ad4d7efd433b3523ad5413b726) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Add a step to configure how strict TypeScript should be

## 0.14.3

### Patch Changes

- [#4075](https://github.com/withastro/astro/pull/4075) [`cc10a5c8e`](https://github.com/withastro/astro/commit/cc10a5c8e03683e64514de75e535169c187ab847) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Added better error handling when cancelling operations, providing bad templates and when there's a degit cache issue

## 0.14.2

### Patch Changes

- [#3971](https://github.com/withastro/astro/pull/3971) [`e6e216061`](https://github.com/withastro/astro/commit/e6e2160614c9af320419a599c42211d0147760f4) Thanks [@tony-sull](https://github.com/tony-sull)! - Fixes support for using templates from any GitHub repository

## 0.14.1

### Patch Changes

- [#3937](https://github.com/withastro/astro/pull/3937) [`31f9c0bf0`](https://github.com/withastro/astro/commit/31f9c0bf029ffa4b470e620f2c32e1370643e81e) Thanks [@delucis](https://github.com/delucis)! - Roll back supported Node engines

## 0.14.0

### Minor Changes

- [#3914](https://github.com/withastro/astro/pull/3914) [`b48767985`](https://github.com/withastro/astro/commit/b48767985359bd359df8071324952ea5f2bc0d86) Thanks [@ran-dall](https://github.com/ran-dall)! - Rollback supported `node@16` version. Minimum versions are now `node@14.20.0` or `node@16.14.0`.

## 0.13.0

### Minor Changes

- [#3871](https://github.com/withastro/astro/pull/3871) [`1cc5b7890`](https://github.com/withastro/astro/commit/1cc5b78905633608e5b07ad291f916f54e67feb1) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Update supported `node` versions. Minimum versions are now `node@14.20.0` or `node@16.16.0`.

### Patch Changes

- [#3886](https://github.com/withastro/astro/pull/3886) [`cb6a97383`](https://github.com/withastro/astro/commit/cb6a973839450dea1705407e1060919c946cca99) Thanks [@QuiiBz](https://github.com/QuiiBz)! - Fix portfolio example JSX error

## 0.12.5

### Patch Changes

- [#3831](https://github.com/withastro/astro/pull/3831) [`4fb08502`](https://github.com/withastro/astro/commit/4fb08502a99396723b9eb671099482cd619b3564) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Small wording updates

## 0.12.4

### Patch Changes

- [#3756](https://github.com/withastro/astro/pull/3756) [`507cd5c8`](https://github.com/withastro/astro/commit/507cd5c868448971c6265d97f22e786263dd5a77) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Chore: remove create-astro install step test

## 0.12.3

### Patch Changes

- [#3748](https://github.com/withastro/astro/pull/3748) [`012f093e`](https://github.com/withastro/astro/commit/012f093eeb771b42b4e9d1e0cbb0d9a9605e0514) Thanks [@delucis](https://github.com/delucis)! - Remove `astro add` step & tweak wording (PR #3715)

## 0.12.2

### Patch Changes

- [#3391](https://github.com/withastro/astro/pull/3391) [`cf8015ea`](https://github.com/withastro/astro/commit/cf8015eaa2b756f4ec399e8fd7071dee7dfa9ab6) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix [#3309](https://github.com/withastro/astro/issues/3309) default logger locale behavior.

## 0.12.1

### Patch Changes

- [#3313](https://github.com/withastro/astro/pull/3313) [`1a5335ed`](https://github.com/withastro/astro/commit/1a5335ed9abaef397ee9543a3b4ad7a3fddcf024) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Update "next steps" with more informative text on each CLI command. Oh, and gradients. A lot more gradients.

## 0.12.0

### Minor Changes

- [#3227](https://github.com/withastro/astro/pull/3227) [`c8f5fa35`](https://github.com/withastro/astro/commit/c8f5fa35c4c3cf08df45e6bd6cb78960782ae08b) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add "initialize git repository" step to simplify our next steps suggestion. We now give you a one-liner to easily paste in your terminal and start the dev server!

## 0.11.0

### Minor Changes

- [#3223](https://github.com/withastro/astro/pull/3223) [`b7cd6958`](https://github.com/withastro/astro/commit/b7cd69588453cf874346bf2f14c41accd183129e) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Replace the component framework selector with a new "run astro add" option. This unlocks integrations beyond components during your create-astro setup, including TailwindCSS and Partytown. This also replaces our previous "starter" template with a simplified "Just the basics" option.

## 0.10.1

### Patch Changes

- [#3212](https://github.com/withastro/astro/pull/3212) [`00fc1326`](https://github.com/withastro/astro/commit/00fc1326ed526974cc4aca9faec410df91b4bcbd) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Simplify logging during welcome message and directory selection

## 0.10.0

### Minor Changes

- [#3190](https://github.com/withastro/astro/pull/3190) [`38e5e9e9`](https://github.com/withastro/astro/commit/38e5e9e9825876cd0ae14a648b51bdf397e81169) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Feat: add option to install dependencies during setup. This respects the package manager used to run create-astro (ex. "yarn create astro" vs "pnpm create astro@latest").

## 0.9.0

### Minor Changes

- [#3168](https://github.com/withastro/astro/pull/3168) [`7c49194c`](https://github.com/withastro/astro/commit/7c49194ca2161a09cc304ba8327533f8176ae0da) Thanks [@bholmesdev](https://github.com/bholmesdev)! - Add prompt to choose a directory, now defaulting to a separate "./my-astro-site" instead of "." (current directory)

## 0.8.0

### Minor Changes

- [#2843](https://github.com/withastro/astro/pull/2843) [`1fdb63b5`](https://github.com/withastro/astro/commit/1fdb63b5d000d17edca77e870ce721e616a9c64a) Thanks [@JuanM04](https://github.com/JuanM04)! - Automatically add integration `peerDependencies` to scaffolded `package.json` files

## 0.8.0-next.0

### Minor Changes

- [#2843](https://github.com/withastro/astro/pull/2843) [`1fdb63b5`](https://github.com/withastro/astro/commit/1fdb63b5d000d17edca77e870ce721e616a9c64a) Thanks [@JuanM04](https://github.com/JuanM04)! - Automatically add integration `peerDependencies` to scaffolded `package.json` files

## 0.7.1

### Patch Changes

- [#2429](https://github.com/withastro/astro/pull/2429) [`fda857eb`](https://github.com/withastro/astro/commit/fda857eb22508f55233e297a887b356ea7b87398) Thanks [@Mikkel-T](https://github.com/Mikkel-T)! - Added an option to create-astro to use verbose logging which should help debug degit issues

## 0.7.0

### Minor Changes

- [#2202](https://github.com/withastro/astro/pull/2202) [`45cea6ae`](https://github.com/withastro/astro/commit/45cea6aec5a310fed4cb8da0d96670d6b99a2539) Thanks [@jonathantneal](https://github.com/jonathantneal)! - Officially drop support for Node v12. The minimum supported version is now Node v14.15+,

## 0.6.10

### Patch Changes

- [#2150](https://github.com/withastro/astro/pull/2150) [`d5ebd9d1`](https://github.com/withastro/astro/commit/d5ebd9d178ed4e5d15ef43f32217c16d44f19151) Thanks [@FredKSchott](https://github.com/FredKSchott)! - Fix create-astro export map entry

## 0.6.9

### Patch Changes

- [#2124](https://github.com/withastro/astro/pull/2124) [`c0f29bcf`](https://github.com/withastro/astro/commit/c0f29bcf8c2b943e4a8101cae4f893b13a4b832c) Thanks [@leosvelperez](https://github.com/leosvelperez)! - Parse --renderers flag correctly when passed to the create-astro cli

## 0.6.8

### Patch Changes

- 3e1bdb1a: Add a helpful message for the "could not find commit hash for ..." error

## 0.6.7

## 0.6.7-next.1

### Patch Changes

- 6c66d483: Fix issue with v7.x+ versions of npm init, which changed default flag handling

## 0.6.7-next.0

### Patch Changes

- 6c66d483: Fix issue with v7.x+ versions of npm init, which changed default flag handling

## 0.6.6

### Patch Changes

- d5fdeefe: Changes create-astro to pull examples from the latest branch

## 0.6.5

### Patch Changes

- 025f5e3f: Fix to revert change pointing create-astro at the latest branch

## 0.6.4

### Patch Changes

- 28f00566: Updates create-astro to use the latest branch

## 0.6.3

### Patch Changes

- 0eeb2534: change rm to unlink for node 12 compatibility

## 0.6.2

### Patch Changes

- 11a6f884: Added a check to see if the renderers array is empty and only show the message about using the templates default renderers if it isn't

## 0.6.1

### Patch Changes

- 24dce41c: Adds a new template 'minimal' which does not include a framework

## 0.6.0

### Minor Changes

- cf4c97cf: forced degit template extraction in case of non empty installation directory

## 0.5.2

### Patch Changes

- 6c52c92: Add warning when encountering 'zlib: unexpected end of file' error

## 0.5.1

### Patch Changes

- a7e6666: compile javascript to target Node v12.x
- bd18e14: Add support for [Solid](https://www.solidjs.com/)
- d45431d: create-astro does not fail when removing subdirectories

## 0.5.1-next.1

### Patch Changes

- bd18e14: Add support for [Solid](https://www.solidjs.com/)

## 0.5.1-next.0

### Patch Changes

- a7e6666: compile javascript to target Node v12.x
- d45431d: create-astro does not fail when removing subdirectories

## 0.5.0

### Minor Changes

- 36e104b: Use new client: prefix for component examples

## 0.4.0

### Minor Changes

- 5d5d67c: Update `create-astro` to handle framework-specific logic based on user preference

## 0.3.5

### Patch Changes

- d8ceff5: Allows using an external repo as a template

  You can do this with the `--template` flag:

  ```bash
  npm init astro my-shopify --template cassidoo/shopify-react-astro
  ```

## 0.3.4

### Patch Changes

- b0e41ea: fix small output bugs

## 0.3.3

### Patch Changes

- f9f2da4: Add repository key to package.json for create-astro

## 0.3.2

### Patch Changes

- ab2972b: Update package.json engines for esm support

## 0.3.1

### Patch Changes

- d6a7349: fix issue with empty prompt

## 0.3.0

### Minor Changes

- 6bca7c8: Redesigned create-astro internals
- 6bca7c8: New UI
