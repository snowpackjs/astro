import { actions } from 'astro:actions';
import { navigate } from 'astro:transitions/client';

export function Logout() {
	return (
		<button
			data-testid="logout-button"
			onClick={async () => {
				const { error } = await actions.logout();
				if (!error) navigate('/blog/');
			}}
		>
			Logout
		</button>
	);
}
