import { print } from './print.js';

export type RedirectDefinition = {
	dynamic: boolean;
	input: string;
	target: string;
	// Allows specifying a weight to the definition.
	// This allows insertion of definitions out of order but having
	// a priority once inserted.
	weight: number;
	status: number;
	force?: boolean;
};

export class Redirects {
	public definitions: RedirectDefinition[] = [];
	public minInputLength = 4;
	public minTargetLength = 4;

	/**
	 * Adds a new definition by inserting it into the list of definitions
	 * prioritized by the given weight. This keeps higher priority definitions
	 * At the top of the list once printed.
	 */
	add(definition: RedirectDefinition) {
		// Find the longest input, so we can format things nicely
		if (definition.input.length > this.minInputLength) {
			this.minInputLength = definition.input.length;
		}
		// Same for the target
		if (definition.target.length > this.minTargetLength) {
			this.minTargetLength = definition.target.length;
		}

		binaryInsert(this.definitions, definition, (a, b) => {
			return a.weight > b.weight;
		});
	}

	print(): string {
		return print(this.definitions, this.minInputLength, this.minTargetLength);
	}

	empty(): boolean {
		return this.definitions.length === 0;
	}
}

function binaryInsert<T>(sorted: T[], item: T, comparator: (a: T, b: T) => boolean) {
	if (sorted.length === 0) {
		sorted.push(item);
		return 0;
	}
	let low = 0,
		high = sorted.length - 1,
		mid = 0;
	while (low <= high) {
		mid = low + ((high - low) >> 1);
		if (comparator(sorted[mid], item)) {
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}

	if (comparator(sorted[mid], item)) {
		mid++;
	}

	sorted.splice(mid, 0, item);
	return mid;
}
