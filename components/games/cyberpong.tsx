"use client"

import { useState, useEffect, useRef } from 'react'
import { createGame, GameStatus, ParticleBlendMode, Vector2D } from '@/8bitge'

export function CyberPongGame() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [showRules, setShowRules] = useState(true)
  
  // Game elements
  const [paddlePosition, setPaddlePosition] = useState(50) // Percentage from left
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 }) // Percentage coordinates
  const [ballDirection, setBallDirection] = useState({ x: 2, y: 3 }) // Movement per frame
  const [computerPaddlePosition, setComputerPaddlePosition] = useState(50)
  const [paddleSize, setPaddleSize] = useState(20) // Paddle width in percentage
  
  // Canvas and timing refs
  const gameCanvasRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  const gameEngineRef = useRef<any>(null)
  
  // Game settings
  const ballSpeed = 0.2 + (level * 0.05)
  const computerSpeed = 0.8 + (level * 0.1)
  
  // Initialize game engine and game state
  useEffect(() => {
    if (gameCanvasRef.current && gameStarted && !gameOver) {
      // Initialize game engine
      const engine = createGame({
        gameId: 'cyberpong',
        element: gameCanvasRef.current,
        width: 800,
        height: 600,
        pixelPerfect: true,
        responsive: true
      });
      
      gameEngineRef.current = engine;
      
      // Set up game events
      engine.on('update', ({ deltaTime }) => {
        updateGameState(deltaTime);
      });
      
      engine.on('render', ({ context }) => {
        if (!context) return;
        
        // Clear the canvas with futuristic background
        renderBackground(context);
        
        // Render game elements
        renderGame(context);
      });
      
      // Handle mouse/touch input through the engine
      engine.on('input:move', (e: any) => {
        if (e.normalized) {
          setPaddlePosition(e.normalized.x * 100);
        }
      });
      
      // Start the game engine
      engine.start();
      
      // Load high score from localStorage
      const savedHighScore = localStorage.getItem('cyberpong-highscore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore, 10));
      }
      
      // Create initial particle effects
      createInitialEffects();
      
      return () => {
        // Cleanup when component unmounts
        engine.end();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameStarted, gameOver]);
  
  // Update game state with physics and collision detection
  const updateGameState = (deltaTime: number) => {
    if (!gameStarted || gameOver || !gameEngineRef.current) return;
    
    // Update ball position
    const newBallPos = {
      x: ballPosition.x + ballDirection.x * ballSpeed * deltaTime,
      y: ballPosition.y + ballDirection.y * ballSpeed * deltaTime
    };
    
    // Check for collisions with walls (left/right)
    if (newBallPos.x <= 0 || newBallPos.x >= 100) {
      setBallDirection(prev => ({ ...prev, x: -prev.x }));
      newBallPos.x = newBallPos.x <= 0 ? 0 : 100;
      createWallHitEffect(newBallPos);
      gameEngineRef.current.audio.play('wall');
    }
    
    // Check for collision with player paddle
    const paddleHeight = 3;
    const ballSize = 2;
    if (newBallPos.y >= 90 - paddleHeight && newBallPos.y <= 90) {
      const paddleLeft = paddlePosition - (paddleSize / 2);
      const paddleRight = paddlePosition + (paddleSize / 2);
      
      if (newBallPos.x >= paddleLeft && newBallPos.x <= paddleRight) {
        // Calculate angle of bounce based on hit position
        const hitPosition = (newBallPos.x - paddleLeft) / paddleSize; // 0 to 1
        const bounceAngle = hitPosition * 160 - 80; // -80 to 80 degrees
        
        const rad = (bounceAngle * Math.PI) / 180;
        
        // Update ball direction based on bounce angle
        setBallDirection({
          x: Math.sin(rad) * (ballSpeed + 0.05),
          y: -Math.cos(rad) * (ballSpeed + 0.05)
        });
        
        // Move ball above paddle to prevent sticking
        newBallPos.y = 89 - paddleHeight;
        
        // Score points
        setScore(prevScore => prevScore + 10);
        
        // Create particle effect
        createPaddleHitEffect(newBallPos);
        gameEngineRef.current.audio.play('hit');
        
        // Level up after every 100 points
        if ((score + 10) % 100 === 0) {
          setLevel(prevLevel => prevLevel + 1);
          gameEngineRef.current.audio.play('levelup');
        }
      }
    }
    
    // Check for collision with computer paddle
    if (newBallPos.y <= 10 + paddleHeight && newBallPos.y >= 10) {
      const computerPaddleLeft = computerPaddlePosition - (paddleSize / 2);
      const computerPaddleRight = computerPaddlePosition + (paddleSize / 2);
      
      if (newBallPos.x >= computerPaddleLeft && newBallPos.x <= computerPaddleRight) {
        // Reflect ball direction
        setBallDirection(prev => ({ ...prev, y: Math.abs(prev.y) }));
        
        // Move ball below computer paddle to prevent sticking
        newBallPos.y = 10 + paddleHeight;
        
        // Create particle effect
        createComputerPaddleHitEffect(newBallPos);
        gameEngineRef.current.audio.play('hit');
      }
    }
    
    // Check for scoring (ball past player paddle)
    if (newBallPos.y >= 100) {
      // Game over
      gameOver();
      gameEngineRef.current.audio.play('gameover');
      return;
    }
    
    // Top boundary - computer misses
    if (newBallPos.y <= 0) {
      setBallDirection(prev => ({ ...prev, y: Math.abs(prev.y) }));
      newBallPos.y = 0;
      setScore(prevScore => prevScore + 25); // Bonus for getting past computer
      createWallHitEffect(newBallPos);
      gameEngineRef.current.audio.play('score');
    }
    
    // Update computer paddle AI
    updateComputerPaddle(deltaTime, newBallPos);
    
    // Update state with new positions
    setBallPosition(newBallPos);
  };
  
  // AI for computer paddle
  const updateComputerPaddle = (deltaTime: number, ballPos: Vector2D) => {
    const targetX = ballDirection.y < 0 ? ballPos.x : 50; // Follow ball only when coming toward computer
    
    // Add some imperfection to the AI based on level (higher levels = smarter computer)
    const aiAccuracy = Math.min(0.9, 0.4 + (level * 0.05));
    const randomOffset = (Math.random() - 0.5) * (1 - aiAccuracy) * 20;
    const target = targetX + randomOffset;
    
    // Move computer paddle toward target
    const moveAmount = computerSpeed * deltaTime;
    
    if (computerPaddlePosition < target) {
      setComputerPaddlePosition(prev => Math.min(prev + moveAmount, target));
    } else {
      setComputerPaddlePosition(prev => Math.max(prev - moveAmount, target));
    }
  };
  
  // Game over handling
  const endGame = () => {
    setGameOver(true);
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('cyberpong-highscore', score.toString());
    }
    
    // Create explosion effect
    if (gameEngineRef.current) {
      gameEngineRef.current.particles.createEmitterFromPreset('gameOverExplosion', 'explosion', {
        position: { 
          x: ballPosition.x * gameEngineRef.current.canvas.width / 100,
          y: ballPosition.y * gameEngineRef.current.canvas.height / 100
        },
        scale: 3,
        color: ['#ff0088', '#00ffff']
      });
    }
  };
  
  // Restart game
  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setBallPosition({ x: 50, y: 50 });
    setBallDirection({ x: 2, y: 3 });
    setPaddlePosition(50);
    setComputerPaddlePosition(50);
    
    // Short timeout to ensure state is reset before game starts again
    setTimeout(() => {
      setGameStarted(true);
    }, 100);
  };
  
  // Start new game
  const startNewGame = () => {
    setShowRules(false);
    setGameStarted(true);
  };
  
  // Particle effect functions
  const createPaddleHitEffect = (position: Vector2D) => {
    if (!gameEngineRef.current) return;
    
    const engine = gameEngineRef.current;
    const canvasPos = {
      x: position.x * engine.canvas.width / 100,
      y: position.y * engine.canvas.height / 100
    };
    
    // Create sparkle effect on paddle hit
    engine.particles.createEmitterFromPreset('paddleHit', 'sparkles', {
      position: canvasPos,
      color: ['#00ffff', '#ff00ff'],
      scale: 1.5
    });
  };
  
  const createComputerPaddleHitEffect = (position: Vector2D) => {
    if (!gameEngineRef.current) return;
    
    const engine = gameEngineRef.current;
    const canvasPos = {
      x: position.x * engine.canvas.width / 100,
      y: position.y * engine.canvas.height / 100
    };
    
    // Create effect for computer paddle hit
    engine.particles.createEmitterFromPreset('computerHit', 'sparkles', {
      position: canvasPos,
      color: ['#ff0000', '#ff8800'],
      scale: 1.2
    });
  };
  
  const createWallHitEffect = (position: Vector2D) => {
    if (!gameEngineRef.current) return;
    
    const engine = gameEngineRef.current;
    const canvasPos = {
      x: position.x * engine.canvas.width / 100,
      y: position.y * engine.canvas.height / 100
    };
    
    // Small explosion when hitting walls
    engine.particles.createEmitterFromPreset('wallHit', 'explosion', {
      position: canvasPos,
      color: ['#888888', '#aaaaaa'],
      scale: 0.5
    });
  };
  
  const createInitialEffects = () => {
    if (!gameEngineRef.current) return;
    
    const engine = gameEngineRef.current;
    
    // Create ambient effects for the cyberpunk aesthetic
    engine.particles.createEmitterFromPreset('ambientGlow', 'sparkles', {
      position: { 
        x: engine.canvas.width / 2,
        y: engine.canvas.height / 2
      },
      color: ['#0088ff', '#00ffaa', '#ff00ff'],
      scale: 3
    });
  };
  
  // Rendering functions
  const renderBackground = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    
    // Create cyberpunk gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#111122');
    bgGradient.addColorStop(1, '#221133');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines for cyberpunk effect
    ctx.strokeStyle = '#0066aa22';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    const gridSpacing = 20;
    for (let y = 0; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let x = 0; x < width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw center line
    ctx.strokeStyle = '#00ffff44';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(0, height/2);
    ctx.lineTo(width, height/2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw glowing edges
    const edgeGlow = ctx.createLinearGradient(0, 0, width, 0);
    edgeGlow.addColorStop(0, '#ff00ff44');
    edgeGlow.addColorStop(0.5, '#00000000');
    edgeGlow.addColorStop(1, '#00ffff44');
    
    ctx.strokeStyle = edgeGlow;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);
  };
  
  const renderGame = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;
    
    // Draw player paddle
    const paddleWidth = (paddleSize / 100) * width;
    const playerPaddleX = (paddlePosition / 100) * width - (paddleWidth / 2);
    const playerPaddleY = height * 0.9;
    const paddleHeight = height * 0.03;
    
    // Glowing player paddle
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillRect(playerPaddleX, playerPaddleY, paddleWidth, paddleHeight);
    ctx.shadowBlur = 0;
    
    // Draw computer paddle
    const computerPaddleX = (computerPaddlePosition / 100) * width - (paddleWidth / 2);
    const computerPaddleY = height * 0.1;
    
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(computerPaddleX, computerPaddleY, paddleWidth, paddleHeight);
    ctx.shadowBlur = 0;
    
    // Draw the ball
    const ballSize = width * 0.02;
    const ballX = (ballPosition.x / 100) * width - (ballSize / 2);
    const ballY = (ballPosition.y / 100) * height - (ballSize / 2);
    
    // Create radial gradient for glowing ball
    const ballGradient = ctx.createRadialGradient(
      ballX + ballSize/2, ballY + ballSize/2, 0,
      ballX + ballSize/2, ballY + ballSize/2, ballSize
    );
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.3, '#00ffff');
    ballGradient.addColorStop(1, '#0088ff00');
    
    ctx.fillStyle = ballGradient;
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ballX + ballSize/2, ballY + ballSize/2, ballSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw score and level
    ctx.fillStyle = '#00ffff';
    ctx.font = '20px "Orbitron", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, height - 20);
    ctx.textAlign = 'right';
    ctx.fillText(`LEVEL: ${level}`, width - 20, height - 20);
    ctx.textAlign = 'center';
    ctx.fillText(`HIGH SCORE: ${highScore}`, width / 2, 30);
  };
  
  return (
    <div className="relative w-full h-full flex justify-center items-center">
      {/* Game canvas container */}
      <div 
        ref={gameCanvasRef}
        className="w-full h-full max-w-3xl max-h-[600px] bg-gray-900 rounded-lg overflow-hidden shadow-lg"
      />
      
      {/* Game UI overlays */}
      {showRules && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-cyan-300 p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">CYBER PONG</h2>
          <div className="mb-8 text-center max-w-md">
            <p className="mb-4">Move your paddle using the mouse or touch to hit the ball.</p>
            <p className="mb-2">• Score points by making the AI miss</p>
            <p className="mb-2">• Ball speed increases with each level</p>
            <p className="mb-2">• The game ends if you miss the ball</p>
          </div>
          <button 
            onClick={startNewGame}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-md text-white font-bold hover:from-pink-500 hover:to-cyan-500 transition-all"
          >
            START GAME
          </button>
        </div>
      )}
      
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-cyan-300">
          <h2 className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent">GAME OVER</h2>
          <p className="text-2xl mb-2">Final Score: {score}</p>
          <p className="text-xl mb-6">High Score: {highScore}</p>
          <button 
            onClick={restartGame}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-cyan-600 rounded-md text-white font-bold hover:from-pink-500 hover:to-cyan-500 transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  )
}
