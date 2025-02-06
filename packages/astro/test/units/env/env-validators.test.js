import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { getEnvFieldType, validateEnvVariable } from '../../../dist/env/validators.js';

/**
 * @typedef {Parameters<typeof validateEnvVariable>} Params
 */

const createFixture = () => {
	/**
	 * @type {{ value: Params[1]; options: Params[2] }} input
	 */
	let input;

	return {
		/**
		 * @param {Params[1]} value
		 * @param {Params[2]} options
		 */
		givenInput(value, options) {
			input = { value, options };
		},
		/**
		 * @param {import("../../../src/env/validators.js").ValidationResultValue} value
		 */
		thenResultShouldBeValid(value) {
			const result = validateEnvVariable(input.value, input.options);
			assert.equal(result.ok, true);
			assert.equal(result.value, value);
			input = undefined;
		},
		/**
		 * @param {string | Array<string>} providedErrors
		 */
		thenResultShouldBeInvalid(providedErrors) {
			const result = validateEnvVariable(input.value, input.options);
			assert.equal(result.ok, false);
			const errors = typeof providedErrors === 'string' ? [providedErrors] : providedErrors;
			assert.equal(
				result.errors.every((element) => errors.includes(element)),
				true,
			);
			input = undefined;
		},
	};
};

