import { useState, useEffect, useRef } from 'react'

/**
 * Hook para lazy loading de imagens usando IntersectionObserver
 * Melhora performance ao carregar apenas imagens visíveis na viewport
 */
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Se já carregou, não precisa observar novamente
    if (isLoaded || error) return

    const img = imgRef.current
    if (!img) return

    // Configurações padrão do IntersectionObserver
    const defaultOptions: IntersectionObserverInit = {
      rootMargin: '50px', // Carrega 50px antes de entrar na viewport
      threshold: 0.01,
      ...options,
    }

    // Cria o observer
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observerRef.current?.unobserve(img)
        }
      })
    }, defaultOptions)

    observerRef.current.observe(img)

    return () => {
      if (observerRef.current && img) {
        observerRef.current.unobserve(img)
      }
    }
  }, [src, isLoaded, error, options])

  // Monitora quando a imagem carrega
  useEffect(() => {
    if (!imageSrc) return

    const img = new Image()
    img.src = imageSrc

    img.onload = () => {
      setIsLoaded(true)
      setError(false)
    }

    img.onerror = () => {
      setError(true)
      setIsLoaded(false)
    }
  }, [imageSrc])

  return {
    imgRef,
    imageSrc,
    isLoaded,
    error,
  }
}
