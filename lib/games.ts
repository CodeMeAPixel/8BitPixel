/**
 * Games library for 8BitPixel Arcade
 * Handles game registration, retrieval, and metadata
 */

// Game type definitions
export interface GameRule {
  title: string;
  description: string;
}

export interface GameInstruction {
  text: string;
  icon?: string;
}

export interface GameElementType {
  symbol: string;
  name: string;
  description: string;
  appearance?: string;
}

export interface GameData {
  title: string;
  shortDescription: string;
  longDescription: string;
  howToPlay: string[];
  rules: GameRule[];
  instructions: GameInstruction[];
  elements?: GameElementType[];
  controls?: {
    keyboard?: string[];
    touch?: string[];
    gamepad?: string[];
  };
  tips?: string[];
  version?: string;
  creator?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Variable';
  maxScore?: number | 'Unlimited';
  timeLimit?: number | null;
  levelProgression?: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  featured: boolean;
  dateAdded?: string;
  hasComponent: boolean;
  usesGameEngine?: boolean;
  externalUrl?: string;
  data?: GameData;
}

// Game data definitions
export const gamesData: Record<string, GameData> = {
  "word-isles": {
    title: "Word Isles",
    shortDescription: "Connect islands to form words",
    longDescription: "In Word Isles, your goal is to connect islands with letters to form words. Each island has a letter, and you need to create bridges between them to spell out target words.",
    howToPlay: [
      "Click on islands to select them",
      "Connect two islands to form a bridge",
      "Try to find all letter pairs in the target word",
      "Complete the level before time runs out"
    ],
    rules: [
      { 
        title: "Island Selection",
        description: "Click on any island to select it. Click on another island to create a bridge between them."
      },
      { 
        title: "Bridge Formation", 
        description: "Bridges can only be formed between adjacent islands. The letter pair formed must be part of the target word."
      },
      { 
        title: "Scoring", 
        description: "Correct bridges earn 10 points × your current level. Incorrect bridges cost 5 points."
      },
      { 
        title: "Level Completion", 
        description: "Complete a level by finding all letter pairs in the target word. Level completion grants 50 points × current level."
      }
    ],
    instructions: [
      { text: "Click or tap on islands to select them" },
      { text: "Form bridges between islands that create letter pairs in the target word" },
      { text: "Complete the level within the time limit" }
    ],
    elements: [
      { symbol: "🏝️", name: "Island", description: "Contains a letter that can be connected to other islands" },
      { symbol: "➖", name: "Bridge", description: "Connection between two islands forming a letter pair" }
    ],
    difficulty: "Medium"
  },
  "cat-mazes": {
    title: "Cat Mazes",
    shortDescription: "Help the cat navigate through maze puzzles",
    longDescription: "Guide a playful cat through increasingly complex mazes. Collect fish treats along the way and find the exit door to progress to the next level.",
    howToPlay: [
      "Use arrow keys or swipe to move the cat",
      "Collect fish treats for extra points",
      "Find the door to exit each level",
      "The mazes get bigger and more complex as you progress"
    ],
    rules: [
      { 
        title: "Movement", 
        description: "Move one step at a time in four directions: up, down, left, and right." 
      },
      { 
        title: "Walls", 
        description: "Brick walls block your path and cannot be passed through." 
      },
      { 
        title: "Treats", 
        description: "Collect fish treats for bonus points and achievements." 
      },
      { 
        title: "Exiting", 
        description: "Reach the door to complete the level and advance to the next one." 
      }
    ],
    instructions: [
      { text: "Use arrow keys or swipe to move" },
      { text: "Collect fish treats" },
      { text: "Find the exit door to complete the level" }
    ],
    elements: [
      { symbol: "😺", name: "Cat", description: "Your playable character" },
      { symbol: "🧱", name: "Wall", description: "Obstacle that blocks your path" },
      { symbol: "🐟", name: "Fish", description: "Collectible treat that gives points" },
      { symbol: "🚪", name: "Door", description: "Level exit that takes you to the next maze" }
    ],
    controls: {
      keyboard: ["Arrow keys to move in four directions"],
      touch: ["Swipe in the direction you want to move", "Use on-screen buttons"]
    },
    difficulty: "Easy"
  },
  "break-the-ice": {
    title: "Break the Ice",
    shortDescription: "Break ice blocks in this strategic puzzle game",
    longDescription: "Break the Ice is a strategic puzzle game where you need to break all the ice blocks on the grid. Different blocks require different numbers of clicks to break, and you have a limited number of moves per level.",
    howToPlay: [
      "Click on ice blocks to break them",
      "Thicker ice takes multiple clicks to break",
      "Blue ice blocks (🧊) are unbreakable",
      "Fire blocks (🔥) break surrounding ice",
      "Complete each level by breaking all breakable ice",
      "You have limited moves per level"
    ],
    rules: [
      { 
        title: "Breaking Ice", 
        description: "Click on ice blocks to break them. Thicker ice requires multiple clicks." 
      },
      { 
        title: "Unbreakable Blocks", 
        description: "Blue ice blocks cannot be broken and serve as obstacles." 
      },
      { 
        title: "Power-ups", 
        description: "Fire blocks break all surrounding ice blocks when clicked." 
      },
      { 
        title: "Move Limit", 
        description: "You have a limited number of moves to complete each level." 
      },
      { 
        title: "Combos", 
        description: "Breaking blocks in quick succession builds a combo multiplier for bonus points." 
      }
    ],
    instructions: [
      { text: "Click or tap ice blocks to break them" },
      { text: "Create combos by breaking blocks quickly" },
      { text: "Use power-ups strategically" }
    ],
    elements: [
      { 
        symbol: "❄️", 
        name: "Thin Ice", 
        description: "Breaks with one click", 
        appearance: "Light blue" 
      },
      { 
        symbol: "❄️", 
        name: "Medium Ice", 
        description: "Breaks with two clicks", 
        appearance: "Medium blue" 
      },
      { 
        symbol: "❄️", 
        name: "Thick Ice", 
        description: "Breaks with three clicks", 
        appearance: "Dark blue" 
      },
      { 
        symbol: "🧊", 
        name: "Solid Ice", 
        description: "Unbreakable obstacle" 
      },
      { 
        symbol: "💧", 
        name: "Water", 
        description: "Broken ice" 
      },
      { 
        symbol: "🔥", 
        name: "Fire", 
        description: "Power-up that breaks surrounding blocks" 
      }
    ],
    difficulty: "Medium"
  },
  "emoji-grid": {
    title: "Emoji Grid",
    shortDescription: "Match related emoji patterns to score points",
    longDescription: "Emoji Grid challenges you to find related emoji patterns in a grid. Create sequences of connected emojis that make logical sense to earn points. Longer combinations and quicker matches earn bigger rewards!",
    howToPlay: [
      "Select connected emojis that are related to each other",
      "Form sequences of at least 3 related emojis",
      "Score points based on the length and relevance of combinations",
      "Complete as many matches as possible before time runs out"
    ],
    rules: [
      { 
        title: "Emoji Selection", 
        description: "Select emojis by clicking/tapping and dragging through connected emojis." 
      },
      { 
        title: "Valid Combinations", 
        description: "Emojis must be related by category or context to form a valid combination." 
      },
      { 
        title: "Minimum Length", 
        description: "Combinations must include at least 3 emojis to be valid." 
      },
      { 
        title: "Scoring", 
        description: "Score is based on the number of emojis in a combination, with bonuses for longer sequences." 
      }
    ],
    instructions: [
      { text: "Click/tap and drag to select connected emojis" },
      { text: "Create combinations of related emojis" },
      { text: "Submit your selection to score points" }
    ],
    elements: [
      { symbol: "😀", name: "Emoji", description: "Various emojis that can be combined in different ways" }
    ],
    tips: [
      "Look for emojis in the same category (e.g., all food items)",
      "Consider contextual relationships (e.g., rain + umbrella)",
      "Longer combinations score more points",
      "Plan your moves to create multiple combinations"
    ],
    difficulty: "Medium"
  }
};

