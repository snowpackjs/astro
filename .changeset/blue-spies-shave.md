---
'astro': minor
---

Redirects trailing slashes for on-demand pages

When the `trailingSlash` option is set to `always` or `never`, on-demand rendered pages will now redirect to the correct URL when the trailing slash doesn't match the configuration option. This was previously the case for static pages, but now works for on-demand pages as well.

Now, it doesn't matter whether your visitor navigates to `/about/`, `/about`, or even `/about///`. In production, they'll always end up on the correct page. For GET requests, the redirect will be a 301 (permanent) redirect, and for all other request methods, it will be a 308 (permanent, and preserve the request method) redirect.

In development, you'll see a helpful 404 page to alert you of a trailing slash mismatch so you can troubleshoot routes.
