import { actions, isInputError } from 'astro:actions';
import { useState } from 'react';

export function PostComment({
	postId,
	serverBodyError,
}: {
	postId: string;
	serverBodyError?: string;
}) {
	const [comments, setComments] = useState<{ author: string; body: string }[]>([]);
	const [bodyError, setBodyError] = useState<string | undefined>(serverBodyError);
	const [unexpectedError, setUnexpectedError] = useState<string | undefined>(undefined);

	return (
		<>
			<form
				method="POST"
				data-testid="client"
				action={actions.blog.comment}
				onSubmit={async (e) => {
					e.preventDefault();
					const form = e.target as HTMLFormElement;
					const formData = new FormData(form);
					const { data, error } = await actions.blog.comment(formData);
					if (isInputError(error)) {
						return setBodyError(error.fields.body?.join(' '));
					} else if (error) {
						return setUnexpectedError(`${error.code}: ${error.message}`);
					}
					setBodyError(undefined);
					setComments((c) => [data, ...c]);
					form.reset();
				}}
			>
				{unexpectedError && (
					<p data-error="unexpected" style={{ color: 'red' }}>
						{unexpectedError}
					</p>
				)}
				<input type="hidden" name="postId" value={postId} />
				<label htmlFor="author">Author</label>
				<input id="author" type="text" name="author" placeholder="Your name" />
				<textarea rows={10} name="body"></textarea>
				{bodyError && (
					<p data-error="body" style={{ color: 'red' }}>
						{bodyError}
					</p>
				)}
				<button type="submit">Post</button>
			</form>
			<div data-testid="client-comments">
				{comments.map((c) => (
					<article
						key={c.body}
						style={{
							border: '2px solid color-mix(in srgb, var(--accent), transparent 80%)',
							padding: '0.3rem 1rem',
							borderRadius: '0.3rem',
							marginBlock: '0.3rem',
						}}
					>
						<p>{c.body}</p>
						<p>{c.author}</p>
					</article>
				))}
			</div>
		</>
	);
}
