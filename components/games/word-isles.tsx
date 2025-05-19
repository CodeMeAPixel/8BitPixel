"use client"

import { useState, useEffect, useRef } from 'react'
import { GameRulesModal } from '@/components/game-rules-modal'
import { getGameData } from '@/lib/games'
import { HelpCircle } from 'lucide-react'

export function WordIslesGame() {
  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    words: [],
    currentWord: '',
    isles: [],
    bridges: [],
    selectedIsle: null,
    timeRemaining: 60,
    gameStarted: false,
    gameOver: false,
    message: ''
  })
  
  // Rules modal state
  const [showRules, setShowRules] = useState(false)

  // Get game data
  const gameData = getGameData('word-isles')

  // Word lists by difficulty
  const wordsByLevel = {
    1: ['BRIDGE', 'ISLAND', 'FLOAT', 'OCEAN', 'CROSS'],
    2: ['MARINE', 'SAILING', 'VOYAGE', 'NAVIGATE', 'JOURNEY'],
    3: ['ARCHIPELAGO', 'EXPEDITION', 'LIGHTHOUSE', 'SEAFARING', 'DISCOVERY']
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Initialize game state
  useEffect(() => {
    // Set up resize handler
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth
        canvasRef.current.height = containerRef.current.clientHeight
        drawBridges()
      }
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Canvas drawing for bridges
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth
      canvasRef.current.height = containerRef.current.clientHeight
      drawBridges()
    }
  }, [gameState.bridges])

  // Game timer
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout)
            return {
              ...prev,
              gameOver: true,
              message: 'Time\'s up!'
            }
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          }
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [gameState.gameStarted, gameState.gameOver])

  // Start new game
  const startGame = () => {
    const level = 1
    const words = [...wordsByLevel[level as keyof typeof wordsByLevel]]
    const currentWord = words[Math.floor(Math.random() * words.length)]
    
    setGameState({
      score: 0,
      level,
      words,
      currentWord,
      isles: generateIslands(currentWord.length + 2),
      bridges: [],
      selectedIsle: null,
      timeRemaining: 60,
      gameStarted: true,
      gameOver: false,
      message: ''
    })
  }

  // Start next level
  const nextLevel = () => {
    const level = Math.min(3, gameState.level + 1)
    const words = [...wordsByLevel[level as keyof typeof wordsByLevel]]
    const currentWord = words[Math.floor(Math.random() * words.length)]
    
    setGameState(prev => ({
      ...prev,
      level,
      words,
      currentWord,
      isles: generateIslands(currentWord.length + 2),
      bridges: [],
      selectedIsle: null,
      timeRemaining: 60 + (level * 15),
      gameOver: false,
      message: `Level ${level} - Go!`
    }))
  }

  // Generate island positions
  const generateIslands = (count: number) => {
    // Assign letters to islands for the current word
    const islands = []
    const wordLetters = gameState.currentWord ? gameState.currentWord.split('') : []
    
    // Create islands with positions
    for (let i = 0; i < count; i++) {
      const letter = i < wordLetters.length ? wordLetters[i] : 
                    String.fromCharCode(65 + Math.floor(Math.random() * 26))
      islands.push({
        id: i,
        letter,
        x: Math.random() * 80 + 10, // 10-90% of width
        y: Math.random() * 70 + 15, // 15-85% of height
        size: Math.random() * 10 + 30, // 30-40px
        visited: false
      })
    }
    return islands
  }

  // Draw bridges between islands
  const drawBridges = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    ctx.strokeStyle = '#ffffff60'
    ctx.lineWidth = 3
    ctx.setLineDash([5, 3])
    
    gameState.bridges.forEach((bridge, index) => {
      const start = gameState.isles.find(isle => isle.id === bridge.start)
      const end = gameState.isles.find(isle => isle.id === bridge.end)
      
      if (start && end) {
        const startX = start.x * canvas.width / 100
        const startY = start.y * canvas.height / 100
        const endX = end.x * canvas.width / 100
        const endY = end.y * canvas.height / 100
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
        ctx.stroke()
        
        // Draw bridge letter at the middle of the bridge
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        
        ctx.fillStyle = '#ffffff'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(bridge.letter, midX, midY)
      }
    })
  }

  // Handle island click
  const handleIslandClick = (id: number) => {
    if (gameState.gameOver) return
    
    const isle = gameState.isles.find(isle => isle.id === id)
    if (!isle) return
    
    // If no island is selected, select this one
    if (gameState.selectedIsle === null) {
      setGameState(prev => ({
        ...prev,
        selectedIsle: id,
        message: `Selected island with letter ${isle.letter}`
      }))
      return
    }
    
    // If clicking the same island, deselect it
    if (gameState.selectedIsle === id) {
      setGameState(prev => ({
        ...prev,
        selectedIsle: null,
        message: ''
      }))
      return
    }
    
    // Create a bridge between the two islands
    const startIsle = gameState.isles.find(isle => isle.id === gameState.selectedIsle)
    if (!startIsle) return
    
    // Check if a bridge already exists
    const bridgeExists = gameState.bridges.some(
      bridge => (bridge.start === gameState.selectedIsle && bridge.end === id) ||
               (bridge.start === id && bridge.end === gameState.selectedIsle)
    )
    
    if (bridgeExists) {
      setGameState(prev => ({
        ...prev,
        selectedIsle: null,
        message: 'Bridge already exists'
      }))
      return
    }
    
    // Create a bridge with the letter connecting them
    const bridgeLetter = startIsle.letter + isle.letter
    
    // Check if the bridge letters form part of the current word
    const wordContainsBridge = checkBridgeInWord(startIsle.letter, isle.letter)
    
    const newIsles = gameState.isles.map(i => 
      i.id === id || i.id === gameState.selectedIsle 
        ? {...i, visited: true} 
        : i
    )
    
    // Add bridge
    const newBridges = [
      ...gameState.bridges, 
      { 
        start: gameState.selectedIsle, 
        end: id, 
        letter: startIsle.letter + isle.letter,
        isCorrect: wordContainsBridge
      }
    ]
    
    let scoreIncrease = 0
    let message = ''
    
    if (wordContainsBridge) {
      scoreIncrease = 10 * gameState.level
      message = '+' + scoreIncrease + ' points! Good connection!'
    } else {
      scoreIncrease = -5
      message = 'Not in the word! -5 points'
    }
    
    // Check if all letters in the word have been found
    const updatedState = {
      ...gameState,
      isles: newIsles,
      bridges: newBridges,
      selectedIsle: null,
      score: gameState.score + scoreIncrease,
      message
    }
    
    if (checkLevelComplete(updatedState)) {
      // Level complete!
      updatedState.message = 'Level Complete! +' + (50 * gameState.level) + ' bonus points!'
      updatedState.score += 50 * gameState.level
      
      // Set timeout to move to next level
      setTimeout(() => {
        nextLevel()
      }, 2000)
    }
    
    setGameState(updatedState)
  }
  
  // Check if bridge letters are in the current word
  const checkBridgeInWord = (letter1: string, letter2: string) => {
    const word = gameState.currentWord
    return word.includes(letter1 + letter2) || word.includes(letter2 + letter1)
  }
  
  // Check if all letters of the current word have been found in bridges
  const checkLevelComplete = (state: typeof gameState) => {
    const word = state.currentWord
    
    for (let i = 0; i < word.length - 1; i++) {
      const pair = word.substring(i, i + 2)
      const reversePair = pair[1] + pair[0]
      
      const pairFound = state.bridges.some(bridge => 
        bridge.letter === pair || bridge.letter === reversePair
      )
      
      if (!pairFound) return false
    }
    
    return true
  }
  
  // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Render welcome screen
  const renderWelcome = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-blue-900/80">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
          Word Isles
        </h2>
        
        <p className="mb-6 text-center">
          Connect islands to form letter pairs that appear in the target word!
        </p>
        
        <div className="space-y-4 mb-6">
          <p className="font-medium">How to play:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Click on islands to select them</li>
            <li>Connect two islands to form a bridge</li>
            <li>Try to find all letter pairs in the target word</li>
            <li>Complete the level before time runs out</li>
          </ul>
        </div>
        
        <button
          onClick={startGame}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300"
        >
          Start Game
        </button>
      </div>
    </div>
  )
  
  // Render game over screen
  const renderGameOver = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-blue-900/80">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4 text-center text-red-400">
          Game Over!
        </h2>
        
        <p className="text-xl text-center mb-6">
          Final Score: <span className="font-bold">{gameState.score}</span>
        </p>
        
        <p className="text-center mb-6">
          You reached level {gameState.level}
        </p>
        
        <button
          onClick={startGame}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all duration-300"
        >
          Play Again
        </button>
      </div>
    </div>
  )

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[600px] bg-gradient-to-b from-blue-800 to-blue-500 rounded-lg overflow-hidden relative"
    >
      {/* Rules Button */}
      {gameState.gameStarted && !showRules && (
        <button
          onClick={() => setShowRules(true)}
          className="absolute top-16 right-4 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors"
          aria-label="Show game rules"
        >
          <HelpCircle size={18} />
        </button>
      )}
      
      {/* Rules Modal */}
      <GameRulesModal 
        gameData={gameData} 
        isOpen={showRules} 
        onClose={() => setShowRules(false)} 
      />
      
      {/* Canvas for drawing bridges */}
      <canvas 
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
      
      {/* UI Overlays */}
      {!gameState.gameStarted && renderWelcome()}
      {gameState.gameOver && renderGameOver()}
      
      {/* Game UI */}
      {gameState.gameStarted && (
        <>
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white font-semibold">
              Score: {gameState.score} | Level: {gameState.level}
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white font-semibold">
              Time: {formatTime(gameState.timeRemaining)}
            </div>
          </div>
          
          {gameState.message && (
            <div className="absolute top-16 left-0 right-0 mx-auto w-4/5 bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-center">
              {gameState.message}
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 mx-auto w-4/5 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <p className="text-white font-bold text-lg">Target Word: {gameState.currentWord}</p>
            <p className="text-white/80 text-sm">Connect islands to form letter pairs in the word</p>
          </div>
          
          {/* Islands */}
          {gameState.isles.map(isle => (
            <div 
              key={isle.id}
              onClick={() => handleIslandClick(isle.id)}
              style={{
                position: 'absolute',
                left: `${isle.x}%`,
                top: `${isle.y}%`,
                width: `${isle.size}px`,
                height: `${isle.size}px`,
                backgroundColor: gameState.selectedIsle === isle.id ? '#ffd700' : 
                                isle.visited ? '#8fbc8f' : '#8db600',
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: gameState.selectedIsle === isle.id ? 
                          '0 0 15px rgba(255,215,0,0.8)' : '0 0 10px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.2s ease-in-out',
                border: gameState.selectedIsle === isle.id ? '2px solid white' : 'none',
              }}
              className="hover:scale-110"
            >
              <span className="text-white font-bold text-lg">
                {isle.letter}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
