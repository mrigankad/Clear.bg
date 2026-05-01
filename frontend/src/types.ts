export type ItemStatus = 'pending' | 'processing' | 'done' | 'error'

export interface ImageItem {
  id: string
  file: File
  originalUrl: string
  resultBlob: Blob | null
  resultUrl: string | null
  status: ItemStatus
  error?: string
  processTime?: number
  dimensions?: { w: number; h: number }
  progress?: number           // 0–100 during processing
  order?: number              // for drag-to-reorder
}

export type BgType = 'transparent' | 'color' | 'custom'

export interface BgState {
  type: BgType
  color: string | null
  file: File | null
}

export type OutputFormat = 'png' | 'webp'

export type ViewMode = 'split' | 'original' | 'result'

export interface ColorAdjust {
  brightness: number   // 0–200, 100 = normal
  contrast: number     // 0–200, 100 = normal
  saturation: number   // 0–200, 100 = normal
}

export interface Settings {
  model: string
  alphaMatting: boolean
  format: OutputFormat
  feather: number
  smartCrop: boolean
  colorAdjust: ColorAdjust
}
