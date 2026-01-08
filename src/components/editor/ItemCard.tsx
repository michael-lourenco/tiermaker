'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import type { TemplateItem } from '@/types/template.types'

interface ItemCardProps {
  item: TemplateItem
  showItemName?: boolean
}

// Altura fixa: menor no mobile, maior no desktop
const FIXED_HEIGHT_MOBILE = 70
const FIXED_HEIGHT_DESKTOP = 100

// Componente memoizado para evitar re-renders desnecessários
export const ItemCard = memo(function ItemCard({ item, showItemName = false }: ItemCardProps) {
  const [containerWidth, setContainerWidth] = useState<number>(FIXED_HEIGHT_DESKTOP) // Default to desktop
  const [fixedHeight, setFixedHeight] = useState<number>(FIXED_HEIGHT_DESKTOP)

  // Detectar se é mobile - memoizado para evitar recalcular
  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 640 // sm breakpoint
      const height = isMobile ? FIXED_HEIGHT_MOBILE : FIXED_HEIGHT_DESKTOP
      setFixedHeight((prev) => {
        if (prev !== height) return height
        return prev
      })
    }
    
    updateHeight()
    // Debounce resize para evitar muitas atualizações
    let timeoutId: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateHeight, 150)
    }
    
    window.addEventListener('resize', debouncedResize)
    return () => {
      window.removeEventListener('resize', debouncedResize)
      clearTimeout(timeoutId)
    }
  }, [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  // Load image to get natural dimensions - apenas quando necessário
  useEffect(() => {
    // Se já temos a largura calculada e não mudou, não precisa recalcular
    if (containerWidth !== FIXED_HEIGHT_DESKTOP) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      
      // Calculate width based on fixed height and image aspect ratio
      const aspectRatio = width / height
      const calculatedWidth = fixedHeight * aspectRatio
      setContainerWidth(calculatedWidth)
    }
    img.onerror = () => {
      // Fallback to square if image fails to load
      setContainerWidth(fixedHeight)
    }
    img.src = item.image_url
  }, [item.image_url, fixedHeight, containerWidth])

  // Memoiza o style para evitar recriar objeto a cada render
  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: `${containerWidth}px`,
    height: `${fixedHeight}px`,
    touchAction: 'none' as const, // Previne scroll durante drag no mobile
  }), [transform, transition, isDragging, containerWidth, fixedHeight])

  // Memoiza as props de drag para evitar recriar objetos
  const dragProps = useMemo(() => ({
    ...attributes,
    ...listeners,
  }), [attributes, listeners])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className="relative flex-shrink-0 rounded-lg overflow-hidden border cursor-grab active:cursor-grabbing hover:shadow-lg transition-shadow touch-manipulation"
    >
      <Image
        src={item.image_url}
        alt={item.name}
        width={containerWidth}
        height={fixedHeight}
        className="object-contain w-full h-full"
        loading="lazy" // Lazy loading nativo do Next.js
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      {showItemName && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white p-1 sm:p-2 text-[10px] sm:text-xs text-center line-clamp-1">
          {item.name}
        </div>
      )}
    </div>
  )
}, (prevProps, nextProps) => {
  // Comparação customizada para memo - só re-renderiza se props importantes mudaram
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.image_url === nextProps.item.image_url &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.showItemName === nextProps.showItemName
  )
})

