"use client"

import { useState, useEffect, useRef } from 'react'

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
  
  // Game settings
  const ballSpeed = 0.2 + (level * 0.05)
  const computerSpeed = 0.8 + (level * 0.1)
  
  // Initialize game
  useEffect(() => {
    if (gameStarted && !gameOver) {
      // Reset ball to center
      setBallPosition({ x: 50, y: 50 })
      
      // Set initial direction
      setBallDirection({ 
        x: Math.random() > 0.5 ? 2 : -2, 
        y: Math.random() > 0.5 ? 2 : -2 
      })
      
      // Set paddle size based on level
      setPaddleSize(Math.max(10, 20 - ((level - 1) * 2)))
      
      // Start game loop
      startGameLoop()
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameStarted, gameOver, level])
  
  // Track mouse/touch movement for paddle control
  useEffect(() => {
    if (!gameStarted || gameOver) return
    
    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      if (gameCanvasRef.current) {
        const rect = gameCanvasRef.current.getBoundingClientRect()
        const relativeX = e.clientX - rect.left
        const newPosition = (relativeX / rect.width) * 100
        setPaddlePosition(Math.max(paddleSize / 2, Math.min(100 - paddleSize / 2, newPosition)))
      }
    }
    
    // Touch movement handler
    const handleTouchMove = (e: TouchEvent) => {
      if (gameCanvasRef.current && e.touches[0]) {
        const rect = gameCanvasRef.current.getBoundingClientRect()
        const relativeX = e.touches[0].clientX - rect.left
        const newPosition = (relativeX / rect.width) * 100
        setPaddlePosition(Math.max(paddleSize / 2, Math.min(100 - paddleSize / 2, newPosition)))
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('touchmove', handleTouchMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [gameStarted, gameOver, paddleSize])
  
  // Game loop
  const startGameLoop = () => {
    lastFrameTimeRef.current = performance.now()
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentTime
      
      // Update game state
      updateGameState(deltaTime)
      
      // Continue loop if game is still active
      if (gameStarted && !gameOver) {
        animationRef.current = requestAnimationFrame(gameLoop)
      }
    }
    
    // Start the loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }
  
  // Update game state on each frame
  const updateGameState = (deltaTime: number) => {
    // Move ball
    const newX = ballPosition.x + ballDirection.x * ballSpeed * (deltaTime / 10)
    const newY = ballPosition.y + ballDirection.y * ballSpeed * (deltaTime / 10)
    
    // Wall collision (left/right)
    if (newX < 2.5 || newX > 97.5) {
      setBallDirection(prev => ({ ...prev, x: -prev.x }))
    }
    
    // Player paddle collision
    if (newY >= 90 && newY <= 95) {
      const paddleLeft = paddlePosition - (paddleSize / 2)
      const paddleRight = paddlePosition + (paddleSize / 2)
      
      if (newX >= paddleLeft && newX <= paddleRight) {
        // Calculate bounce angle based on hit position
        const hitPosition = (newX - paddleLeft) / paddleSize - 0.5 // -0.5 to 0.5
        
        // Apply bounce with angle
        setBallDirection(prev => ({ 
          x: prev.x + hitPosition * 4, 
          y: -Math.abs(prev.y)  // Always bounce upward
        }))
        
        // Increment score
        setScore(prevScore => prevScore + 10)
      }
    }
    
    // Computer paddle collision
    if (newY <= 10 && newY >= 5) {
      const computerPaddleLeft = computerPaddlePosition - (paddleSize / 2)
      const computerPaddleRight = computerPaddlePosition + (paddleSize / 2)
      
      if (newX >= computerPaddleLeft && newX <= computerPaddleRight) {
        // Calculate bounce angle
        const hitPosition = (newX - computerPaddleLeft) / paddleSize - 0.5
        
        setBallDirection(prev => ({ 
          x: prev.x + hitPosition * 4, 
          y: Math.abs(prev.y)  // Always bounce downward
        }))
      }
    }
    
    // Score/lose condition
    if (newY > 100) {
      // Player missed
      endGame()
      return
    }
    
    if (newY < 0) {
      // Computer missed
      setBallDirection(prev => ({ ...prev, y: Math.abs(prev.y) }))
      
      // Add bonus points
      setScore(prevScore => prevScore + 25)
      
      // Increase level every 200 points
      if (score > 0 && score % 200 === 0) {
        setLevel(prevLevel => prevLevel + 1)
      }
    }
    
    // Update ball position
    setBallPosition({ x: newX, y: newY })
    
    // Move computer paddle (follows ball with slight delay)
    if (ballDirection.y < 0) { // Only move if ball is coming toward it
      const targetX = ballPosition.x
      const difference = targetX - computerPaddlePosition
      
      if (Math.abs(difference) > 1) {
        const step = difference > 0 ? 
                    Math.min(computerSpeed * (deltaTime / 10), difference) : 
                    Math.max(-computerSpeed * (deltaTime / 10), difference)
        
        setComputerPaddlePosition(prev => 
          Math.max(paddleSize / 2, Math.min(100 - paddleSize / 2, prev + step))
        )
      }
    }
  }
  
  // End game and update high score if needed
  const endGame = () => {
    setGameOver(true)
    setHighScore(prev => Math.max(prev, score))
  }
  
  // Start new game
  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setShowRules(false)
    setScore(0)
    setLevel(1)
  }
  
  // Game instructions
  const renderRules = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">CyberPong</h2>
      <p className="mb-6 text-center">Classic pong with a futuristic neon twist. Control your paddle and bounce the ball past your opponent.</p>
      
      <button
        onClick={startGame}
        className="w-full py-3 px-6 mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
      >
        Start Game
      </button>
      
      <div className="space-y-4 text-sm">
        <h3 className="font-bold">How To Play:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Move your mouse or finger (on touch devices) to control your paddle</li>
          <li>Bounce the ball past the computer's paddle to score points</li>
          <li>Don't let the ball get past your paddle or the game ends</li>
          <li>As you score more points, the ball speed increases and your paddle gets smaller</li>
        </ul>
        
        <div className="mt-4 bg-black/20 p-4 rounded-lg">
          <h4 className="font-bold mb-2">Scoring:</h4>
          <ul className="list-disc pl-5 text-xs">
            <li>10 points for each paddle hit</li>
            <li>25 bonus points when the computer misses</li>
            <li>Level increases every 200 points</li>
            <li>Higher levels have smaller paddles and faster speeds</li>
          </ul>
        </div>
      </div>
    </div>
  )
  
  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4">
      {!gameStarted ? (
        // Show game rules and start screen
        renderRules()
      ) : (
        <>
          {/* Game UI */}
          <div className="w-full flex justify-between items-center mb-4">
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
              <div className="text-gray-300 text-xs mb-1">Score</div>
              <div className="text-white font-bold text-xl">{score}</div>
            </div>
            
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="text-gray-300 text-xs mb-1">Level</div>
              <div className="text-white font-bold text-xl">{level}</div>
            </div>
            
            <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
              <div className="text-gray-300 text-xs mb-1">High Score</div>
              <div className="text-white font-bold text-xl">{highScore}</div>
            </div>
          </div>
          
          {/* Game area */}
          <div 
            ref={gameCanvasRef} 
            className="relative bg-gray-950 border border-gray-800 rounded-lg w-full max-w-md aspect-[4/3] overflow-hidden"
          >
            {/* Game over message */}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
                <div className="text-center p-6 bg-gray-800/80 rounded-lg">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-2">Game Over!</h3>
                  <p className="text-white mb-1">Final Score: {score}</p>
                  <p className="text-white mb-4">Level: {level}</p>
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
            
            {/* Game grid background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            
            {/* Center line */}
            <div className="absolute left-0 right-0 h-1 top-1/2 transform -translate-y-1/2 flex">
              {Array.from({length: 20}).map((_, i) => (
                <div 
                  key={i}
                  className="h-full bg-cyan-500/30 flex-1 mx-1"
                />
              ))}
            </div>
            
            {/* Computer paddle */}
            <div 
              className="absolute top-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg shadow-cyan-500/50"
              style={{
                left: `${computerPaddlePosition - (paddleSize / 2)}%`,
                width: `${paddleSize}%`
              }}
            />
            
            {/* Ball */}
            <div 
              className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 shadow-lg shadow-cyan-500/50"
              style={{
                left: `${ballPosition.x}%`,
                top: `${ballPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
            
            {/* Player paddle */}
            <div 
              className="absolute bottom-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg shadow-pink-500/50"
              style={{
                left: `${paddlePosition - (paddleSize / 2)}%`,
                width: `${paddleSize}%`
              }}
            />
            
            {/* Side glow effects */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 to-pink-500/50"></div>
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500/50 to-pink-500/50"></div>
          </div>
          
          {/* Game controls - only shown on mobile */}
          <div className="mt-4 px-4 w-full max-w-md md:hidden">
            <p className="text-center text-white/70 text-sm">
              Move your finger across the game area to control the paddle
            </p>
          </div>
          
          {showRules && (
            <div className="mt-4 p-4 w-full max-w-md bg-black/50 backdrop-blur-sm rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">Game Instructions</h3>
                <button 
                  onClick={() => setShowRules(false)}
                  className="text-white/70 hover:text-white"
                >
                  Hide
                </button>
              </div>
              <p className="text-white/80 text-sm">
                Move your mouse or finger to control the bottom paddle. Bounce the ball past the computer's paddle to score points.
                Don't let the ball get past your paddle!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
