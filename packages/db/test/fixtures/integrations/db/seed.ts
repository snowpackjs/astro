import { Author, db } from 'astro:db';

export default async () => {
	await db
		.insert(Author)
		.values([
			{ name: 'Ben' },
			{ name: 'Nate' },
			{ name: 'Erika' },
			{ name: 'Bjorn' },
			{ name: 'Sarah' },
		]);
};
