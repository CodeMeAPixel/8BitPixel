import { WordIslesGame } from './word-isles'
import { EmojiGridGame } from './emoji-grid'
import { CatMazesGame } from './cat-mazes'
import { BreakTheIceGame } from './break-the-ice'
import { PixelRushGame } from './pixel-rush'
import { CyberPongGame } from './cyberpong'

// Game component registry
export const gameComponents = {
  wordisles: WordIslesGame,
  emojigrid: EmojiGridGame,
  catmazes: CatMazesGame,
  breaktheice: BreakTheIceGame,
  pixelrush: PixelRushGame,
  cyberpong: CyberPongGame,
}

// Type for game components
export type GameComponentRegistry = typeof gameComponents
export type GameId = keyof GameComponentRegistry
