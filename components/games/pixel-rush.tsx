"use client"

import { useState, useEffect, useRef } from 'react'
import { createGame, GameStatus, ParticleBlendMode } from '@/8bitge'

export function PixelRushGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [playerPosition, setPlayerPosition] = useState(2) // Position on a scale of 0-4 (5 lanes)
  const [obstacles, setObstacles] = useState<{lane: number, y: number, type: string, collected: boolean}[]>([])
  const [showRules, setShowRules] = useState(true)
  const [speed, setSpeed] = useState(5) // Game speed
  
  const gameRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  const gameEngineRef = useRef<any>(null)
  
  // Game items and their properties
  const items = {
    obstacle: { emoji: '🌵', points: 0 }, 
    coin: { emoji: '⭐', points: 10 },
    powerup: { emoji: '🌟', points: 25 },
    danger: { emoji: '🔥', points: 0 }
  }
  
  // Initialize game engine
  useEffect(() => {
    if (gameRef.current && gameStarted && !gameOver) {
      // Initialize game engine
      const engine = createGame({
        gameId: 'pixel-rush',
        element: gameRef.current,
        width: 500,
        height: 600,
        pixelPerfect: true,
        fps: 60,
        responsive: true
      });
      
      gameEngineRef.current = engine;
      
      // Set up game events
      engine.on('update', ({ deltaTime }) => {
        // Game update logic is handled in our own update function
      });
      
      engine.on('render', ({ context }) => {
        if (!context) return;
        
        // Clear the canvas
        context.fillStyle = '#000';
        context.fillRect(0, 0, engine.getConfig().width, engine.getConfig().height);
        
        // Render game elements
        renderGame(context);
      });
      
      // Start the engine
      engine.start();
      
      // Reset state
      setPlayerPosition(2);
      setObstacles([]);
      setScore(0);
      setSpeed(5);
      startGameLoop();
      
      // Cleanup
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        if (gameEngineRef.current) {
          // Clean up engine
          gameEngineRef.current = null;
        }
      }
    }
  }, [gameStarted, gameOver]);
  
  // Game loop
  const startGameLoop = () => {
    lastFrameTimeRef.current = performance.now()
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentTime
      
      // Handle obstacle movement and collision detection
      updateGameState(deltaTime)
      
      // Continue loop if game is still active
      if (gameStarted && !gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop)
      }
    }
    
    // Start the loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }
  
  // Update game state every frame
  const updateGameState = (deltaTime: number) => {
    // Move obstacles down
    const updatedObstacles = obstacles.map(obstacle => ({
      ...obstacle,
      y: obstacle.y + speed * (deltaTime / 100)
    }))
    
    // Add new obstacles occasionally
    if (Math.random() < 0.03) {
      const lane = Math.floor(Math.random() * 5)
      const type = Math.random() < 0.7 ? 'obstacle' : 
                  Math.random() < 0.85 ? 'coin' : 
                  Math.random() < 0.95 ? 'powerup' : 'danger'
      
      updatedObstacles.push({
        lane,
        y: -10, // Start above the visible area
        type,
        collected: false
      })
    }
    
    // Check for collisions and remove offscreen obstacles
    const playerLane = playerPosition
    const newObstacles = []
    let scoreIncrement = 0
    let hitObstacle = false
    
    for (const obstacle of updatedObstacles) {
      // Obstacles in the visible game area
      if (obstacle.y < 100) {
        // Check for collision with player
        if (obstacle.y > 75 && obstacle.y < 95 && obstacle.lane === playerLane && !obstacle.collected) {
          // Handle different types of collisions
          if (obstacle.type === 'obstacle' || obstacle.type === 'danger') {
            hitObstacle = true
          } else {
            // Collect coins and powerups
            obstacle.collected = true
            scoreIncrement += items[obstacle.type as keyof typeof items].points
            
            // If powerup, increase speed slightly
            if (obstacle.type === 'powerup') {
              setSpeed(prev => Math.min(prev + 0.5, 12))
            }
          }
        }
        
        if (!obstacle.collected) {
          newObstacles.push(obstacle)
        }
      }
    }
    
    // Update score
    if (scoreIncrement > 0) {
      setScore(prev => prev + scoreIncrement)
    }
    
    // End game if obstacle hit
    if (hitObstacle) {
      endGame()
    } else {
      setObstacles(newObstacles)
    }
    
    // Add particle effects when collecting items
    if (scoreIncrement > 0 && gameEngineRef.current) {
      const engine = gameEngineRef.current;
      
      // Create sparkles for coin collection
      engine.particles.createEmitterFromPreset('collect', 'sparkles', {
        position: { 
          x: engine.getConfig().width * (playerLane / 5),
          y: engine.getConfig().height * 0.85
        },
        color: scoreIncrement >= 25 ? '#ffff00' : '#ffffff',
        scale: scoreIncrement >= 25 ? 1.5 : 1
      });
    }
  }
  
  // End game and update high score if needed
  const endGame = () => {
    setGameOver(true);
    setHighScore(prev => Math.max(prev, score));
    
    // Add explosion effect
    if (gameEngineRef.current) {
      const engine = gameEngineRef.current;
      engine.particles.createEmitterFromPreset('gameover', 'explosion', {
        position: { 
          x: engine.getConfig().width * (playerPosition / 5),
          y: engine.getConfig().height * 0.85
        },
        color: ['#ff5500', '#ffcc00'],
        scale: 2
      });
    }
  }
  
  // Handle controls - now using engine inputs when available
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!gameStarted || gameOver) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        setPlayerPosition(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowRight':
        setPlayerPosition(prev => Math.min(4, prev + 1));
        break;
    }
  }
  
  // Move player left or right
  const movePlayer = (direction: 'left' | 'right') => {
    if (!gameStarted || gameOver) return;
    
    if (direction === 'left') {
      setPlayerPosition(prev => Math.max(0, prev - 1));
    } else {
      setPlayerPosition(prev => Math.min(4, prev + 1));
    }
  }
  
  // Render game elements to canvas
  const renderGame = (ctx: CanvasRenderingContext2D) => {
    if (!gameEngineRef.current) return;
    
    const engine = gameEngineRef.current;
    const width = engine.getConfig().width;
    const height = engine.getConfig().height;
    
    // Draw road
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, width, height);
    
    // Draw lane markers
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    
    for (let i = 1; i < 5; i++) {
      const x = (width / 5) * i;
      ctx.beginPath();
      ctx.setLineDash([20, 20]);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw player
    const playerX = (width / 5) * (playerPosition + 0.5);
    ctx.fillStyle = '#ff5500';
    ctx.beginPath();
    ctx.moveTo(playerX, height * 0.85);
    ctx.lineTo(playerX - 15, height * 0.9);
    ctx.lineTo(playerX + 15, height * 0.9);
    ctx.closePath();
    ctx.fill();
    
    // Draw obstacles/items
    obstacles.forEach(obstacle => {
      const x = (width / 5) * (obstacle.lane + 0.5);
      const y = obstacle.y * (height / 100);
      
      // Draw appropriate emoji for item type
      const itemType = obstacle.type as keyof typeof items;
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(items[itemType].emoji, x, y);
    });
    
    // Draw score
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 20, 30);
  }
  
  // Start new game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setShowRules(false);
  }
  
  // Game instructions
  const renderRules = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">Pixel Rush</h2>
      <p className="mb-6 text-center">Race against time in this fast-paced pixel adventure. Avoid obstacles and collect power-ups!</p>
      
      <button
        onClick={startGame}
        className="w-full py-3 px-6 mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
      >
        Start Game
      </button>
      
      <div className="space-y-4 text-sm">
        <h3 className="font-bold">How To Play:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use left and right arrow keys to move between lanes</li>
          <li>Avoid obstacles like cacti (🌵) and fire (🔥)</li>
          <li>Collect stars (⭐) for 10 points each</li>
          <li>Collect power stars (🌟) for 25 points and speed boost</li>
          <li>Game ends when you hit an obstacle</li>
        </ul>
        
        <div className="mt-4 bg-black/20 p-4 rounded-lg">
          <h4 className="font-bold mb-2">Tip:</h4>
          <p className="text-xs">The game gets faster as you collect power-ups. Time your moves carefully!</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
      {!gameStarted ? (
        // Show game rules and start screen
        renderRules()
      ) : (
        <>
          {/* Game area - using canvas for rendering */}
          <div 
            ref={gameRef}
            className="relative bg-gray-950 border border-gray-800 rounded-lg w-full max-w-md aspect-[5/6] overflow-hidden"
            tabIndex={0} 
            onKeyDown={handleKeyDown}
          >
            {/* Game over message */}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
                <div className="text-center p-6 bg-gray-800/80 rounded-lg">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">Game Over!</h3>
                  <p className="text-white mb-1">Final Score: {score}</p>
                  <p className="text-white mb-4">High Score: {highScore}</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startGame}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-md"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => setShowRules(true)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                    >
                      How to Play
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile controls */}
          <div className="mt-4 grid grid-cols-2 gap-8 w-full max-w-md">
            <button 
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-white text-2xl"
              onClick={() => movePlayer('left')}
            >
              ◀ Left
            </button>
            <button 
              className="bg-white/10 hover:bg-white/20 rounded-lg p-4 text-white text-2xl"
              onClick={() => movePlayer('right')}
            >
              Right ▶
            </button>
          </div>
        </>
      )}
    </div>
  )
}
