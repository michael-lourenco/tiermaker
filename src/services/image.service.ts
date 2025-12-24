/**
 * Image Service
 * Handles image upload and processing
 */
export class ImageService {
  /**
   * Upload image to S3 via presigned URL
   */
  async uploadImage(file: File): Promise<string> {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get upload URL')
    }

    const { presignedUrl, key, url } = await response.json()

    // Upload file to S3
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload image')
    }

    // Return the public URL from the API response
    // The API constructs the URL automatically from bucket name and region
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

