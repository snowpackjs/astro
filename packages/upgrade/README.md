# @astrojs/upgrade

A command-line tool for upgrading your Astro integrations and dependencies.

You can run this command in your terminal to upgrade your official Astro integrations at the same time you upgrade your version of Astro.

## Usage

`@astrojs/upgrade` should not be added as a dependency to your project, but run as a temporary executable whenever you want to upgrade using [`npx`](https://docs.npmjs.com/cli/v10/commands/npx) or [`dlx`](https://pnpm.io/cli/dlx).

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

## Options

### tag (optional)

It is possible to pass a specific `tag` to resolve packages against. If not included, `@astrojs/upgrade` looks for the `latest` tag.

For example, Astro often releases `beta` versions prior to an upcoming major release. Upgrade an existing Astro project and it's dependencies to the `beta` version using one of the following commands:

**With NPM:**

```bash
npx @astrojs/upgrade beta
```

**With Yarn:**

```bash
yarn dlx @astrojs/upgrade beta
```

**With PNPM:**

```bash
pnpm dlx @astrojs/upgrade beta
```
