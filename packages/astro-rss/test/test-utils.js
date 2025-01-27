import xml2js from 'xml2js';

export const title = 'My RSS feed';
export const description = 'This sure is a nice RSS feed';
export const site = 'https://example.com';

export const phpFeedItemWithoutDate = {
	link: '/php',
	title: 'Remember PHP?',
	description:
		'PHP is a general-purpose scripting language geared toward web development. It was originally created by Danish-Canadian programmer Rasmus Lerdorf in 1994.',
};
export const phpFeedItem = {
	...phpFeedItemWithoutDate,
	pubDate: '1994-05-03',
};
export const phpFeedItemWithContent = {
	...phpFeedItem,
	content: `<h1>${phpFeedItem.title}</h1><p>${phpFeedItem.description}</p>`,
};
export const phpFeedItemWithCustomData = {
	...phpFeedItem,
	customData: '<dc:creator><![CDATA[Buster Bluth]]></dc:creator>',
};

export const web1FeedItem = {
	// Should support empty string as a URL (possible for homepage route)
	link: '',
	title: 'Web 1.0',
	pubDate: '1997-05-03',
	description:
		'Web 1.0 is the term used for the earliest version of the Internet as it emerged from its origins with Defense Advanced Research Projects Agency (DARPA) and became, for the first time, a global network representing the future of digital communications.',
};
export const web1FeedItemWithContent = {
	...web1FeedItem,
	content: `<h1>${web1FeedItem.title}</h1><p>${web1FeedItem.description}</p>`,
};
export const web1FeedItemWithAllData = {
	...web1FeedItem,
	categories: ['web1', 'history'],
	author: 'test@example.com',
	commentsUrl: 'http://example.com/comments',
	source: {
		url: 'http://example.com/source',
		title: 'The Web 1.0 blog',
	},
	enclosure: {
		url: '/podcast.mp3',
		length: 256,
		type: 'audio/mpeg',
	},
};

const parser = new xml2js.Parser({ trim: true });

/**
 *
 * Utility function to parse an XML string into an object using `xml2js`.
 *
 * @param {string} xmlString - Stringified XML to parse.
 * @return {{ err: Error, result: any }} Represents an option containing the parsed XML string or an Error.
 */
export function parseXmlString(xmlString) {
	let res;
	parser.parseString(xmlString, (err, result) => {
		res = { err, result };
	});
	return res;
}
