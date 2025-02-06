import assert from 'node:assert/strict';
import test from 'node:test';
import { stringify as devalueStringify } from 'devalue';
import { AstroSession, PERSIST_SYMBOL } from '../../../dist/core/session.js';
// Mock dependencies
const defaultMockCookies = {
	set: () => {},
	delete: () => {},
	get: () => 'sessionid',
};

const stringify = (data) => JSON.parse(devalueStringify(data));

const defaultConfig = {
	driver: 'memory',
	cookie: 'test-session',
	ttl: 60,
};

// Helper to create a new session instance with mocked dependencies
function createSession(config = defaultConfig, cookies = defaultMockCookies, mockStorage) {
	if (mockStorage) {
		config.driver = 'test';
		config.options ??= {};
		config.options.mockStorage = mockStorage;
	}
	return new AstroSession(cookies, config);
}

test('AstroSession - Basic Operations', async (t) => {
	await t.test('should set and get a value', async () => {
		const session = createSession();

		session.set('user', { id: 1, name: 'Test User' });
		const user = await session.get('user');

		assert.deepEqual(user, { id: 1, name: 'Test User' });
	});

	await t.test('should check if value exists', async () => {
		const session = createSession();

		session.set('key', 'value');
		const exists = await session.has('key');
		const notExists = await session.has('nonexistent');

		assert.equal(exists, true);
		assert.equal(notExists, false);
	});

	await t.test('should delete a value', async () => {
		const session = createSession();

		session.set('key', 'value');
		session.delete('key');
		const value = await session.get('key');

		assert.equal(value, undefined);
	});

	await t.test('should list all keys', async () => {
		const session = createSession();

		session.set('key1', 'value1');
		session.set('key2', 'value2');
		const keys = await session.keys();

		assert.deepEqual([...keys], ['key1', 'key2']);
	});
});

test('AstroSession - Cookie Management', async (t) => {
	await t.test('should set cookie on first value set', async () => {
		let cookieSet = false;
		const mockCookies = {
			...defaultMockCookies,
			set: () => {
				cookieSet = true;
			},
		};

		const session = createSession(defaultConfig, mockCookies);
		session.set('key', 'value');

		assert.equal(cookieSet, true);
	});

	await t.test('should delete cookie on destroy', async () => {
		let cookieDeletedArgs;
		let cookieDeletedName;
		const mockCookies = {
			...defaultMockCookies,
			delete: (name, args) => {
				cookieDeletedName = name;
				cookieDeletedArgs = args;
			},
		};

		const session = createSession(defaultConfig, mockCookies);
		session.destroy();
		assert.equal(cookieDeletedName, 'test-session');
		assert.equal(cookieDeletedArgs?.path, '/');
	});
});

test('AstroSession - Session Regeneration', async (t) => {
	await t.test('should preserve data when regenerating session', async () => {
		const session = createSession();

		session.set('key', 'value');
		await session.regenerate();
		const value = await session.get('key');

		assert.equal(value, 'value');
	});

	await t.test('should generate new session ID on regeneration', async () => {
		const session = createSession();
		const initialId = await session.sessionID;

		await session.regenerate();
		const newId = await session.sessionID;

		assert.notEqual(initialId, newId);
	});
});

