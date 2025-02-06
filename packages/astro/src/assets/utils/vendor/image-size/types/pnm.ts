import type { IImage, ISize } from './interface.ts'
import { toUTF8String } from './utils.js'

const PNMTypes = {
  P1: 'pbm/ascii',
  P2: 'pgm/ascii',
  P3: 'ppm/ascii',
  P4: 'pbm',
  P5: 'pgm',
  P6: 'ppm',
  P7: 'pam',
  PF: 'pfm',
} as const

type ValidSignature = keyof typeof PNMTypes
type Handler = (type: string[]) => ISize

const handlers: { [type: string]: Handler } = {
  default: (lines) => {
    let dimensions: string[] = []

    while (lines.length > 0) {
			// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const line = lines.shift() as string
      if (line[0] === '#') {
        continue
      }
      dimensions = line.split(' ')
      break
    }

    if (dimensions.length === 2) {
      return {
        height: parseInt(dimensions[1], 10),
        width: parseInt(dimensions[0], 10),
      }
    } else {
      throw new TypeError('Invalid PNM')
    }
  },
  pam: (lines) => {
    const size: { [key: string]: number } = {}
    while (lines.length > 0) {
			// eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const line = lines.shift() as string
      if (line.length > 16 || line.charCodeAt(0) > 128) {
        continue
      }
      const [key, value] = line.split(' ')
      if (key && value) {
        size[key.toLowerCase()] = parseInt(value, 10)
      }
      if (size.height && size.width) {
        break
      }
    }

    if (size.height && size.width) {
      return {
        height: size.height,
        width: size.width,
      }
    } else {
      throw new TypeError('Invalid PAM')
    }
  },
}

export const PNM: IImage = {
  validate: (input) => toUTF8String(input, 0, 2) in PNMTypes,

  calculate(input) {
    const signature = toUTF8String(input, 0, 2) as ValidSignature
    const type = PNMTypes[signature]
    // TODO: this probably generates garbage. move to a stream based parser
    const lines = toUTF8String(input, 3).split(/[\r\n]+/)
    const handler = handlers[type] || handlers.default
    return handler(lines)
  },
}
