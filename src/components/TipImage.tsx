'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Lightbulb } from 'lucide-react'

interface TipImageProps {
  src?: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  width?: number
  height?: number
  fallbackIcon?: React.ReactNode
}

export default function TipImage({
  src,
  alt,
  className = '',
  fill = false,
  sizes,
  priority = false,
  width,
  height,
  fallbackIcon = <Lightbulb className="h-12 w-12 text-green-600" />
}: TipImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  // Si pas d'image ou erreur de chargement, afficher le placeholder
  if (!src || imageError) {
    return (
      <div className={`bg-theme-tertiary flex items-center justify-center ${className}`}>
        {fallbackIcon}
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        className={`object-cover object-center transition-opacity duration-300 ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true)
          setImageLoading(false)
        }}
      />
      {imageLoading && (
        <div className="absolute inset-0 bg-theme-tertiary flex items-center justify-center">
          {fallbackIcon}
        </div>
      )}
    </div>
  )
}
