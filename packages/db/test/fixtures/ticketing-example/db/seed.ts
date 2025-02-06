import { Event, db } from 'astro:db';

export default async function () {
	await db.insert(Event).values({
		name: 'Sampha LIVE in Brooklyn',
		description:
			'Sampha is on tour with his new, flawless album Lahai. Come see the live performance outdoors in Prospect Park. Yes, there will be a grand piano 🎹',
		date: new Date('2024-01-01'),
		ticketPrice: 10000,
		location: 'Brooklyn, NY',
	});
}
