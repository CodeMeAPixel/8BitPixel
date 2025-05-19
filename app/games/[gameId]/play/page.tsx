import { getGameById } from "@/lib/games"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { GamePlayClient } from "@/components/game-play-client"

interface GamePlayPageProps {
  params: {
    gameId: string
  }
}

export default async function GamePlayPage({ params }: GamePlayPageProps) {
  const game = await getGameById(params.gameId)

  if (!game) {
    notFound()
  }
  
  return <GamePlayClient game={game} />
}
