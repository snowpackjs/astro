import type { IImage } from './interface.ts'
import { findBox, readUInt32BE, toUTF8String } from './utils.js'

const brandMap = {
  avif: 'avif',
  mif1: 'heif',
  msf1: 'heif', // hief-sequence
  heic: 'heic',
  heix: 'heic',
  hevc: 'heic', // heic-sequence
  hevx: 'heic', // heic-sequence
}

function detectBrands(buffer: Uint8Array, start: number, end: number) {
	let brandsDetected = {} as Record<keyof typeof brandMap, 1>; 
	for (let i = start; i <= end; i += 4) {
			const brand = toUTF8String(buffer, i, i + 4);
			if (brand in brandMap) {
					brandsDetected[brand as keyof typeof brandMap] = 1;
			}
	}

	// Determine the most relevant type based on detected brands
	if ('avif' in brandsDetected) {
			return 'avif';
	} else if ('heic' in brandsDetected || 'heix' in brandsDetected || 'hevc' in brandsDetected || 'hevx' in brandsDetected) {
			return 'heic';
	} else if ('mif1' in brandsDetected || 'msf1' in brandsDetected) {
			return 'heif';
	}
}

export const HEIF: IImage = {
  validate(buffer) {
    const ftype = toUTF8String(buffer, 4, 8)
    const brand = toUTF8String(buffer, 8, 12)
    return 'ftyp' === ftype && brand in brandMap
  },

  calculate(buffer) {
    // Based on https://nokiatech.github.io/heif/technical.html
    const metaBox = findBox(buffer, 'meta', 0)
    const iprpBox = metaBox && findBox(buffer, 'iprp', metaBox.offset + 12)
    const ipcoBox = iprpBox && findBox(buffer, 'ipco', iprpBox.offset + 8)
    const ispeBox = ipcoBox && findBox(buffer, 'ispe', ipcoBox.offset + 8)
    if (ispeBox) {
      return {
        height: readUInt32BE(buffer, ispeBox.offset + 16),
        width: readUInt32BE(buffer, ispeBox.offset + 12),
        type: detectBrands(buffer, 8, metaBox.offset),
      }
    }
    throw new TypeError('Invalid HEIF, no size found')
  }
}
