import React from 'react';

export default function ({ id, children }) {
	return (
		<div id={id}>
			<div className="with-children">{children}</div>
			<div className="with-children-count">{children.length}</div>
		</div>
	);
}
