const ASTRO_TELEMETRY_ENDPOINT = `https://telemetry.astro.build/api/v1/record`;

export function post(body: Record<string, any>): Promise<any> {
	return fetch(ASTRO_TELEMETRY_ENDPOINT, {
		method: 'POST',
		body: JSON.stringify(body),
		headers: { 'content-type': 'application/json' },
	});
}
