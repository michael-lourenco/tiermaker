/** Proporção canônica da capa (2560×1080). Qualquer resolução nesta razão é válida. */
export const COVER_ASPECT_WIDTH = 2560
export const COVER_ASPECT_HEIGHT = 1080
export const COVER_ASPECT_RATIO = COVER_ASPECT_WIDTH / COVER_ASPECT_HEIGHT

/** Classe Tailwind para preview/dropzone na proporção da capa */
export const COVER_ASPECT_CLASS = 'aspect-[2560/1080]'

/** Tolerância relativa (~1%) para arredondamento de pixels */
const RATIO_TOLERANCE = 0.01

export function isCoverAspectRatio(width: number, height: number): boolean {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return false
  }
  const ratio = width / height
  return Math.abs(ratio - COVER_ASPECT_RATIO) <= COVER_ASPECT_RATIO * RATIO_TOLERANCE
}

export function getImageFileDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to read image dimensions'))
    }
    img.src = objectUrl
  })
}

export async function assertCoverAspectRatio(file: File): Promise<void> {
  const { width, height } = await getImageFileDimensions(file)
  if (!isCoverAspectRatio(width, height)) {
    const err = new Error('COVER_ASPECT_INVALID')
    err.name = 'CoverAspectError'
    throw err
  }
}
