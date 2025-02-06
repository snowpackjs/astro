import { User, db } from 'astro:db';
import { asDrizzleTable } from '@astrojs/db/utils';

export default async function () {
	await db.batch([
		db.insert(User).values([{ id: 'mario', username: 'Mario', password: 'itsame' }]),
	]);
}
