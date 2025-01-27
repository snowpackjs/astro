import type {
	TransitionBeforePreparationEvent,
	TransitionBeforeSwapEvent,
} from '../../transitions/events.js';

export interface TransitionAnimation {
	name: string; // The name of the keyframe
	delay?: number | string;
	duration?: number | string;
	easing?: string;
	fillMode?: string;
	direction?: string;
}

export interface TransitionAnimationPair {
	old: TransitionAnimation | TransitionAnimation[];
	new: TransitionAnimation | TransitionAnimation[];
}

export interface TransitionDirectionalAnimations {
	forwards: TransitionAnimationPair;
	backwards: TransitionAnimationPair;
}

export type TransitionAnimationValue =
	| 'initial'
	| 'slide'
	| 'fade'
	| 'none'
	| TransitionDirectionalAnimations;

declare global {
	interface DocumentEventMap {
		'astro:before-preparation': TransitionBeforePreparationEvent;
		'astro:after-preparation': Event;
		'astro:before-swap': TransitionBeforeSwapEvent;
		'astro:after-swap': Event;
		'astro:page-load': Event;
	}
}
