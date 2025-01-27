import { User, db } from 'astro:db';

export default async function () {
	await db.batch([
		db.insert(User).values([{ id: 'mario', username: 'Mario', password: 'itsame' }]),
	]);
}
