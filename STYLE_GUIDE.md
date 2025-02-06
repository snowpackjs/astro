# Style Guide

Welcome to the Astro style guide. This document is meant to guide you on the coding & writing styles of all content within the Astro repo, including:

- TypeScript & JavaScript coding style
- Blog post writing style
- Discord/Twitter writing style

For the RFC writing guide, check out the [RFC issue template](https://github.com/withastro/astro/issues/new/choose).

### Linting (Style Rules)

We use tools like ESLint and TypeScript to automatically enforce some parts of our style guide. Run the `pnpm run lint` command to lint the codebase. We also use tools like Prettier to automatically enforce code formatting. Run the `pnpm run format` command to format the entire codebase.

Anything enforced by linting and formatting is considered a **style rule.** It is strictly required that you follow all style rules while working in the codebase. Run the `pnpm run lint` and `pnpm run format` commands to check your code at any time.

These style rules are maintained in configuration files, and therefore not documented in this document. Read any of the following configuration files to learn more about the style rules that we strictly enforced across the codebase:

- [ESLint](https://github.com/withastro/astro/blob/main/eslint.config.js) (Linting)
- [Prettier](https://github.com/withastro/astro/blob/main/prettier.config.js) (Formatting)

Alternatively, don't worry too much about style rules and trust that our tools will catch these issues for you and offer inline suggestions as you work.

### Style Rules vs. Style Guidance

We will try to enforce most of our style guide with linting and formatting tools, but not everything can be reasonably captured in a lint rule.

Anything else in this document -- that is, anything not automatically enforced by linting -- is considered **style guidance.** Do your best to follow all style guidance outlined in this style guide, and expect code reviewers to be looking for these things in your Pull Request. However, no tool exists to catch you when you break guidance.

The reason that we don't treat these as strict rules is simple: we are all human. It would be silly to expect 100% accuracy without automated tooling to enforce it. Authors and reviewers will both miss things every once-in-a-while, and that is okay.

### How to Request a Style Change

Currently, style rule changes must be nominated by a core maintainer (L3) to be considered for the official style guide. Anyone is free to suggest a change, but do not expect any action unless a core maintainer champions your proposal through the process.

_Note: This process is new, we are still figuring it out! This process will be moved into GOVERNANCE.md when finalized._

_If you are a core maintainer who is interested in nominating or championing a style change, reach out in the private #core channel on Discord._

### How to Evaluate a Style Change

Style changes should be evaluated as objectively as possible, with as little personal ego invested as possible.

For example: "This is clean code" is a subjective point and should have limited impact in a style discussion. What is clean code to you may be "dirty" code to me!

In contrast: "Tabs are more accessible than spaces" is an objective point and should be strongly considered in a theoretical style discussion on tabs vs. spaces. (Fred: Believe me, I write this as someone who personally prefers spaces over tabs in my own code!)

Sometimes, not everyone will agree on style changes and 100% consensus is impossible. This is a condition commonly referred to as bike-shedding. If consensus can not be reached, a simple majority vote among core contributors (L3) will suffice.

_Note: This process is new, we are still figuring it out! This process will be moved into GOVERNANCE.md when finalized._

## TypeScript Style Guide

Empty! Right now, everything in our official style guide is captured and enforced as style rules in the automated tooling, as outlined above.

## Writing

### Blog Posts: Brief Announcement

TODO. For now, see an example: https://astro.build/blog/astro-repl/

### Blog Posts: Detailed Announcement

TODO. For now, see an example: https://astro.build/blog/astro-021-preview/

### Tweet: Announcement

TODO. For now, see an example: https://twitter.com/astrodotbuild
