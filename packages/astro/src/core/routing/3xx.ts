export type RedirectTemplate = {
	from?: string;
	location: string | URL;
	status: number;
};

export function redirectTemplate({ status, location, from }: RedirectTemplate) {
	// A short delay causes Google to interpret the redirect as temporary.
	// https://developers.google.com/search/docs/crawling-indexing/301-redirects#metarefresh
	const delay = status === 302 ? 2 : 0;
	return `<!doctype html>
<title>Redirecting to: ${location}</title>
<meta http-equiv="refresh" content="${delay};url=${location}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${location}">
<body>
	<a href="${location}">Redirecting ${from ? `from <code>${from}</code> ` : ''}to <code>${location}</code></a>
</body>`;
}
