// Returns the file body for this non-HTML file.
export async function GET() {
	const data = JSON.stringify({
		name: 'Astro',
		url: 'https://astro.build/',
	})
	return new Response(data, {
		headers: {
			'Content-Type': 'application/json'
		}
	})
}
