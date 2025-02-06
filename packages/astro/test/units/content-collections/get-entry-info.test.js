import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getContentEntryIdAndSlug, getEntryCollectionName } from '../../../dist/content/utils.js';

describe('Content Collections - entry info', () => {
	const contentDir = new URL('src/content/', import.meta.url);

	it('Returns correct collection name', () => {
		const entry = new URL('blog/first-post.md', contentDir);
		const collection = getEntryCollectionName({ entry, contentDir });
		assert.equal(collection, 'blog');
	});

	it('Detects when entry is outside of a collection', () => {
		const entry = new URL('base-post.md', contentDir);
		const collection = getEntryCollectionName({ entry, contentDir });
		assert.equal(collection, undefined);
	});

	it('Returns correct collection when nested directories used', () => {
		const entry = new URL('docs/2021/01/01/index.md', contentDir);
		const collection = getEntryCollectionName({ entry, contentDir });
		assert.equal(collection, 'docs');
	});

	it('Returns correct entry info', () => {
		const collection = 'blog';
		const entry = new URL(`${collection}/first-post.md`, contentDir);
		const info = getContentEntryIdAndSlug({ entry, contentDir, collection });
		assert.equal(info.id, 'first-post.md');
		assert.equal(info.slug, 'first-post');
	});

	it('Returns correct slug when spaces used', () => {
		const collection = 'blog';
		const entry = new URL(`${collection}/first post.mdx`, contentDir);
		const info = getContentEntryIdAndSlug({ entry, contentDir, collection });
		assert.equal(info.slug, 'first-post');
	});

	it('Returns correct slug when nested directories used', () => {
		const collection = 'blog';
		const entry = new URL(`${collection}/2021/01/01/index.md`, contentDir);
		const info = getContentEntryIdAndSlug({ entry, contentDir, collection });
		assert.equal(info.slug, '2021/01/01');
	});
});
