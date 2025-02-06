/** @jsxImportSource react */
import { useState } from 'react';

export default function LikeButton({ liked: likedInitial }: {liked: boolean}) {
	const [liked, setLiked] = useState(likedInitial);
	return (
		<button onClick={() => setLiked(!liked)}>
			{!liked ? <span>Like ❤️</span> : <span>Unlike 💔</span>}
		</button>
	)
}
