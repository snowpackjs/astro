import type { IImage } from './interface.ts'
import { toUTF8String, readUInt16LE } from './utils.js'

const gifRegexp = /^GIF8[79]a/
export const GIF: IImage = {
  validate: (input) => gifRegexp.test(toUTF8String(input, 0, 6)),

  calculate: (input) => ({
    height: readUInt16LE(input, 8),
    width: readUInt16LE(input, 6),
  }),
}
