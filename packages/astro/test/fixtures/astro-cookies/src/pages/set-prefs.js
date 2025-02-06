
export function POST({ cookies }) {
	const mode = cookies.get('prefs').json().mode;

	cookies.set('prefs', {
		mode: mode === 'light' ? 'dark' : 'light'
	});

	return new Response(null, {
		status: 302,
		headers: {
			'Location': '/prefs'
		}
	});
}
