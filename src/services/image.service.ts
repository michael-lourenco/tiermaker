/**
 * Image Service
 * Handles image upload and processing
 */
export class ImageService {
  /**
   * Upload image to S3 via server-side API
   */
  async uploadImage(file: File): Promise<string> {
    // Create FormData to send file
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload image')
    }

    const { url } = await response.json()

    if (!url) {
      throw new Error('Failed to get image URL from upload API')
    }
    
    return url
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.',
      }
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      }
    }

    return { valid: true }
  }

  /**
   * Create image preview URL
   */
  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to create preview'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