// Games catalog
const gamesCatalog: Game[] = [
  {
    id: "word-isles",
    title: "Word Isles",
    description: "Connect islands to form words",
    imageUrl: "/games/word-isles.webp",
    category: "Word",
    featured: true,
    dateAdded: "2023-09-15",
    hasComponent: true,
    data: gamesData["word-isles"]
  },
  {
    id: "cat-mazes",
    title: "Cat Mazes",
    description: "Help the cat navigate through maze puzzles",
    imageUrl: "/games/cat-mazes.webp",
    category: "Puzzle",
    featured: true,
    dateAdded: "2023-09-15",
    hasComponent: true,
    data: gamesData["cat-mazes"]
  },
  {
    id: "break-the-ice",
    title: "Break the Ice",
    description: "Break ice blocks in this strategic puzzle game",
    imageUrl: "/games/break-the-ice.webp",
    category: "Strategy",
    featured: true,
    dateAdded: "2023-09-16",
    hasComponent: true,
    data: gamesData["break-the-ice"]
  },
  {
    id: "emoji-grid",
    title: "Emoji Grid",
    description: "Match related emoji patterns to score points",
    imageUrl: "/games/emoji-grid.webp",
    category: "Matching",
    featured: true,
    dateAdded: "2023-09-17",
    hasComponent: true,
    data: gamesData["emoji-grid"]
  },
  {
    id: "cyber-pong",
    title: "Cyber Pong",
    description: "Futuristic pong game with neon graphics and power-ups",
    imageUrl: "/games/cyber-pong.webp",
    category: "Arcade",
    featured: true,
    dateAdded: "2023-09-18",
    hasComponent: true,
    usesGameEngine: true,
    data: {
      title: "Cyber Pong",
      shortDescription: "Futuristic pong game with neon graphics",
      longDescription: "A cyberpunk twist on the classic pong game. Control your paddle to bounce the glowing ball past your opponent. Features particle effects, power-ups, and an increasing difficulty curve.",
      howToPlay: [
        "Move your paddle with mouse or touch to hit the ball",
        "Score by getting the ball past the computer's paddle",
        "Each level increases the difficulty",
        "The game ends if you miss the ball"
      ],
      rules: [
        { 
          title: "Paddle Control", 
          description: "Move your paddle horizontally to hit the ball back" 
        },
        { 
          title: "Scoring", 
          description: "Score points when the computer misses the ball" 
        },
        { 
          title: "Angle Control", 
          description: "The angle of the ball's bounce depends on where it hits your paddle" 
        },
        { 
          title: "Progressive Difficulty", 
          description: "The ball speed and computer AI improve as you level up" 
        }
      ],
      instructions: [
        { text: "Move mouse or drag finger to position your paddle" },
        { text: "Hit the ball at different angles by striking with different parts of your paddle" }
      ],
      controls: {
        mouse: ["Move mouse horizontally"],
        touch: ["Drag horizontally to move paddle"]
      },
      difficulty: "Variable"
    }
  }
  // Other games can be added here
];

// Get all games
export async function getAllGames(): Promise<Game[]> {
  return [...gamesCatalog];
}

// Get game by ID
export async function getGameById(id: string): Promise<Game | null> {
  // Use Array.find() instead of relying on implicit behavior
  const game = gamesCatalog.find(game => game.id === id);
  
  if (!game) {
    console.warn(`Game with ID "${id}" not found`);
    return null;
  }
  
  return game;
}

// Get featured games
export async function getFeaturedGames(limit: number = 4): Promise<Game[]> {
  return gamesCatalog
    .filter(game => game.featured)
    .slice(0, limit);
}

// Get game data by ID
export function getGameData(id: string): GameData | undefined {
  return gamesData[id];
}
