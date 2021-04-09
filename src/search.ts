import { existsSync } from 'fs';
import path from 'path';
import glob from 'tiny-glob/sync.js';

interface PageLocation {
  fileURL: URL;
  snowpackURL: string;
}

function findAnyPage(candidates: Array<string>, astroRoot: URL): PageLocation | false {
  for (let candidate of candidates) {
    const url = new URL(`./pages/${candidate}`, astroRoot);
    if (existsSync(url)) {
      return {
        fileURL: url,
        snowpackURL: `/_astro/pages/${candidate}.js`,
      };
    }
  }
  return false;
}

type SearchResult =
  | {
      statusCode: 200;
      location: PageLocation;
      pathname: string;
      params?: Record<string, any>;
      currentPage?: number;
    }
  | {
      statusCode: 301;
      location: null;
      pathname: string;
    }
  | {
      statusCode: 404;
    };

/** Given a URL, attempt to locate its source file (similar to Snowpack‘s load()) */
export function searchForPage(url: URL, astroRoot: URL): SearchResult {
  const reqPath = decodeURI(url.pathname);
  const base = reqPath.substr(1);

  // Try to find index.astro/md paths
  if (reqPath.endsWith('/')) {
    const candidates = [`${base}index.astro`, `${base}index.md`];
    const location = findAnyPage(candidates, astroRoot);
    if (location) {
      return {
        statusCode: 200,
        location,
        pathname: reqPath,
      };
    }
  } else {
    // Try to find the page by its name.
    const candidates = [`${base}.astro`, `${base}.md`];
    let location = findAnyPage(candidates, astroRoot);
    if (location) {
      return {
        statusCode: 200,
        location,
        pathname: reqPath,
      };
    }
  }

  // Try to find name/index.astro/md
  const candidates = [`${base}/index.astro`, `${base}/index.md`];
  const location = findAnyPage(candidates, astroRoot);
  if (location) {
    return {
      statusCode: 301,
      location: null,
      pathname: reqPath + '/',
    };
  }

  // Try and load collections (but only for non-extension files)
  const hasExt = !!path.extname(reqPath);
  if (!location && !hasExt) {
    const collection = loadCollection(reqPath, astroRoot);
    if (collection) {
      return {
        statusCode: 200,
        location: collection.location,
        pathname: reqPath,
        params: collection.params,
        currentPage: collection.currentPage,
      };
    }
  }

  return {
    statusCode: 404,
  };
}

/** load a collection route */
function loadCollection(url: string, astroRoot: URL): { currentPage: number; params: Record<string, any>; location: PageLocation } | undefined {
  const pages = glob('**/*', { cwd: path.join(astroRoot.pathname, 'pages'), filesOnly: true }).filter((filepath) => filepath.startsWith('$') || filepath.includes('/$'));
  for (const pageURL of pages) {
    const reqURL = new RegExp('^/' + pageURL.replace(/\$([^/]+)\.astro/, '$1') + '/(?<page>\\d+$)?');
    const match = url.match(reqURL);
    if (match) {
      let currentPage = match.groups && match.groups.page ? parseInt(match.groups.page, 10) : 1;
      if (Number.isNaN(currentPage)) currentPage = 1;
      return {
        location: {
          fileURL: new URL(`./pages/${pageURL}`, astroRoot),
          snowpackURL: `/_astro/pages/${pageURL}.js`,
        },
        params: {},
        currentPage,
      };
    }
  }
}
