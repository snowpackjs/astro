# create-astro

## Scaffolding for Astro projects

**With NPM:**

```bash
npm create astro@latest
```

**With Yarn:**

```bash
yarn create astro
```

**With PNPM:**

```bash
pnpm create astro
```

`create-astro` automatically runs in _interactive_ mode, but you can also specify your project name and template with command line arguments.

```bash
# npm
npm create astro@latest my-astro-project -- --template minimal

# yarn
yarn create astro my-astro-project --template minimal

# pnpm
pnpm create astro my-astro-project --template minimal
```

[Check out the full list][examples] of example templates, available on GitHub.

You can also use any GitHub repo as a template:

```bash
npm create astro@latest my-astro-project -- --template cassidoo/shopify-react-astro
```

### CLI Flags

May be provided in place of prompts

| Name                         | Description                                |
| :--------------------------- | :----------------------------------------- |
| `--help` (`-h`)              | Display available flags.                   |
| `--template <name>`          | Specify your template.                     |
| `--install` / `--no-install` | Install dependencies (or not).             |
| `--add <integrations>`       | Add integrations.                          |
| `--git` / `--no-git`         | Initialize git repo (or not).              |
| `--yes` (`-y`)               | Skip all prompts by accepting defaults.    |
| `--no` (`-n`)                | Skip all prompts by declining defaults.    |
| `--dry-run`                  | Walk through steps without executing.      |
| `--skip-houston`             | Skip Houston animation.                    |
| `--ref`                      | Specify an Astro branch (default: latest). |
| `--fancy`                    | Enable full Unicode support for Windows.   |

[examples]: https://github.com/withastro/astro/tree/main/examples
[typescript]: https://github.com/withastro/astro/tree/main/packages/astro/tsconfigs
