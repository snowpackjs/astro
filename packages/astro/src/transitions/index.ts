import type {
	TransitionAnimationPair,
	TransitionDirectionalAnimations,
} from '../types/public/view-transitions.js';

export { createAnimationScope } from '../runtime/server/transition.js';

const EASE_IN_OUT_QUART = 'cubic-bezier(0.76, 0, 0.24, 1)';

export function slide({
	duration,
}: {
	duration?: string | number;
} = {}): TransitionDirectionalAnimations {
	return {
		forwards: {
			old: [
				{
					name: 'astroFadeOut',
					duration: duration ?? '90ms',
					easing: EASE_IN_OUT_QUART,
					fillMode: 'both',
				},
				{
					name: 'astroSlideToLeft',
					duration: duration ?? '220ms',
					easing: EASE_IN_OUT_QUART,
					fillMode: 'both',
				},
			],
			new: [
				{
					name: 'astroFadeIn',
					duration: duration ?? '210ms',
					easing: EASE_IN_OUT_QUART,
					delay: duration ? undefined : '30ms',
					fillMode: 'both',
				},
				{
					name: 'astroSlideFromRight',
					duration: duration ?? '220ms',
					easing: EASE_IN_OUT_QUART,
					fillMode: 'both',
				},
			],
		},
		backwards: {
			old: [{ name: 'astroFadeOut' }, { name: 'astroSlideToRight' }],
			new: [{ name: 'astroFadeIn' }, { name: 'astroSlideFromLeft' }],
		},
	};
}

export function fade({
	duration,
}: {
	duration?: string | number;
} = {}): TransitionDirectionalAnimations {
	const anim = {
		old: {
			name: 'astroFadeOut',
			duration: duration ?? 180,
			easing: EASE_IN_OUT_QUART,
			fillMode: 'both',
		},
		new: {
			name: 'astroFadeIn',
			duration: duration ?? 180,
			easing: EASE_IN_OUT_QUART,
			fillMode: 'both',
		},
	} satisfies TransitionAnimationPair;

	return {
		forwards: anim,
		backwards: anim,
	};
}
