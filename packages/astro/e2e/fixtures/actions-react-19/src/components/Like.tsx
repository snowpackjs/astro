import { actions } from 'astro:actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { experimental_withState } from '@astrojs/react/actions';

export function Like({ postId, label, likes }: { postId: string; label: string; likes: number }) {
	return (
		<form action={actions.blog.like}>
			<input type="hidden" name="postId" value={postId} />
			<Button likes={likes} label={label} />
		</form>
	);
}


export function LikeWithActionState({ postId, label, likes: initial }: { postId: string; label: string; likes: number }) {
	const [likes, action] = useActionState(
		experimental_withState(actions.blog.likeWithActionState),
		{ data: initial },
	);

	return (
		<form action={action}>
			<input type="hidden" name="postId" value={postId} />
			<Button likes={likes.data} label={label} />
		</form>
	);
}

function Button({likes, label}: {likes: number; label: string}) {
	const { pending } = useFormStatus();

	return (
		<button aria-label={label} disabled={pending} type="submit">
			{likes} ❤️
		</button>
	)
}
