import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isStyleOnlyChanged } from '../../../dist/vite-plugin-astro/hmr.js';

describe('isStyleOnlyChanged', () => {
	it('should return false if nothing change', () => {
		const oldCode = 'a';
		const newCode = 'a';
		assert.equal(isStyleOnlyChanged(oldCode, newCode), false);
	});

	it('should return false if script has changed', () => {
		const oldCode = '<script>console.log("Hello");</script><style>body { color: red; }</style>';
		const newCode = '<script>console.log("Hi");</script><style>body { color: red; }</style>';
		assert.equal(isStyleOnlyChanged(oldCode, newCode), false);
	});

	it('should return true if only style has changed', () => {
		const oldCode = '<style>body { color: red; }</style>';
		const newCode = '<style>body { color: blue; }</style>';
		assert.equal(isStyleOnlyChanged(oldCode, newCode), true);
	});

	it('should return false if style tags are added or removed', () => {
		const oldCode = '<style>body { color: red; }</style>';
		const newCode = '<style>body { color: red; }</style><style>a { color: blue; }</style>';
		assert.equal(isStyleOnlyChanged(oldCode, newCode), false);
	});

	it('should return false if frontmatter has changed', () => {
		const oldCode = `
---
title: Hello
---
<style>body { color: red; }</style>`;
		const newCode = `
---
title: Hi
---
<style>body { color: red; }</style>`;
		assert.equal(isStyleOnlyChanged(oldCode, newCode), false);
	});

	it('should return false if both frontmatter and style have changed', () => {
		const oldCode = `
---
title: Hello
---
<style>body { color: red; }</style>`;
		const newCode = `
---
title: Hi
---
<style>body { color: blue; }</style>`;
		assert.equal(isStyleOnlyChanged(oldCode, newCode), false);
	});

	it('should return false if both markup and style have changed', () => {
		const oldCode = '<h1>Hello</h1><style>body { color: red; }</style>';
		const newCode = '<h1>Hi</h1><style>body { color: blue; }</style>';
		assert.equal(isStyleOnlyChanged(oldCode, newCode), false);
	});
});
