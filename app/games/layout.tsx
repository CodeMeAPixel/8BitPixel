import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Game Hub | 8BitPixel Arcade",
  description: "Browse our curated collection of pixel-perfect games at 8BitPixel Arcade.",
}

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
