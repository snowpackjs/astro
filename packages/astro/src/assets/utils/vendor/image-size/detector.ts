import type { imageType } from './types/index.js'
import { typeHandlers, types } from './types/index.js'

// This map helps avoid validating for every single image type
const firstBytes = new Map<number, imageType>([
  [0x38, 'psd'],
  [0x42, 'bmp'],
  [0x44, 'dds'],
  [0x47, 'gif'],
  [0x49, 'tiff'],
  [0x4d, 'tiff'],
  [0x52, 'webp'],
  [0x69, 'icns'],
  [0x89, 'png'],
  [0xff, 'jpg'],
])

export function detector(input: Uint8Array): imageType | undefined {
  const byte = input[0]
  const type = firstBytes.get(byte)
  if (type && typeHandlers.get(type)!.validate(input)) {
    return type
  }
  return types.find((fileType) => typeHandlers.get(fileType)!.validate(input))
}
