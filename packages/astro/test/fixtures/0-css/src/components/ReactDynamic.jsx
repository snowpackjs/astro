import React from 'react';

const ReactLazy = React.lazy(() => import('./ReactLazy'));

export default function() {
	return (
		<div>
			<React.Suspense>
				<ReactLazy />
			</React.Suspense>
		</div>
	);
}
