# 8BitPixel Game Engine (8BitGE)

A lightweight, modern JavaScript/TypeScript game engine designed for creating retro-style games with modern web capabilities. Perfect for both desktop and mobile web browsers.

## Features

- **Cross-Platform Performance**: Runs smoothly on desktop and mobile browsers
- **Pixel-Perfect Rendering**: Clean, crisp pixel art display with scaling support
- **Responsive Design**: Automatically adjusts to different screen sizes and orientations
- **Input System**: Handles keyboard, mouse, touch, and virtual controllers
- **Audio System**: Comprehensive audio support with automatic mobile unlocking
- **Particle System**: Powerful particle effects with presets and customization
- **Achievement System**: Built-in achievements with progress tracking
- **Leaderboard System**: Online leaderboard integration
- **Persistence**: Game state saving and loading
- **Event System**: Flexible event-driven architecture
- **Mobile-Optimized**: Full touch support, orientation handling, virtual controls
- **Debug Tools**: Performance monitoring and debugging utilities

## Installation

```bash
npm install @8bitpixel/8bitge
```

Or use directly via CDN:

```html
<script src="https://cdn.8bitpixel.io/8bitge/latest/8bitge.min.js"></script>
```

## Quick Start

```typescript
import { createGame, GameStatus } from '@8bitpixel/8bitge';

// Create a new game
const game = createGame({
  gameId: 'my-awesome-game',
  element: 'game-container',
  width: 320,
  height: 240,
  pixelPerfect: true
});

// Add event listeners
game.on('gameStart', () => {
  console.log('Game started!');
});

// Define update logic
game.on('update', ({ deltaTime }) => {
  // Game logic here
  if (game.input.keyboard.ArrowRight) {
    // Move player right
  }
  
  // Create particle effects
  if (game.input.mouse.buttons.left) {
    game.particles.createEmitterFromPreset('click', 'sparkles', {
      position: game.input.mouse
    });
  }
});

// Define render logic
game.on('render', ({ context }) => {
  context.fillStyle = '#000';
  context.fillRect(0, 0, game.getConfig().width, game.getConfig().height);
  
  // Draw game elements here
});

// Start the game
game.start();
```

## Core Concepts

### Game Loop

The engine handles the game loop for you, providing consistent timing and rendering:

```typescript
game.on('update', ({ deltaTime }) => {
  // Update game state based on elapsed time
});

game.on('render', ({ context }) => {
  // Draw your game using the provided canvas context
});
```

### Entities

Easily create and manage game objects:

```typescript
const player = {
  type: 'player',
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: 0 },
  collider: { x: 0, y: 0, width: 32, height: 32 },
  update: (deltaTime) => {
    // Update logic
  },
  render: (context) => {
    // Rendering logic
  }
};

game.addEntity(player);
```

### Particle Effects

Create visual effects with the particle system:

```typescript
// Create an explosion effect
game.particles.createEmitterFromPreset('explosion1', 'explosion', {
  position: { x: 150, y: 150 },
  color: ['#ff0000', '#ffff00']
});

// Create custom particle effects
const emitter = game.particles.createEmitter('fire', {
  position: { x: 100, y: 100 },
  emissionRate: 20,
  particleOptions: {
    velocity: { x: 0, y: -50 },
    color: ['#ff4400', '#ff8800'],
    size: [10, 2],
    lifetime: 1000,
    fadeOut: true
  }
});
```

### Input Handling

Easily detect input from keyboard, mouse, and touch:

```typescript
game.on('update', () => {
  if (game.input.keyboard.Space) {
    // Jump!
  }
  
  if (game.input.mouse.buttons.left) {
    // Shoot at mouse position
    const target = {
      x: game.input.mouse.x,
      y: game.input.mouse.y
    };
  }
});
```

### Audio Playback

Play sounds and music with automatic mobile handling:

```typescript
// Load sounds
game.audio.load({
  jump: 'sounds/jump.mp3',
  music: 'sounds/background.mp3'
});

// Play sound effects
game.audio.play('jump');

// Play background music with looping
game.audio.play('music', { loop: true });
```

## Documentation

For complete documentation, visit our [Documentation Site](https://docs.8bitpixel.io).

## Examples

Check out these example games to see what's possible:

- [Space Shooter](https://examples.8bitpixel.io/space-shooter) - Classic arcade shooter
- [Platformer](https://examples.8bitpixel.io/platformer) - Side-scrolling platform game
- [RPG](https://examples.8bitpixel.io/rpg) - Simple role-playing game example
- [Puzzle Game](https://examples.8bitpixel.io/puzzle) - Match-three style puzzle game

## Future Plans

See our [Future Plans](./FuturePlans.md) document for upcoming features and improvements.

## Contributing

Contributions are welcome! Please check out our [Contribution Guidelines](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Support

Need help? Join our [Discord Server](https://discord.gg/8bitpixel) or open an [issue](https://github.com/codemeapixel/8bitge/issues).