const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefix a URL path with the site’s base path if set. */
export const withBase = (path: string) => base + path;
