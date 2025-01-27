import { actions } from 'astro:actions';
import { useState } from 'react';

export function Like({ postId, initial }: { postId: string; initial: number }) {
	const [likes, setLikes] = useState(initial);
	const [pending, setPending] = useState(false);

	return (
		<button
			aria-label="Like"
			disabled={pending}
			onClick={async () => {
				setPending(true);
				setLikes(await actions.blog.like.orThrow({ postId }));
				setPending(false);
			}}
			type="submit"
		>
			{likes} ❤️
		</button>
	);
}