test('AstroSession - Data Persistence', async (t) => {
	await t.test('should persist data to storage', async () => {
		let storedData;
		const mockStorage = {
			get: async () => null,
			setItem: async (_key, value) => {
				storedData = value;
			},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		session.set('key', 'value');
		await session[PERSIST_SYMBOL]();

		assert.ok(storedData?.includes('value'));
	});

	await t.test('should load data from storage', async () => {
		const mockStorage = {
			get: async () => stringify(new Map([['key', { data: 'value' }]])),
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		const value = await session.get('key');
		assert.equal(value, 'value');
	});

	await t.test('should remove expired session data', async () => {
		const mockStorage = {
			get: async () => stringify(new Map([['key', { data: 'value', expires: -1 }]])),
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		const value = await session.get('key');

		assert.equal(value, undefined);
	});
});

test('AstroSession - Error Handling', async (t) => {
	await t.test('should throw error when setting invalid data', async () => {
		const session = createSession();

		assert.throws(() => session.set('key', { fun: function () {} }), /could not be serialized/);
	});

	await t.test('should throw error when setting empty key', async () => {
		const session = createSession();

		assert.throws(() => session.set('', 'value'), /key was not provided/);
	});

	await t.test('should handle corrupted storage data', async () => {
		const mockStorage = {
			get: async () => 'invalid-json',
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		await assert.rejects(async () => await session.get('key'), /could not be parsed/);
	});
});

test('AstroSession - Configuration', async (t) => {
	await t.test('should use custom cookie name from config', async () => {
		let cookieName;
		const mockCookies = {
			...defaultMockCookies,
			set: (name) => {
				cookieName = name;
			},
		};

		const session = createSession(
			{
				...defaultConfig,
				cookie: 'custom-session',
			},
			mockCookies,
		);

		session.set('key', 'value');
		assert.equal(cookieName, 'custom-session');
	});

	await t.test('should use default cookie name if not specified', async () => {
		let cookieName;
		const mockCookies = {
			...defaultMockCookies,
			set: (name) => {
				cookieName = name;
			},
		};

		const session = createSession(
			{
				...defaultConfig,
				// @ts-ignore
				cookie: undefined,
			},
			mockCookies,
		);

		session.set('key', 'value');
		assert.equal(cookieName, 'astro-session');
	});
});

test('AstroSession - Sparse Data Operations', async (t) => {
	await t.test('should handle multiple operations in sparse mode', async () => {
		const existingData = stringify(
			new Map([
				['keep', { data: 'original' }],
				['delete', { data: 'remove' }],
				['update', { data: 'old' }],
			]),
		);

		const mockStorage = {
			get: async () => existingData,
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		// Mixed operations
		session.delete('delete');
		session.set('update', 'new');
		session.set('new', 'value');

		// Verify each operation type
		assert.equal(await session.get('keep'), 'original');
		assert.equal(await session.get('delete'), undefined);
		assert.equal(await session.get('update'), 'new');
		assert.equal(await session.get('new'), 'value');
	});

	await t.test('should persist deleted state across multiple operations', async () => {
		const existingData = stringify(new Map([['key', 'value']]));
		const mockStorage = {
			get: async () => existingData,
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		session.delete('key');

		// Multiple gets should all return undefined
		assert.equal(await session.get('key'), undefined);
		assert.equal(await session.has('key'), false);

		// Setting a different key shouldn't affect the deleted state
		session.set('other', 'value');
		assert.equal(await session.get('key'), undefined);
	});

	await t.test('should maintain deletion after persistence', async () => {
		let storedData;
		const mockStorage = {
			get: async () => storedData || stringify(new Map([['key', 'value']])),
			setItem: async (_key, value) => {
				storedData = value;
			},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		session.delete('key');
		await session[PERSIST_SYMBOL]();

		// Create a new session using the stored data
		const newSession = createSession(defaultConfig, defaultMockCookies, {
			get: async () => storedData,
			setItem: async () => {},
		});

		assert.equal(await newSession.get('key'), undefined);
	});

	await t.test('should update existing values in sparse mode', async () => {
		const existingData = stringify(new Map([['key', 'old']]));
		const mockStorage = {
			get: async () => existingData,
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		session.set('key', 'new');
		assert.equal(await session.get('key'), 'new');

		// Verify through keys() as well
		const keys = await session.keys();
		assert.deepEqual([...keys], ['key']);
	});
});

test('AstroSession - Cleanup Operations', async (t) => {
	await t.test('should clean up destroyed sessions on persist', async () => {
		const removedKeys = new Set();
		const mockStorage = {
			get: async () => stringify(new Map([['key', 'value']])),
			setItem: async () => {},
			removeItem: async (key) => {
				removedKeys.add(key);
			},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		// Set up session
		session.set('key', 'value');
		const oldId = session.sessionID;

		// Destroy it
		session.destroy();

		// Simulate end of request
		await session[PERSIST_SYMBOL]();

		assert.ok(removedKeys.has(oldId), `Session ${oldId} should be removed`);
	});
});

test('AstroSession - Cookie Security', async (t) => {
	await t.test('should enforce httpOnly cookie setting', async () => {
		let cookieOptions;
		const mockCookies = {
			...defaultMockCookies,
			set: (_name, _value, options) => {
				cookieOptions = options;
			},
		};

		const session = createSession(
			{
				...defaultConfig,
				cookieOptions: {
					httpOnly: false,
				},
			},
			mockCookies,
		);

		session.set('key', 'value');
		assert.equal(cookieOptions.httpOnly, true);
	});

	await t.test('should set secure and sameSite by default', async () => {
		let cookieOptions;
		const mockCookies = {
			...defaultMockCookies,
			set: (_name, _value, options) => {
				cookieOptions = options;
			},
		};

		const session = createSession(defaultConfig, mockCookies);

		session.set('key', 'value');
		assert.equal(cookieOptions.secure, true);
		assert.equal(cookieOptions.sameSite, 'lax');
	});
});

test('AstroSession - Storage Errors', async (t) => {
	await t.test('should handle storage setItem failures', async () => {
		const mockStorage = {
			get: async () => stringify(new Map()),
			setItem: async () => {
				throw new Error('Storage full');
			},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);
		session.set('key', 'value');

		await assert.rejects(async () => await session[PERSIST_SYMBOL](), /Storage full/);
	});

	await t.test('should handle invalid Map data', async () => {
		const mockStorage = {
			get: async () => stringify({ notAMap: true }),
			setItem: async () => {},
		};

		const session = createSession(defaultConfig, defaultMockCookies, mockStorage);

		await assert.rejects(
			async () => await session.get('key'),
			/The session data was an invalid type/,
		);
	});
});
