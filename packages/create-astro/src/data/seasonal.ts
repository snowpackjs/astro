interface SeasonalHouston {
	hats?: string[];
	ties?: string[];
	messages: string[];
}

export default function getSeasonalHouston({ fancy }: { fancy?: boolean }): SeasonalHouston {
	const season = getSeason();
	switch (season) {
		case 'new-year': {
			const year = new Date().getFullYear();
			return {
				hats: rarity(0.5, ['🎩']),
				ties: rarity(0.25, ['🎊', '🎀', '🎉']),
				messages: [
					`New year, new Astro site!`,
					`Kicking ${year} off with Astro?! What an honor!`,
					`Happy ${year}! Let's make something cool.`,
					`${year} is your year! Let's build something awesome.`,
					`${year} is the year of Astro!`,
					`${year} is clearly off to a great start!`,
					`Thanks for starting ${year} with Astro!`,
				],
			};
		}
		case 'spooky':
			return {
				hats: rarity(0.5, ['🎃', '👻', '☠️', '💀', '🕷️', '🔮']),
				ties: rarity(0.25, ['🦴', '🍬', '🍫']),
				messages: [
					`I'm afraid I can't help you... Just kidding!`,
					`Boo! Just kidding. Let's make a website!`,
					`Let's haunt the internet. OooOooOOoo!`,
					`No tricks here. Seeing you is always treat!`,
					`Spiders aren't the only ones building the web!`,
					`Let's conjure up some web magic!`,
					`Let's harness the power of Astro to build a frightful new site!`,
					`We're conjuring up a spooktacular website!`,
					`Prepare for a web of spooky wonders to be woven.`,
					`Chills and thrills await you on your new project!`,
				],
			};
		case 'holiday':
			return {
				hats: rarity(0.75, ['🎁', '🎄', '🌲']),
				ties: rarity(0.75, ['🧣']),
				messages: [
					`'Tis the season to code and create.`,
					`Jingle all the way through your web creation journey!`,
					`Bells are ringing, and so are your creative ideas!`,
					`Let's make the internet our own winter wonderland!`,
					`It's time to decorate a brand new website!`,
					`Let's unwrap the magic of the web together!`,
					`Hope you're enjoying the holiday season!`,
					`I'm dreaming of a brand new website!`,
					`No better holiday gift than a new site!`,
					`Your creativity is the gift that keeps on giving!`,
				],
			};
		case undefined:
		default:
			return {
				hats: fancy ? ['🎩', '🎩', '🎩', '🎩', '🎓', '👑', '🧢', '🍦'] : undefined,
				ties: fancy ? rarity(0.33, ['🎀', '🧣']) : undefined,
				messages: [
					`Let's claim your corner of the internet.`,
					`I'll be your assistant today.`,
					`Let's build something awesome!`,
					`Let's build something great!`,
					`Let's build something fast!`,
					`Let's build the web we want.`,
					`Let's make the web weird!`,
					`Let's make the web a better place!`,
					`Let's create a new project!`,
					`Let's create something unique!`,
					`Time to build a new website.`,
					`Time to build a faster website.`,
					`Time to build a sweet new website.`,
					`We're glad to have you on board.`,
					`Keeping the internet weird since 2021.`,
					`Initiating launch sequence...`,
					`Initiating launch sequence... right... now!`,
					`Awaiting further instructions.`,
				],
			};
	}
}

type Season = 'spooky' | 'holiday' | 'new-year';
function getSeason(): Season | undefined {
	const date = new Date();
	const month = date.getMonth() + 1;
	const day = date.getDate() + 1;

	if (month === 1 && day <= 7) {
		return 'new-year';
	}
	if (month === 10 && day > 7) {
		return 'spooky';
	}
	if (month === 12 && day > 7 && day < 25) {
		return 'holiday';
	}
}

// Generates an array padded with empty strings to make decorations more rare
function rarity(frequency: number, emoji: string[]) {
	if (frequency === 1) return emoji;
	if (frequency === 0) return [''];
	const empty = Array.from({ length: Math.round(emoji.length * frequency) }, () => '');
	return [...emoji, ...empty];
}
