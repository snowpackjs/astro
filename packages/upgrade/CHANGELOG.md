# @astrojs/upgrade

## 0.4.3

### Patch Changes

- [#12739](https://github.com/withastro/astro/pull/12739) [`1f9571b`](https://github.com/withastro/astro/commit/1f9571b2b9839a5513fe2c03a90ff36235e8efe2) Thanks [@gnify](https://github.com/gnify)! - Updates displayed data to show both source and target versions

## 0.4.2

### Patch Changes

- [#12706](https://github.com/withastro/astro/pull/12706) [`f6c4214`](https://github.com/withastro/astro/commit/f6c4214042c68de137a69aa15dea81ed9cbc822a) Thanks [@ascorbic](https://github.com/ascorbic)! - Fixes a bug that caused registry URLs that specify a port to be incorrectly detected as offline.

## 0.4.1

### Patch Changes

- [#12576](https://github.com/withastro/astro/pull/12576) [`19b3ac0`](https://github.com/withastro/astro/commit/19b3ac0036cc6f27da887d19b16d804c6f0b8124) Thanks [@apatel369](https://github.com/apatel369)! - Fixes an issue where running `upgrade` in a directory without `astro` installed shows a false success message

## 0.4.0

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

### Patch Changes

- [#12577](https://github.com/withastro/astro/pull/12577) [`b139390`](https://github.com/withastro/astro/commit/b139390deb738f96759cb787fe9e784be71f2134) Thanks [@apatel369](https://github.com/apatel369)! - Fixes an issue where `@astrojs/upgrade` announces integration updates for already up to date packages

## 0.4.0-beta.0

### Minor Changes

- [#12539](https://github.com/withastro/astro/pull/12539) [`827093e`](https://github.com/withastro/astro/commit/827093e6175549771f9d93ddf3f2be4c2c60f0b7) Thanks [@bluwy](https://github.com/bluwy)! - Drops node 21 support

## 0.3.4

### Patch Changes

- [#12118](https://github.com/withastro/astro/pull/12118) [`f47b347`](https://github.com/withastro/astro/commit/f47b347da899c6e1dcd0b2e7887f7fce6ec8e270) Thanks [@Namchee](https://github.com/Namchee)! - Removes the `strip-ansi` dependency in favor of the native Node API

## 0.3.3

### Patch Changes

- [#11733](https://github.com/withastro/astro/pull/11733) [`391324d`](https://github.com/withastro/astro/commit/391324df969db71d1c7ca25c2ed14c9eb6eea5ee) Thanks [@bluwy](https://github.com/bluwy)! - Reverts back to `arg` package for CLI argument parsing

## 0.3.2

### Patch Changes

- [#11645](https://github.com/withastro/astro/pull/11645) [`849e4c6`](https://github.com/withastro/astro/commit/849e4c6c23e61f7fa59f583419048b998bef2475) Thanks [@bluwy](https://github.com/bluwy)! - Refactors internally to use `node:util` `parseArgs` instead of `arg`

## 0.3.1

### Patch Changes

- [#11139](https://github.com/withastro/astro/pull/11139) [`aaf0635`](https://github.com/withastro/astro/commit/aaf0635cc0fb7e9f892c710ec6ff3b16d3f90ab4) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Fixes @astrojs/upgrade not using the package manager that was used to install the project to install dependencies

## 0.3.0

### Minor Changes

- [#10689](https://github.com/withastro/astro/pull/10689) [`683d51a5eecafbbfbfed3910a3f1fbf0b3531b99`](https://github.com/withastro/astro/commit/683d51a5eecafbbfbfed3910a3f1fbf0b3531b99) Thanks [@ematipico](https://github.com/ematipico)! - Deprecate support for versions of Node.js older than `v18.17.1` for Node.js 18, older than `v20.0.3` for Node.js 20, and the complete Node.js v19 release line.

  This change is in line with Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support).

## 0.2.3

### Patch Changes

- [#10117](https://github.com/withastro/astro/pull/10117) [`51b6ff7403c1223b1c399e88373075972c82c24c`](https://github.com/withastro/astro/commit/51b6ff7403c1223b1c399e88373075972c82c24c) Thanks [@hippotastic](https://github.com/hippotastic)! - Fixes an issue where `create astro`, `astro add` and `@astrojs/upgrade` would fail due to unexpected package manager CLI output.

## 0.2.2

### Patch Changes

- [#9562](https://github.com/withastro/astro/pull/9562) [`67e06f9db1b0492ccfb4b053762dc91d69a53ecb`](https://github.com/withastro/astro/commit/67e06f9db1b0492ccfb4b053762dc91d69a53ecb) Thanks [@DET171](https://github.com/DET171)! - Updates the command used for installing packages with pnpm and yarn

## 0.2.1

### Patch Changes

- [#9317](https://github.com/withastro/astro/pull/9317) [`d1c91add0`](https://github.com/withastro/astro/commit/d1c91add074c2e08056f01df5a6043c9716b7e1f) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Improves dependency handling by ignoring packages that don't use a semver version

## 0.2.0

### Minor Changes

- [#9118](https://github.com/withastro/astro/pull/9118) [`000e8f465`](https://github.com/withastro/astro/commit/000e8f4654cae9982e21e0a858366c4844139db6) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Initial release!

  `@astrojs/upgrade` is an automated command-line tool for upgrading Astro and your official Astro integrations together.

  Inside of your existing `astro` project, run the following command to install the `latest` version of your integrations.

  **With NPM:**

  ```bash
  npx @astrojs/upgrade
  ```

  **With Yarn:**

  ```bash
  yarn dlx @astrojs/upgrade
  ```

  **With PNPM:**

  ```bash
  pnpm dlx @astrojs/upgrade
  ```

## 0.1.0-beta.0

### Minor Changes

- [#9118](https://github.com/withastro/astro/pull/9118) [`000e8f465`](https://github.com/withastro/astro/commit/000e8f4654cae9982e21e0a858366c4844139db6) Thanks [@Princesseuh](https://github.com/Princesseuh)! - Initial release!

  `@astrojs/upgrade` is an automated command-line tool for upgrading Astro and your official Astro integrations together.

  Inside of your existing `astro` project, run the following command to install the `latest` version of your integrations.

  **With NPM:**

  ```bash
  npx @astrojs/upgrade
  ```

  **With Yarn:**

  ```bash
  yarn dlx @astrojs/upgrade
  ```

  **With PNPM:**

  ```bash
  pnpm dlx @astrojs/upgrade
  ```

## 0.1.1

### Patch Changes

- [#9213](https://github.com/withastro/astro/pull/9213) [`54e57fe9d`](https://github.com/withastro/astro/commit/54e57fe9d7600c888fc7b0bc3f5dbca5543f36cd) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Fix unhandled error when running `@astrojs/upgrade beta` outside of a monorepo

## 0.1.0

### Minor Changes

- [#8525](https://github.com/withastro/astro/pull/8525) [`5a3875018`](https://github.com/withastro/astro/commit/5a38750188d1af30ea5277cea70f454c363b5062) Thanks [@natemoo-re](https://github.com/natemoo-re)! - Initial release!

  `@astrojs/upgrade` is an automated command-line tool for upgrading Astro and your official Astro integrations together.

  Inside of your existing `astro` project, run the following command to install the `latest` version of your integrations.

  **With NPM:**

  ```bash
  npx @astrojs/upgrade
  ```

  **With Yarn:**

  ```bash
  yarn dlx @astrojs/upgrade
  ```

  **With PNPM:**

  ```bash
  pnpm dlx @astrojs/upgrade
  ```
