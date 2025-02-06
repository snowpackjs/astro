import { Author, Session, User, db } from 'astro:db';
import { asDrizzleTable } from '@astrojs/db/utils';
import { Themes as ThemesConfig } from './theme';

const Themes = asDrizzleTable('Themes', ThemesConfig);
export default async function () {
	await db.batch([
		db
			.insert(Themes)
			.values([{ name: 'dracula' }, { name: 'monokai', added: new Date() }])
			.returning({ name: Themes.name }),
		db
			.insert(Author)
			.values([
				{ name: 'Ben' },
				{ name: 'Nate' },
				{ name: 'Erika' },
				{ name: 'Bjorn' },
				{ name: 'Sarah' },
			]),
		db.insert(User).values([{ id: 'mario', username: 'Mario', password: 'itsame' }]),
		db.insert(Session).values([{ id: '12345', expiresAt: new Date().valueOf(), userId: 'mario' }]),
	]);
}
