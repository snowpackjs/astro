const decoder = new TextDecoder()
export const toUTF8String = (
  input: Uint8Array,
  start = 0,
  end = input.length,
) => decoder.decode(input.slice(start, end))

export const toHexString = (input: Uint8Array, start = 0, end = input.length) =>
  input
    .slice(start, end)
    .reduce((memo, i) => memo + ('0' + i.toString(16)).slice(-2), '')

export const readInt16LE = (input: Uint8Array, offset = 0) => {
  const val = input[offset] + input[offset + 1] * 2 ** 8
  return val | ((val & (2 ** 15)) * 0x1fffe)
}

export const readUInt16BE = (input: Uint8Array, offset = 0) =>
  input[offset] * 2 ** 8 + input[offset + 1]

export const readUInt16LE = (input: Uint8Array, offset = 0) =>
  input[offset] + input[offset + 1] * 2 ** 8

export const readUInt24LE = (input: Uint8Array, offset = 0) =>
  input[offset] + input[offset + 1] * 2 ** 8 + input[offset + 2] * 2 ** 16

export const readInt32LE = (input: Uint8Array, offset = 0) =>
  input[offset] +
  input[offset + 1] * 2 ** 8 +
  input[offset + 2] * 2 ** 16 +
  (input[offset + 3] << 24)

export const readUInt32BE = (input: Uint8Array, offset = 0) =>
  input[offset] * 2 ** 24 +
  input[offset + 1] * 2 ** 16 +
  input[offset + 2] * 2 ** 8 +
  input[offset + 3]

export const readUInt32LE = (input: Uint8Array, offset = 0) =>
  input[offset] +
  input[offset + 1] * 2 ** 8 +
  input[offset + 2] * 2 ** 16 +
  input[offset + 3] * 2 ** 24

// Abstract reading multi-byte unsigned integers
const methods = {
  readUInt16BE,
  readUInt16LE,
  readUInt32BE,
  readUInt32LE,
} as const

type MethodName = keyof typeof methods
export function readUInt(
  input: Uint8Array,
  bits: 16 | 32,
  offset: number,
  isBigEndian: boolean,
): number {
  offset = offset || 0
  const endian = isBigEndian ? 'BE' : 'LE'
  const methodName: MethodName = ('readUInt' + bits + endian) as MethodName
  return methods[methodName](input, offset)
}

function readBox(buffer: Uint8Array, offset: number) {
  if (buffer.length - offset < 4) return
  const boxSize = readUInt32BE(buffer, offset)
  if (buffer.length - offset < boxSize) return
  return {
    name: toUTF8String(buffer, 4 + offset, 8 + offset),
    offset,
    size: boxSize,
  }
}

export function findBox(buffer: Uint8Array, boxName: string, offset: number) {
  while (offset < buffer.length) {
    const box = readBox(buffer, offset)
    if (!box) break
    if (box.name === boxName) return box
    offset += box.size
  }
}
