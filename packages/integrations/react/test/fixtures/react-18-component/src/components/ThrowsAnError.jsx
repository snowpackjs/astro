import { useState } from 'react';

export default function() {
	let player = undefined;
	// This is tested in dev mode, so make it work during the build to prevent
	// breaking other tests.
	if(import.meta.env.MODE === 'production') {
		player = {};
	}
	const [] = useState(player.currentTime || null);

	return (
		<div>Should have thrown</div>
	)
}
