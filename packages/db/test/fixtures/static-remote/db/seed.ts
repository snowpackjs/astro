import { User, db } from 'astro:db';

export default async function () {
	await db.insert(User).values([
		{
			name: 'Houston',
		},
	]);
}
