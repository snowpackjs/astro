import type { IImage } from './interface.ts'
import { readUInt32BE, findBox } from './utils.js'

export const JP2: IImage = {
  validate(input) {
    if (readUInt32BE(input, 4) !== 0x6a502020 || readUInt32BE(input, 0) < 1)  return false
    const ftypBox = findBox(input, 'ftyp', 0)
    if (!ftypBox) return false
    return readUInt32BE(input, ftypBox.offset + 4) === 0x66747970
  },

  calculate(input) {
    const jp2hBox = findBox(input, 'jp2h', 0)
    const ihdrBox = jp2hBox && findBox(input, 'ihdr', jp2hBox.offset + 8)
    if (ihdrBox) {
      return {
        height: readUInt32BE(input, ihdrBox.offset + 8),
        width: readUInt32BE(input, ihdrBox.offset + 12),
      }
    }
    throw new TypeError('Unsupported JPEG 2000 format')
  },
}
