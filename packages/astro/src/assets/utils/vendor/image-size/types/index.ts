// load all available handlers explicitly for browserify support
import { BMP } from './bmp.js'
import { CUR } from './cur.js'
import { DDS } from './dds.js'
import { GIF } from './gif.js'
import { HEIF } from './heif.js'
import { ICNS } from './icns.js'
import { ICO } from './ico.js'
import { J2C } from './j2c.js'
import { JP2 } from './jp2.js'
import { JPG } from './jpg.js'
import { KTX } from './ktx.js'
import { PNG } from './png.js'
import { PNM } from './pnm.js'
import { PSD } from './psd.js'
import { SVG } from './svg.js'
import { TGA } from './tga.js'
import { TIFF } from './tiff.js'
import { WEBP } from './webp.js'

export const typeHandlers = new Map([
  ['bmp', BMP],
  ['cur', CUR],
  ['dds', DDS],
  ['gif', GIF],
  ['heif', HEIF],
  ['icns', ICNS],
  ['ico', ICO],
  ['j2c', J2C],
  ['jp2', JP2],
  ['jpg', JPG],
  ['ktx', KTX],
  ['png', PNG],
  ['pnm', PNM],
  ['psd', PSD],
  ['svg', SVG],
  ['tga', TGA],
  ['tiff', TIFF],
  ['webp', WEBP],
] as const)


export const types = Array.from(typeHandlers.keys())
export type imageType = typeof types[number]
