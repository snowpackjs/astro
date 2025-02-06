import type { IImage } from './interface.ts'
import { toUTF8String, readUInt32BE } from './utils.js'

const pngSignature = 'PNG\r\n\x1a\n'
const pngImageHeaderChunkName = 'IHDR'

// Used to detect "fried" png's: http://www.jongware.com/pngdefry.html
const pngFriedChunkName = 'CgBI'

export const PNG: IImage = {
  validate(input) {
    if (pngSignature === toUTF8String(input, 1, 8)) {
      let chunkName = toUTF8String(input, 12, 16)
      if (chunkName === pngFriedChunkName) {
        chunkName = toUTF8String(input, 28, 32)
      }
      if (chunkName !== pngImageHeaderChunkName) {
        throw new TypeError('Invalid PNG')
      }
      return true
    }
    return false
  },

  calculate(input) {
    if (toUTF8String(input, 12, 16) === pngFriedChunkName) {
      return {
        height: readUInt32BE(input, 36),
        width: readUInt32BE(input, 32),
      }
    }
    return {
      height: readUInt32BE(input, 20),
      width: readUInt32BE(input, 16),
    }
  },
}
