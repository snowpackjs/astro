
export function GET() {
	return new Response(
		JSON.stringify([
			{ name: 'lettuce' },
			{ name: 'broccoli' },
			{ name: 'pizza' }
		]), {
			status: 200,
			statusText: `tasty`,
		}
	)
}

export async function POST({ params, request }) {
	const body = await request.text();
	const ok = body === `some data`
	return new Response( ok ? `ok` : `not ok`, {
		status: ok ? 200 : 400,
		statusText: ok ? `ok` : `not ok`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		}
	});
}
