# 8BitPixel Arcade

8BitPixel Arcade is a modern web platform for retro-style pixel art games, built with Next.js, TypeScript, and our custom game engine 8BitGE. The platform features a growing collection of games designed to be playable across desktop and mobile devices.

![8BitPixel Arcade](./public/images/8bitpixel-banner.png)

## Features

- 🎮 **Multiple Game Types**: Native games built directly into the platform and integrations with external games
- 🎲 **Custom Game Engine**: 8BitGE (8BitPixel Game Engine) provides powerful tools for building pixel-perfect games
- 📱 **Cross-Platform**: All games are responsive and work on desktop and mobile devices
- 🏆 **Achievements & Leaderboards**: Track your progress and compete with other players
- 🌈 **Pixel Art Aesthetic**: Consistent retro visual style across the platform
- ⚡ **Modern Tech**: Fast, responsive, and built with cutting-edge web technologies

## Games Collection

### Native Games

These games run directly in your browser and are built specifically for the 8BitPixel platform:

#### Word Isles
Connect islands to form letter pairs that appear in the target word. Features an increasing difficulty curve with progressively longer words and time limits.

#### Cat Mazes
Guide a cat through procedurally generated mazes. Collect fish treats and find the exit door to progress to increasingly complex levels.

#### Break the Ice
A strategic puzzle game where you break ice blocks of varying thickness. Create combos and use power-ups to maximize your score within limited moves.

#### Emoji Grid
Create meaningful emoji sequences by connecting related emoji patterns. Find combos and build chains to score points before time runs out.

#### Cyber Pong
A futuristic twist on the classic pong game, featuring neon graphics, particle effects, and progressively challenging AI.

### 8BitGE-Powered Games

The following games utilize our custom 8BitPixel Game Engine (8BitGE) for enhanced performance, particles, physics, and more:

- Cyber Pong
- (More coming soon!)

## Technology Stack

- **Frontend**: Next.js 13+, React, TypeScript
- **Styling**: Tailwind CSS
- **Game Engine**: Custom 8BitGE engine built in TypeScript
- **Animation**: Custom animation system with sprite support
- **State Management**: React hooks and context
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/codemeapixel/8bitpixel.git
   cd 8bitpixel
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Game Development

### Creating a New Game

To create a new game for the platform:

1. Create a new component in `components/games/your-game.tsx`
2. Register the game in `lib/games.ts`
3. Add game metadata and description
4. Implement the game logic and UI

### Using 8BitGE

To use our custom game engine:

1. Import the engine components:
   ```typescript
   import { createGame, GameStatus, ParticleBlendMode } from '@/8bitge'
   ```

2. Initialize the engine:
   ```typescript
   const engine = createGame({
     gameId: 'your-game-id',
     element: containerRef.current,
     width: 800,
     height: 600,
     pixelPerfect: true
   });
   ```

3. Set up event listeners and rendering:
   ```typescript
   engine.on('update', ({ deltaTime }) => {
     // Update game logic
   });
   
   engine.on('render', ({ context }) => {
     // Draw your game
   });
   ```

## Project Structure

- `/8bitge/` - Custom game engine
- `/app/` - Next.js app router pages
- `/components/` - React components
- `/components/games/` - Individual game implementations
- `/lib/` - Utility functions and game registry
- `/public/` - Static assets

## Contributing

We welcome contributions to 8BitPixel Arcade! Whether you want to fix bugs, improve features, or add new games, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-game`)
3. Make your changes
4. Run tests and ensure everything works
5. Commit your changes (`git commit -m 'Add amazing game'`)
6. Push to your branch (`git push origin feature/amazing-game`)
7. Open a Pull Request

## Future Plans

See our [FuturePlans.md](./FuturePlans.md) for upcoming features and improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgements

- All game developers and contributors
- Open-source projects that made this platform possible
- The retro gaming community for inspiration