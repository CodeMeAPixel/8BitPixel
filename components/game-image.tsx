"use client"

import { useState } from "react"
import Image from "next/image"

interface GameImageProps {
  gameId: string
  gameTitle: string
}

export function GameImage({ gameId, gameTitle }: GameImageProps) {
  const [imgSrc, setImgSrc] = useState(`/screenshots/${gameId}.jpg`)

  return (
    <Image 
      src={imgSrc} 
      alt={`${gameTitle} screenshot`}
      fill
      className="object-cover"
      priority
      onError={() => setImgSrc('/placeholder.jpg')}
    />
  )
}
