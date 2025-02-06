# @astrojs/rss 📖

This package brings fast RSS feed generation to blogs and other content sites built with [Astro](https://astro.build/). For more information about RSS feeds in general, see [aboutfeeds.com](https://aboutfeeds.com/).

## Installation and use

See the [`@astrojs/rss` guide in the Astro docs][docs] for installation and usage examples.

## `rss()` configuration options

The `rss()` utility function offers a number of configuration options to generate your feed.

### title

Type: `string (required)`

The `<title>` attribute of your RSS feed's output xml.

### description

Type: `string (required)`

The `<description>` attribute of your RSS feed's output xml.

### site

Type: `string (required)`

The base URL to use when generating RSS item links. We recommend using the [endpoint context object](https://docs.astro.build/en/reference/api-reference/#contextsite), which includes the `site` configured in your project's `astro.config.*`:

```ts
import rss from '@astrojs/rss';

export const GET = (context) =>
  rss({
    site: context.site,
    // ...
  });
```

### items

Type: `RSSFeedItem[] (required)`

A list of formatted RSS feed items.

An `RSSFeedItem` is a single item in the list of items in your feed. An example feed item might look like:

```js
const item = {
  title: 'Alpha Centauri: so close you can touch it',
  link: '/blog/alpha-centuari',
  pubDate: new Date('2023-06-04'),
  description:
    'Alpha Centauri is a triple star system, containing Proxima Centauri, the closest star to our sun at only 4.24 light-years away.',
  categories: ['stars', 'space'],
};
```

#### `title`

Type: `string (optional)`

The title of the item in the feed. Optional only if a description is set. Otherwise, required.

#### `link`

Type: `string (optional)`

The URL of the item on the web.

#### `pubDate`

Type: `Date (optional)`

Indicates when the item was published.

#### `description`

Type: `string (optional)`

A synopsis of your item when you are publishing the full content of the item in the `content` field. The `description` may alternatively be the full content of the item in the feed if you are not using the `content` field (entity-coded HTML is permitted). Optional only if a title is set. Otherwise, required.

#### `content`

Type: `string (optional)`

The full text content of the item suitable for presentation as HTML. If used, you should also provide a short article summary in the `description` field.

To render Markdown content from a glob result or from a content collection, see the [content rendering guide](https://docs.astro.build/en/guides/rss/#including-full-post-content).

#### `categories`

Type: `string[] (optional)`

A list of any tags or categories to categorize your content. They will be output as multiple `<category>` elements.

#### `author`

Type: `string (optional)`

The email address of the item author. This is useful for indicating the author of a post on multi-author blogs.

#### `commentsUrl`

Type: `string (optional)`

The URL of a web page that contains comments on the item.

#### `source`

Type: `{ title: string, url: string } (optional)`

An object that defines the `title` and `url` of the original feed for items that have been republished from another source. Both are required properties of `source` for proper attribution.

```js
const item = {
  title: 'Alpha Centauri: so close you can touch it',
  link: '/blog/alpha-centuari',
  pubDate: new Date('2023-06-04'),
  description:
    'Alpha Centauri is a triple star system, containing Proxima Centauri, the closest star to our sun at only 4.24 light-years away.',
  source: {
    title: 'The Galactic Times',
    url: 'https://galactictimes.space/feed.xml',
  },
};
```

#### `enclosure`

Type: `{ url: string, type: string, length: number } (optional)`

An object to specify properties for an included media source (e.g. a podcast) with three required values: `url`, `length`, and `type`.

```js
const item = {
  /* ... */
  enclosure: {
    url: '/media/alpha-centauri.aac',
    length: 124568,
    type: 'audio/aac',
  },
};
```

- `enclosure.url` is the URL where the media can be found. If the media is hosted outside of your own domain you must provide a full URL.
- `enclosure.length` is the size of the file found at the `url` in bytes.
- `enclosure.type` is the [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) for the media item found at the `url`.

### stylesheet

Type: `string (optional)`

An absolute path to an XSL stylesheet in your project. If you don’t have an RSS stylesheet in mind, we recommend the [Pretty Feed v3 default stylesheet](https://github.com/genmon/aboutfeeds/blob/main/tools/pretty-feed-v3.xsl), which you can download from GitHub and save into your project's `public/` directory.

### customData

Type: `string (optional)`

A string of valid XML to be injected between your feed's `<description>` and `<item>` tags.

This can be used to pass additional data outside of the standard RSS spec, and is commonly used to set a language for your feed:

```js
import rss from '@astrojs/rss';

export const GET = () => rss({
    ...
    customData: '<language>en-us</language>',
  });
```

### xmlns

Type: `Record<string, string> (optional)`

An object mapping a set of `xmlns` suffixes to strings values on the opening `<rss>` tag.

Suffixes expand the available XML tags in your RSS feed, so your content may be read by third-party sources like podcast services or blogging platforms. You'll likely combine `xmlns` with the [`customData`](#customData) attribute to insert custom tags for a given platform.

This example applies the `itunes` suffix to an RSS feed of podcasts, and uses `customData` to define tags for the author and episode details:

```js
rss({
  // ...
  xmlns: {
    itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd',
  },
  customData: '<itunes:author>MF Doom</itunes:author>',
  items: episodes.map((episode) => ({
    // ...
    customData:
      `<itunes:episodeType>${episode.frontmatter.type}</itunes:episodeType>` +
      `<itunes:duration>${episode.frontmatter.duration}</itunes:duration>` +
      `<itunes:explicit>${episode.frontmatter.explicit || false}</itunes:explicit>`,
  })),
});
```

### `trailingSlash`

Type: `boolean (optional)`
Default: `true`

By default, trailing slashes will be added to the URLs of your feed entries. To prevent this behavior, add `trailingSlash: false` to the `rss` function.

```js
import rss from '@astrojs/rss';

export const GET = () =>
  rss({
    trailingSlash: false,
  });
```

## The `rssSchema` validator

When using content collections, you can configure your collection schema to enforce expected [`RSSFeedItem`](#items) properties. Import and apply `rssSchema` to ensure that each collection entry produces a valid RSS feed item:

```ts "schema: rssSchema,"
import { defineCollection } from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const blog = defineCollection({
  schema: rssSchema,
});

export const collections = { blog };
```

If you have an existing schema, you can merge extra properties using `extends()`:

```ts ".extends({ extraProperty: z.string() }),"
import { defineCollection } from 'astro:content';
import { rssSchema } from '@astrojs/rss';

const blog = defineCollection({
  schema: rssSchema.extends({ extraProperty: z.string() }),
});
```

## The `pagesGlobToRssItems()` function

To create an RSS feed from documents in `src/pages/`, use the `pagesGlobToRssItems()` helper. This accepts an `import.meta.glob` result ([see Vite documentation](https://vite.dev/guide/features.html#glob-import)) and outputs an array of valid [`RSSFeedItem`s](#items).

This function assumes, but does not verify, you are globbing for items inside `src/pages/`, and all necessary feed properties are present in each document's frontmatter. If you encounter errors, verify each page frontmatter manually.

```ts "pagesGlobToRssItems"
// src/pages/rss.xml.js
import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Buzz’s Blog',
    description: 'A humble Astronaut’s guide to the stars',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./blog/*.{md,mdx}')),
  });
}
```

## The `getRssString()` function

As `rss()` returns a `Response`, you can also use `getRssString()` to get the RSS string directly and use it in your own response:

```ts "getRssString"
// src/pages/rss.xml.js
import { getRssString } from '@astrojs/rss';

export async function GET(context) {
  const rssString = await getRssString({
    title: 'Buzz’s Blog',
    ...
  });

  return new Response(rssString, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
```

## Support

- Get help in the [Astro Discord][discord]. Post questions in our `#support` forum, or visit our dedicated `#dev` channel to discuss current development and more!

- Check our [Astro Integration Documentation][astro-integration] for more on integrations.

- Submit bug reports and feature requests as [GitHub issues][issues].

## Contributing

This package is maintained by Astro's Core team. You're welcome to submit an issue or PR! These links will help you get started:

- [Contributor Manual][contributing]
- [Code of Conduct][coc]
- [Community Guide][community]

## License

MIT

Copyright (c) 2023–present [Astro][astro]

[docs]: https://docs.astro.build/en/guides/rss/
[astro-endpoints]: https://docs.astro.build/en/core-concepts/astro-pages/#non-html-pages
[astro]: https://astro.build/
[docs]: https://docs.astro.build/en/guides/integrations-guide/alpinejs/
[contributing]: https://github.com/withastro/astro/blob/main/CONTRIBUTING.md
[coc]: https://github.com/withastro/.github/blob/main/CODE_OF_CONDUCT.md
[community]: https://github.com/withastro/.github/blob/main/COMMUNITY_GUIDE.md
[discord]: https://astro.build/chat/
[issues]: https://github.com/withastro/astro/issues
[astro-integration]: https://docs.astro.build/en/guides/integrations-guide/
