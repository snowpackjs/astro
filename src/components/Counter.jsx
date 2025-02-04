import { useState } from 'react';

export default function({ initialCount }) {
	const [count, setCount] = useState(initialCount || 0);
	return (
		<div className="rounded-t-lg overflow-hidden border-t border-l border-r border-gray-400 text-center p-4">
			<h2 className="font-semibold text-lg">Counter</h2>
			<h3 className="font-medium text-lg">Count: {count}</h3>
			<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	)
}
