import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import convert from '../vnode-children.js';

describe('experimental react children', () => {
	it('has undefined as children for direct children', () => {
		const [imgVNode] = convert('<img src="abc"></img>');
		assert.deepEqual(imgVNode.props.children, undefined);
	});

	it('has undefined as children for nested children', () => {
		const [divVNode] = convert('<div><img src="xyz"></img></div>');
		const [imgVNode] = divVNode.props.children;
		assert.deepEqual(imgVNode.props.children, undefined);
	});
});
