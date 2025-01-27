import type { IImage } from './interface.ts'
import { toHexString, readUInt32BE } from './utils.js'

export const J2C: IImage = {
  // TODO: this doesn't seem right. SIZ marker doesn't have to be right after the SOC
  validate: (input) => toHexString(input, 0, 4) === 'ff4fff51',

  calculate: (input) => ({
    height: readUInt32BE(input, 12),
    width: readUInt32BE(input, 8),
  }),
}
