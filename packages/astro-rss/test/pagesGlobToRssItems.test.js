import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pagesGlobToRssItems } from '../dist/index.js';
import { phpFeedItem, web1FeedItem } from './test-utils.js';

describe('pagesGlobToRssItems', () => {
	it('should generate on valid result', async () => {
		const globResult = {
			'./posts/php.md': () =>
				new Promise((resolve) =>
					resolve({
						url: phpFeedItem.link,
						frontmatter: {
							title: phpFeedItem.title,
							pubDate: phpFeedItem.pubDate,
							description: phpFeedItem.description,
						},
					}),
				),
			'./posts/nested/web1.md': () =>
				new Promise((resolve) =>
					resolve({
						url: web1FeedItem.link,
						frontmatter: {
							title: web1FeedItem.title,
							pubDate: web1FeedItem.pubDate,
							description: web1FeedItem.description,
						},
					}),
				),
		};

		const items = await pagesGlobToRssItems(globResult);
		const expected = [
			{
				title: phpFeedItem.title,
				link: phpFeedItem.link,
				pubDate: new Date(phpFeedItem.pubDate),
				description: phpFeedItem.description,
			},
			{
				title: web1FeedItem.title,
				link: web1FeedItem.link,
				pubDate: new Date(web1FeedItem.pubDate),
				description: web1FeedItem.description,
			},
		];

		assert.deepEqual(
			items.sort((a, b) => a.pubDate - b.pubDate),
			expected,
		);
	});

	it('should fail on missing "url"', () => {
		const globResult = {
			'./posts/php.md': () =>
				new Promise((resolve) =>
					resolve({
						url: undefined,
						frontmatter: {
							pubDate: phpFeedItem.pubDate,
							description: phpFeedItem.description,
						},
					}),
				),
		};
		return assert.rejects(pagesGlobToRssItems(globResult));
	});

	it('should fail on missing "title" key and "description"', () => {
		const globResult = {
			'./posts/php.md': () =>
				new Promise((resolve) =>
					resolve({
						url: phpFeedItem.link,
						frontmatter: {
							title: undefined,
							pubDate: phpFeedItem.pubDate,
							description: undefined,
						},
					}),
				),
		};
		return assert.rejects(pagesGlobToRssItems(globResult));
	});

	it('should not fail on missing "title" key if "description" is present', () => {
		const globResult = {
			'./posts/php.md': () =>
				new Promise((resolve) =>
					resolve({
						url: phpFeedItem.link,
						frontmatter: {
							title: undefined,
							pubDate: phpFeedItem.pubDate,
							description: phpFeedItem.description,
						},
					}),
				),
		};
		return assert.doesNotReject(pagesGlobToRssItems(globResult));
	});

	it('should not fail on missing "description" key if "title" is present', () => {
		const globResult = {
			'./posts/php.md': () =>
				new Promise((resolve) =>
					resolve({
						url: phpFeedItem.link,
						frontmatter: {
							title: phpFeedItem.title,
							pubDate: phpFeedItem.pubDate,
							description: undefined,
						},
					}),
				),
		};
		return assert.doesNotReject(pagesGlobToRssItems(globResult));
	});
});
