const story = (path: string) => `https://node-hnapi.herokuapp.com/${path}`;
const user = (path: string) => `https://hacker-news.firebaseio.com/v0/${path}.json`;

export default async function fetchAPI(path: string) {
	const url = path.startsWith('user') ? user(path) : story(path);
	const headers = { 'User-Agent': 'chrome' };

	try {
		let response = await fetch(url, { headers });
		let text = await response.text();
		try {
			if (text === null) {
				return { error: 'Not found' };
			}
			return JSON.parse(text);
		} catch (e) {
			console.error(`Received from API: ${text}`);
			console.error(e);
			return { error: e };
		}
	} catch (error) {
		return { error };
	}
}
