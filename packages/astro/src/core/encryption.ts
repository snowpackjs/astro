import { base64, decodeHex, encodeHex } from '@oslojs/encoding';

// Chose this algorithm for no particular reason, can change.
// This algo does check against text manipulation though. See
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt#aes-gcm
const ALGORITHM = 'AES-GCM';

/**
 * Creates a CryptoKey object that can be used to encrypt any string.
 */
export async function createKey() {
	const key = await crypto.subtle.generateKey(
		{
			name: ALGORITHM,
			length: 256,
		},
		true,
		['encrypt', 'decrypt']
	);
	return key;
}

/**
 * Takes a key that has been serialized to an array of bytes and returns a CryptoKey
 */
export async function importKey(bytes: Uint8Array): Promise<CryptoKey> {
  const key = await crypto.subtle.importKey('raw', bytes, ALGORITHM, true, ['encrypt', 'decrypt']);
  return key;
}

/**
 * Encodes a CryptoKey to base64 string, so that it can be embedded in JSON / JavaScript
 */
export async function encodeKey(key: CryptoKey) {
	const exported = await crypto.subtle.exportKey('raw', key);
	const encodedKey = base64.encode(new Uint8Array(exported));
	return encodedKey;
}

/**
 * Decodes a base64 string into bytes and then imports the key.
 */
export async function decodeKey(encoded: string): Promise<CryptoKey> {
  const bytes = base64.decode(encoded);
	return crypto.subtle.importKey('raw', bytes, ALGORITHM, true, ['encrypt', 'decrypt']);
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
// The length of the initialization vector
// See https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
const IV_LENGTH = 24;

/**
 * Using a CryptoKey, encrypt a string into a base64 string.
 */
export async function encryptString(key: CryptoKey, raw: string) {
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH / 2));
	const data = encoder.encode(raw);
	const buffer = await crypto.subtle.encrypt(
		{
			name: ALGORITHM,
			iv,
		},
		key,
		data
	);
	// iv is 12, hex brings it to 24
	return encodeHex(iv) + base64.encode(new Uint8Array(buffer));
}

/**
 * Takes a base64 encoded string, decodes it and returns the decrypted text.
 */
export async function decryptString(key: CryptoKey, encoded: string) {
  const iv = decodeHex(encoded.slice(0, IV_LENGTH));
	const dataArray = base64.decode(encoded.slice(IV_LENGTH));
	const decryptedBuffer = await crypto.subtle.decrypt(
		{
			name: ALGORITHM,
			iv,
		},
		key,
		dataArray
	);
	const decryptedString = decoder.decode(decryptedBuffer);
	return decryptedString;
}
