# fonts

The vite plugin orchestrates the fonts logic:

- Retrieves data from the config
- Initializes font providers
- Fetches fonts data
- In dev, serves a middleware that dynamically loads and caches fonts data
- In build, download fonts data (from cache if possible)

The `<Fonts />` component is the only aspect not managed in the vite plugin, since it's exported from `astro:assets`.