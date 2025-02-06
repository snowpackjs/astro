import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { AstroTelemetry } from '../dist/index.js';

function setup() {
	const config = new Map();
	const telemetry = new AstroTelemetry({ version: '0.0.0-test.1' });
	const logs = [];
	// Stub isCI to false so we can test user-facing behavior
	telemetry.isCI = false;
	// Stub process.env to properly test in Astro's own CI
	telemetry.env = {};
	// Override config so we can inspect it
	telemetry.config = config;
	// Override debug so we can inspect it
	telemetry.debug.enabled = true;
	telemetry.debug.log = (...args) => logs.push(args);

	return { telemetry, config, logs };
}
describe('AstroTelemetry', () => {
	let oldCI;
	before(() => {
		oldCI = process.env.CI;
		// Stub process.env.CI to `false`
		process.env.CI = 'false';
	});
	after(() => {
		process.env.CI = oldCI;
	});
	it('initializes when expected arguments are given', () => {
		const { telemetry } = setup();
		assert(telemetry instanceof AstroTelemetry);
	});
	it('does not record event if disabled', async () => {
		const { telemetry, config, logs } = setup();
		telemetry.setEnabled(false);
		const [key] = Array.from(config.keys());
		assert.notEqual(key, undefined);
		assert.equal(config.get(key), false);
		assert.equal(telemetry.enabled, false);
		assert.equal(telemetry.isDisabled, true);
		const result = await telemetry.record(['TEST']);
		assert.equal(result, undefined);
		const [log] = logs;
		assert.notEqual(log, undefined);
		assert.match(logs.join(''), /disabled/);
	});
	it('records event if enabled', async () => {
		const { telemetry, config, logs } = setup();
		telemetry.setEnabled(true);
		const [key] = Array.from(config.keys());
		assert.notEqual(key, undefined);
		assert.equal(config.get(key), true);
		assert.equal(telemetry.enabled, true);
		assert.equal(telemetry.isDisabled, false);
		await telemetry.record(['TEST']);
		assert.equal(logs.length, 2);
	});
	it('respects disable from notify', async () => {
		const { telemetry, config, logs } = setup();
		await telemetry.notify(() => false);
		const [key] = Array.from(config.keys());
		assert.notEqual(key, undefined);
		assert.equal(config.get(key), false);
		assert.equal(telemetry.enabled, false);
		assert.equal(telemetry.isDisabled, true);
		const [log] = logs;
		assert.notEqual(log, undefined);
		assert.match(logs.join(''), /disabled/);
	});
	it('respects enable from notify', async () => {
		const { telemetry, config, logs } = setup();
		await telemetry.notify(() => true);
		const [key] = Array.from(config.keys());
		assert.notEqual(key, undefined);
		assert.equal(config.get(key), true);
		assert.equal(telemetry.enabled, true);
		assert.equal(telemetry.isDisabled, false);
		const [log] = logs;
		assert.notEqual(log, undefined);
		assert.match(logs.join(''), /enabled/);
	});
});
