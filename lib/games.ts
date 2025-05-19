export interface Game {
  id: string
  title: string
  shortDescription: string
  description: string
  url: string
  category?: string
  featured?: boolean
  dateAdded?: string
  hasComponent?: boolean
}

const games: Game[] = [
  {
    id: "wordisles",
    title: "WordIsles",
    shortDescription: "Build bridges of words across floating islands.",
    description:
      "A strategic word adventure where every choice shapes your journey across floating isles of language.",
    url: "https://wordisles.com",
    category: "Word",
    featured: true,
    dateAdded: "2023-08-15",
    hasComponent: true,
  },  {
    id: "emojigrid",
    title: "Emoji Grid",
    shortDescription: "Match patterns and outsmart the colorful grid.",
    description: "A puzzle-strategy challenge using emoji-based logic and color matching to outsmart the grid.",
    url: "https://emojigrid.vercel.app",
    category: "Puzzle",
    featured: true,
    dateAdded: "2023-09-22",
    hasComponent: true,
  },  {
    id: "catmazes",
    title: "CatMazes",
    shortDescription: "Guide curious cats through tricky mazes.",
    description: "Guide curious cats through tricky mazes. Adorable visuals meet clever spatial puzzles.",
    url: "https://catmazes.vercel.app",
    category: "Strategy",
    featured: true,
    dateAdded: "2023-10-05",
    hasComponent: true,
  },  {
    id: "breaktheice",
    title: "Break the Ice",
    shortDescription: "Melt your way to mastery in this cool logic game.",
    description:
      "A cool logic game where you melt your way to mastery—layered challenges and hidden achievements await.",
    url: "https://icegame.vercel.app",
    category: "Puzzle",
    hasComponent: true,
    featured: true,
    dateAdded: "2023-11-12",
  },  {
    id: "pixelrush",
    title: "Pixel Rush",
    shortDescription: "Race against time in this fast-paced pixel adventure.",
    description:
      "Speed through colorful pixel landscapes, collecting power-ups and avoiding obstacles in this adrenaline-pumping arcade game.",
    url: "https://pixelrush.vercel.app",
    category: "Action",
    featured: false,
    dateAdded: "2024-01-10",
    hasComponent: true,
  },  {
    id: "cyberpong",
    title: "CyberPong",
    shortDescription: "Classic pong with a futuristic neon twist.",
    description:
      "Experience the classic game of Pong reimagined with stunning neon visuals and electronic beats in a cyberpunk setting.",
    url: "https://cyberpong.vercel.app",
    category: "Arcade",
    featured: false,
    dateAdded: "2024-02-14",
    hasComponent: true,
  },
  {
    id: "blockminer",
    title: "Block Miner",
    shortDescription: "Dig deep and discover rare treasures underground.",
    description:
      "Become a digital miner as you dig through layers of colorful blocks, discover hidden treasures, and upgrade your tools.",
    url: "https://blockminer.vercel.app",
    category: "Simulation",
    featured: false,
    dateAdded: "2024-03-05",
  },
  {
    id: "cosmicdefender",
    title: "Cosmic Defender",
    shortDescription: "Protect the galaxy from alien invaders.",
    description:
      "Command your spacecraft to defend Earth against waves of alien invaders in this retro-inspired space shooter.",
    url: "https://cosmicdefender.vercel.app",
    category: "Shooter",
    featured: false,
    dateAdded: "2024-04-20",
  },
]

export async function getAllGames(): Promise<Game[]> {
  return games
}

export async function getFeaturedGames(): Promise<Game[]> {
  return games.filter((game) => game.featured)
}

export async function getGameById(id: string): Promise<Game | undefined> {
  return games.find((game) => game.id === id)
}

export async function getGamesByCategory(category: string): Promise<Game[]> {
  return games.filter((game) => game.category === category)
}
