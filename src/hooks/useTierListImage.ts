/**
 * Hook for generating tier list images using html2canvas
 */

'use client'

import { useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import html2canvas from 'html2canvas'

interface UseTierListImageOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
  quality?: 'standard' | '4k'
}

/**
 * Load an image from URL
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Get computed background color from CSS variable or body element
 */
function getBackgroundColor(): string {
  if (typeof window === 'undefined') return '#ffffff'
  
  try {
    // Try to get background color from body element (most reliable)
    const bodyStyle = getComputedStyle(document.body)
    const bgColor = bodyStyle.backgroundColor
    
    // If we got a valid color (not transparent), use it
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
      return bgColor
    }
    
    // Fallback: get from CSS variable
    const root = document.documentElement
    const bgValue = getComputedStyle(root).getPropertyValue('--background').trim()
    
    if (bgValue) {
      // Parse HSL format: "222.2 84% 4.9%" or "0 0% 100%"
      const hslMatch = bgValue.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/)
      if (hslMatch) {
        const h = parseFloat(hslMatch[1])
        const s = parseFloat(hslMatch[2]) / 100
        const l = parseFloat(hslMatch[3]) / 100
        
        // Convert HSL to RGB
        const c = (1 - Math.abs(2 * l - 1)) * s
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
        const m = l - c / 2
        
        let r = 0, g = 0, b = 0
        
        if (h >= 0 && h < 60) {
          r = c; g = x; b = 0
        } else if (h >= 60 && h < 120) {
          r = x; g = c; b = 0
        } else if (h >= 120 && h < 180) {
          r = 0; g = c; b = x
        } else if (h >= 180 && h < 240) {
          r = 0; g = x; b = c
        } else if (h >= 240 && h < 300) {
          r = x; g = 0; b = c
        } else if (h >= 300 && h < 360) {
          r = c; g = 0; b = x
        }
        
        r = Math.round((r + m) * 255)
        g = Math.round((g + m) * 255)
        b = Math.round((b + m) * 255)
        
        return `rgb(${r}, ${g}, ${b})`
      }
    }
  } catch (error) {
    // Erro ao obter cor de fundo - silencioso
  }
  
  // Final fallback based on theme
  const isDark = document.documentElement.classList.contains('dark')
  return isDark ? '#0a0a0a' : '#ffffff'
}

export function useTierListImage(options?: UseTierListImageOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { theme } = useTheme()

  const generateImage = useCallback(
    async (element: HTMLElement, filename: string = 'tier-list.png') => {
      if (!element) {
        options?.onError?.(new Error('Element not found'))
        return
      }

      setIsGenerating(true)

      try {
        const quality = options?.quality ?? '4k'
        
        // Escala baseada na qualidade (2 para standard/1080p, 4 para 4K)
        const scale = quality === '4k' ? 4 : 2

        // Wait for all images to load completely
        const images = element.querySelectorAll('img')
        const imagePromises = Array.from(images).map((img) => {
          // Check if image is already loaded with valid dimensions
          if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
            return Promise.resolve(undefined)
          }
          
          return new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
              resolve() // Resolve after timeout even if image didn't load
            }, 15000) // Increased timeout to 15 seconds
            
            const onLoad = () => {
              // Verify image has dimensions
              if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                clearTimeout(timeout)
                resolve()
              }
            }
            
            const onError = () => {
              clearTimeout(timeout)
              resolve() // Continue even if some images fail
            }
            
            img.onload = onLoad
            img.onerror = onError
            
            // Force image to load if it hasn't started
            if (img.src && !img.complete) {
              // Trigger reload to ensure image loads
              const src = img.src
              img.src = ''
              img.src = src
            }
          })
        })

        await Promise.all(imagePromises)

        // Additional delay to ensure all rendering is complete
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Force desktop layout for consistent image generation
        // Temporarily set min-width to ensure desktop layout
        const originalMinWidth = element.style.minWidth
        const originalWidth = element.style.width
        element.style.minWidth = '1024px' // Force desktop minimum width
        element.style.width = 'auto'

        // Small delay to allow layout to adjust
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Get background color from current theme
        const backgroundColor = getBackgroundColor()

        // Get the actual content dimensions (scrollWidth/scrollHeight includes padding but not margins)
        const scrollWidth = element.scrollWidth
        const scrollHeight = element.scrollHeight

        // Configure html2canvas options for better quality and correct proportions
        const canvas = await html2canvas(element, {
          backgroundColor: backgroundColor,
          scale: scale, // 2 para 1080p, 4 para 4K
          useCORS: true,
          logging: false,
          allowTaint: true, // Allow taint for better image rendering
          foreignObjectRendering: false,
          imageTimeout: 30000, // Increase timeout for images
          width: scrollWidth,
          height: scrollHeight,
          removeContainer: false,
          onclone: (clonedDoc, clonedElement) => {
            // Force desktop layout in cloned document
            clonedElement.style.minWidth = '1024px'
            clonedElement.style.width = 'auto'
          },
        })
        
        // Restore original styles after capture
        element.style.minWidth = originalMinWidth || ''
        element.style.width = originalWidth || ''

        // Adicionar logo/marca d'água sempre (para todos os usuários)
        // O logo identifica a origem da imagem
        const logoIcon = await loadImage('/logo.png')
        const logoText = await loadImage(
          theme === 'dark' ? '/logo_texto_white.png' : '/logo_texto_black.png'
        )

        // Calculate logo dimensions (scaled)
        const logoIconHeight = 40 * scale
        const logoIconWidth = (logoIcon.width / logoIcon.height) * logoIconHeight
        const logoTextHeight = 32 * scale
        const logoTextWidth = (logoText.width / logoText.height) * logoTextHeight

        // Calculate padding for logo area
        const padding = 20 * scale
        const logoAreaHeight = padding + logoIconHeight + padding

        // Create new canvas with space for logo
        const finalCanvas = document.createElement('canvas')
        finalCanvas.width = canvas.width
        finalCanvas.height = canvas.height + logoAreaHeight
        const ctx = finalCanvas.getContext('2d')

        if (!ctx) {
          options?.onError?.(new Error('Failed to get canvas context'))
          setIsGenerating(false)
          return
        }

        // Fill background
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

        // Draw logo area (centered)
        const logoX = (finalCanvas.width - (logoIconWidth + padding + logoTextWidth)) / 2
        const logoY = padding

        // Draw logo icon
        ctx.drawImage(logoIcon, logoX, logoY, logoIconWidth, logoIconHeight)

        // Draw logo text next to icon
        ctx.drawImage(logoText, logoX + logoIconWidth + padding, logoY + (logoIconHeight - logoTextHeight) / 2, logoTextWidth, logoTextHeight)

        // Draw the tier list canvas below the logo
        ctx.drawImage(canvas, 0, logoAreaHeight)

        // Convert final canvas to blob
        finalCanvas.toBlob(
          (blob) => {
            if (!blob) {
              options?.onError?.(new Error('Failed to generate image blob'))
              setIsGenerating(false)
              return
            }

            // Create download link
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            setIsGenerating(false)
            options?.onSuccess?.()
          },
          'image/png',
          1.0
        )
      } catch (error) {
        setIsGenerating(false)
        options?.onError?.(error as Error)
      }
    },
    [options, theme]
  )

  return {
    generateImage,
    isGenerating,
  }
}