describe('astro:env validators', () => {
	/** @type {ReturnType<typeof createFixture>} */
	let fixture;

	before(() => {
		fixture = createFixture();
	});

	it('types codegen should return the right string based on the field options', () => {
		assert.equal(
			getEnvFieldType({
				type: 'string',
			}),
			'string',
		);

		assert.equal(
			getEnvFieldType({
				type: 'string',
				optional: true,
			}),
			'string | undefined',
		);

		assert.equal(
			getEnvFieldType({
				type: 'string',
				optional: true,
				default: 'abc',
			}),
			'string',
		);

		assert.equal(
			getEnvFieldType({
				type: 'number',
			}),
			'number',
		);

		assert.equal(
			getEnvFieldType({
				type: 'number',
				optional: true,
			}),
			'number | undefined',
		);

		assert.equal(
			getEnvFieldType({
				type: 'number',
				optional: true,
				default: 456,
			}),
			'number',
		);

		assert.equal(
			getEnvFieldType({
				type: 'boolean',
			}),
			'boolean',
		);

		assert.equal(
			getEnvFieldType({
				type: 'boolean',
				optional: true,
			}),
			'boolean | undefined',
		);

		assert.equal(
			getEnvFieldType({
				type: 'boolean',
				optional: true,
				default: true,
			}),
			'boolean',
		);

		assert.equal(
			getEnvFieldType({
				type: 'enum',
				values: ['A'],
			}),
			"'A'",
		);

		assert.equal(
			getEnvFieldType({
				type: 'enum',
				values: ['A', 'B'],
			}),
			"'A' | 'B'",
		);

		assert.equal(
			getEnvFieldType({
				type: 'enum',
				optional: true,
				values: ['A'],
			}),
			"'A' | undefined",
		);
		assert.equal(
			getEnvFieldType({
				type: 'enum',
				optional: true,
				values: ['A', 'B'],
				default: 'A',
			}),
			"'A' | 'B'",
		);
	});

	describe('string field', () => {
		it('Should fail if the variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'string',
			});
			fixture.thenResultShouldBeInvalid('missing');
		});

		it('Should not fail is the variable type is incorrect', () => {
			fixture.givenInput('123456', {
				type: 'string',
			});
			fixture.thenResultShouldBeValid('123456');
		});

		it('Should fail if conditions are not met', () => {
			fixture.givenInput('abcdef', {
				type: 'string',
				max: 6,
			});
			fixture.thenResultShouldBeValid('abcdef');

			fixture.givenInput('abcdef', {
				type: 'string',
				max: 3,
			});
			fixture.thenResultShouldBeInvalid('max');

			fixture.givenInput('abc', {
				type: 'string',
				min: 1,
			});
			fixture.thenResultShouldBeValid('abc');

			fixture.givenInput('abc', {
				type: 'string',
				min: 5,
			});
			fixture.thenResultShouldBeInvalid('min');

			fixture.givenInput('abc', {
				type: 'string',
				length: 3,
			});
			fixture.thenResultShouldBeValid('abc');

			fixture.givenInput('abc', {
				type: 'string',
				length: 10,
			});
			fixture.thenResultShouldBeInvalid('length');

			fixture.givenInput('abc', {
				type: 'string',
				url: true,
			});
			fixture.thenResultShouldBeInvalid('url');

			fixture.givenInput('https://example.com', {
				type: 'string',
				url: true,
			});
			fixture.thenResultShouldBeValid('https://example.com');

			fixture.givenInput('abc', {
				type: 'string',
				includes: 'cd',
			});
			fixture.thenResultShouldBeInvalid('includes');

			fixture.givenInput('abc', {
				type: 'string',
				includes: 'bc',
			});
			fixture.thenResultShouldBeValid('abc');

			fixture.givenInput('abc', {
				type: 'string',
				startsWith: 'za',
			});
			fixture.thenResultShouldBeInvalid('startsWith');

			fixture.givenInput('abc', {
				type: 'string',
				startsWith: 'ab',
			});
			fixture.thenResultShouldBeValid('abc');

			fixture.givenInput('abc', {
				type: 'string',
				endsWith: 'za',
			});
			fixture.thenResultShouldBeInvalid('endsWith');

			fixture.givenInput('abc', {
				type: 'string',
				endsWith: 'bc',
			});
			fixture.thenResultShouldBeValid('abc');

			fixture.givenInput('abcd', {
				type: 'string',
				startsWith: 'ab',
				endsWith: 'cd',
			});
			fixture.thenResultShouldBeValid('abcd');

			fixture.givenInput(undefined, {
				type: 'string',
				min: 5,
			});
			fixture.thenResultShouldBeInvalid('missing');

			fixture.givenInput('ab', {
				type: 'string',
				startsWith: 'x',
				min: 5,
			});
			fixture.thenResultShouldBeInvalid(['startsWith', 'min']);
		});

		it('Should not fail if the optional variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'string',
				optional: true,
			});
			fixture.thenResultShouldBeValid(undefined);
		});

		it('Should not fail if the variable is missing and a default value is provided', () => {
			fixture.givenInput(undefined, {
				type: 'string',
				default: 'abc',
			});
			fixture.thenResultShouldBeValid('abc');
		});

		it('Should not take a default value is the variable is not missing', () => {
			fixture.givenInput('abc', {
				type: 'string',
				default: 'def',
			});
			fixture.thenResultShouldBeValid('abc');
		});
	});

	describe('number field', () => {
		it('Should fail if the variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'number',
			});
			fixture.thenResultShouldBeInvalid('missing');
		});

		it('Should fail is the variable type is incorrect', () => {
			fixture.givenInput('abc', {
				type: 'number',
			});
			fixture.thenResultShouldBeInvalid('type');
		});

		it('Should fail if conditions are not met', () => {
			fixture.givenInput('10', {
				type: 'number',
				gt: 15,
			});
			fixture.thenResultShouldBeInvalid('gt');

			fixture.givenInput('10', {
				type: 'number',
				gt: 10,
			});
			fixture.thenResultShouldBeInvalid('gt');

			fixture.givenInput('10', {
				type: 'number',
				gt: 5,
			});
			fixture.thenResultShouldBeValid(10);

			fixture.givenInput('20', {
				type: 'number',
				min: 25,
			});
			fixture.thenResultShouldBeInvalid('min');

			fixture.givenInput('20', {
				type: 'number',
				min: 20,
			});
			fixture.thenResultShouldBeValid(20);

			fixture.givenInput('20', {
				type: 'number',
				min: 5,
			});
			fixture.thenResultShouldBeValid(20);

			fixture.givenInput('15', {
				type: 'number',
				lt: 10,
			});
			fixture.thenResultShouldBeInvalid('lt');

			fixture.givenInput('10', {
				type: 'number',
				lt: 10,
			});
			fixture.thenResultShouldBeInvalid('lt');

			fixture.givenInput('5', {
				type: 'number',
				lt: 10,
			});
			fixture.thenResultShouldBeValid(5);

			fixture.givenInput('25', {
				type: 'number',
				max: 20,
			});
			fixture.thenResultShouldBeInvalid('max');

			fixture.givenInput('25', {
				type: 'number',
				max: 25,
			});
			fixture.thenResultShouldBeValid(25);

			fixture.givenInput('25', {
				type: 'number',
				max: 30,
			});
			fixture.thenResultShouldBeValid(25);

			fixture.givenInput('4.5', {
				type: 'number',
				int: true,
			});
			fixture.thenResultShouldBeInvalid('int');

			fixture.givenInput('25', {
				type: 'number',
				int: true,
			});
			fixture.thenResultShouldBeValid(25);

			fixture.givenInput('4', {
				type: 'number',
				int: false,
			});
			fixture.thenResultShouldBeInvalid('int');

			fixture.givenInput('4.5', {
				type: 'number',
				int: false,
			});
			fixture.thenResultShouldBeValid(4.5);

			fixture.givenInput(undefined, {
				type: 'number',
				gt: 10,
			});
			fixture.thenResultShouldBeInvalid('missing');
		});

		it('Should accept integers', () => {
			fixture.givenInput('12345', {
				type: 'number',
			});
			fixture.thenResultShouldBeValid(12345);
		});

		it('Should accept floats', () => {
			fixture.givenInput('12.34', {
				type: 'number',
			});
			fixture.thenResultShouldBeValid(12.34);
		});

		it('Should not fail if the optional variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'number',
				optional: true,
			});
			fixture.thenResultShouldBeValid(undefined);
		});

		it('Should not fail if the variable is missing and a default value is provided', () => {
			fixture.givenInput(undefined, {
				type: 'number',
				default: 123,
			});
			fixture.thenResultShouldBeValid(123);
		});

		it('Should not take a default value is the variable is not missing', () => {
			fixture.givenInput('123', {
				type: 'number',
				default: 456,
			});
			fixture.thenResultShouldBeValid(123);
		});
	});

	describe('boolean field', () => {
		it('Should fail if the variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'boolean',
			});
			fixture.thenResultShouldBeInvalid('missing');
		});

		it('Should fail is the variable type is incorrect', () => {
			fixture.givenInput('abc', {
				type: 'boolean',
			});
			fixture.thenResultShouldBeInvalid('type');
		});

		it('Should not fail if the optional variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'boolean',
				optional: true,
			});
			fixture.thenResultShouldBeValid(undefined);
		});

		it('Should not fail if the variable is missing and a default value is provided', () => {
			fixture.givenInput(undefined, {
				type: 'boolean',
				default: true,
			});
			fixture.thenResultShouldBeValid(true);
		});

		it('Should not take a default value is the variable is not missing', () => {
			fixture.givenInput('true', {
				type: 'boolean',
				default: false,
			});
			fixture.thenResultShouldBeValid(true);
		});
	});

	describe('enum field', () => {
		it('Should fail if the variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'enum',
				values: ['a', 'b'],
			});
			fixture.thenResultShouldBeInvalid('missing');
		});

		it('Should fail is the variable type is incorrect', () => {
			fixture.givenInput('true', {
				type: 'enum',
				values: ['a', 'b'],
			});
			fixture.thenResultShouldBeInvalid('type');
		});

		it('Should not fail if the optional variable is missing', () => {
			fixture.givenInput(undefined, {
				type: 'enum',
				values: ['a', 'b'],
				optional: true,
			});
			fixture.thenResultShouldBeValid(undefined);
		});

		it('Should not fail if the variable is missing and a default value is provided', () => {
			fixture.givenInput(undefined, {
				type: 'enum',
				values: ['a', 'b'],
				default: 'a',
			});
			fixture.thenResultShouldBeValid('a');
		});

		it('Should not take a default value is the variable is not missing', () => {
			fixture.givenInput('b', {
				type: 'enum',
				values: ['a', 'b'],
				default: 'a',
			});
			fixture.thenResultShouldBeValid('b');
		});
	});
});
