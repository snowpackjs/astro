export type ISize = {
  width: number | undefined
  height: number | undefined
  orientation?: number
  type?: string
}

export type ISizeCalculationResult = {
  images?: ISize[]
} & ISize

export type IImage = {
  validate: (input: Uint8Array) => boolean
  calculate: (input: Uint8Array) => ISizeCalculationResult
}
