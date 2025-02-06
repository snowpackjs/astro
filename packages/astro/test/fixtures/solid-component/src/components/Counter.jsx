// Based on reproduction from https://github.com/withastro/astro/issues/6912

import { For, Match, Switch } from 'solid-js';

export default function Counter(props) {
	return (
		<For each={[1, 2, 3, 4]}>
			{(page) => {
				return (
					<Switch>
						<Match when={page % 2 === 0}>
							<button
								onClick={() => {
									console.log(page);
								}}
							>
								even {page}
							</button>
						</Match>
						<Match when={page % 2 === 1}>
							<button
								onClick={() => {
									console.log(page);
								}}
							>
								odd {page}
							</button>
						</Match>
					</Switch>
				);
			}}
		</For>
	);
}
