"use client"

import { useState, useEffect, useRef } from 'react'

export function EmojiGridGame() {
  const [grid, setGrid] = useState<string[][]>([])
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(120) // 2 minutes in seconds
  const [selectedEmojis, setSelectedEmojis] = useState<{row: number, col: number}[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState('')
  const [showRules, setShowRules] = useState(true)
  const [showCombinations, setShowCombinations] = useState(false)

  // Group emojis by categories for more meaningful matches
  const emojiGroups = {
    faces: ['😀', '😊', '🙂', '😎', '🥳', '😍'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🦊', '🐻'],
    foods: ['🍎', '🍌', '🍕', '🍔', '🍦', '🍩'],
    travel: ['✈️', '🚗', '🚢', '🚆', '🚀', '🏝️'],
    sports: ['⚽', '🏀', '🎾', '🏓', '🏈', '⛳'],
    weather: ['☀️', '🌧️', '⛅', '❄️', '🌈', '⛈️'],
    objects: ['📱', '💻', '📷', '🎮', '📚', '🎁'],
    symbols: ['❤️', '⭐', '✅', '❌', '💯', '🔥']
  }
    // Combine all emojis into one array for the grid
  const allEmojis = Object.values(emojiGroups).flat()
  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Timer effect
  useEffect(() => {
    if (!gameStarted) return
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Game over
          clearInterval(timerRef.current as NodeJS.Timeout)
          setGameStarted(false)
          setMessage(`Game over! Final score: ${score} points`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameStarted, score])
  
  // Initialize game grid
  const initializeGrid = () => {
    const size = 6 // Fixed size grid
    const newGrid = []
    
    // Create a balanced grid with emojis from all categories
    for (let i = 0; i < size; i++) {
      const row = []
      for (let j = 0; j < size; j++) {
        // Select a random category then a random emoji from that category
        const categories = Object.keys(emojiGroups)
        const randomCategoryIndex = Math.floor(Math.random() * categories.length)
        const category = categories[randomCategoryIndex] as keyof typeof emojiGroups
        const categoryEmojis = emojiGroups[category]
        const randomEmojiIndex = Math.floor(Math.random() * categoryEmojis.length)
        row.push(categoryEmojis[randomEmojiIndex])
      }
      newGrid.push(row)
    }
    
    setGrid(newGrid)
    setTimeRemaining(120)
    setScore(0)
    setMessage('')
  }
  
  const startGame = () => {
    initializeGrid()
    setGameStarted(true)
    setShowRules(false)
  }
    // Mouse event handlers for drag selection
  const handleMouseDown = (row: number, col: number) => {
    if (!gameStarted) return
    
    setIsDragging(true)
    setSelectedEmojis([{row, col}])
  }
  
  const handleMouseEnter = (row: number, col: number) => {
    if (!isDragging || !gameStarted) return
    
    // Get last selected position
    const lastSelected = selectedEmojis[selectedEmojis.length - 1]
    
    // Check if this is adjacent to last selection
    const isAdjacent = 
      (Math.abs(row - lastSelected.row) <= 1 && Math.abs(col - lastSelected.col) <= 1) &&
      !(row === lastSelected.row && col === lastSelected.col)
    
    // Check if already selected
    const isAlreadySelected = selectedEmojis.some(pos => pos.row === row && pos.col === col)
    
    // If adjacent and not already selected, add to selection
    if (isAdjacent && !isAlreadySelected) {
      setSelectedEmojis([...selectedEmojis, {row, col}])
    }
  }
  
  const handleMouseUp = () => {
    setIsDragging(false)
    if (selectedEmojis.length >= 3) {
      // Auto-submit if we have at least 3 emojis
      submitSelection()
    }
  }
  
  // Handle click for touch devices
  const handleEmojiClick = (row: number, col: number) => {
    if (!gameStarted) return
    
    const emoji = grid[row][col]
    
    // Check if this is a new selection or continuing a chain
    if (selectedEmojis.length === 0) {
      setSelectedEmojis([{row, col}])
      return
    }
    
    // Get last selected position
    const lastSelected = selectedEmojis[selectedEmojis.length - 1]
    
    // Check if this is adjacent to last selection
    const isAdjacent = 
      (Math.abs(row - lastSelected.row) <= 1 && Math.abs(col - lastSelected.col) <= 1) &&
      !(row === lastSelected.row && col === lastSelected.col)
    
    // Check if already selected
    const isAlreadySelected = selectedEmojis.some(pos => pos.row === row && pos.col === col)
    
    if (isAdjacent && !isAlreadySelected) {
      setSelectedEmojis([...selectedEmojis, {row, col}])
    } else if (isAlreadySelected && selectedEmojis.length > 1 && 
              selectedEmojis[selectedEmojis.length - 2].row === row && 
              selectedEmojis[selectedEmojis.length - 2].col === col) {
      // Allow backtracking by one step
      setSelectedEmojis(selectedEmojis.slice(0, selectedEmojis.length - 1))
    } else {
      // Start new selection
      setSelectedEmojis([{row, col}])
    }
  }
    // Check if emojis are in the same category
  const areEmojisRelated = (emojis: string[]): boolean => {
    if (emojis.length <= 1) return false;
    
    // Check if all emojis are in the same category
    for (const categoryName in emojiGroups) {
      const category = emojiGroups[categoryName as keyof typeof emojiGroups];
      if (emojis.every(emoji => category.includes(emoji))) {
        return true;
      }
    }
    
    // Check for common patterns from your examples
    const patterns = [
      ['🍕', '😋'], // Enjoying pizza
      ['😢', '🙂', '😄'], // Emotional recovery
      ['🌧️', '☂️'], // Rain and umbrella
      ['✈️', '🧳', '🏝️'] // Vacation trip
    ];
    
    for (const pattern of patterns) {
      if (emojis.every(emoji => pattern.includes(emoji)) && 
          pattern.every(emoji => emojis.includes(emoji))) {
        return true;
      }
    }
    
    return false;
  }
  
  // Submit the current selection
  const submitSelection = () => {
    if (selectedEmojis.length < 2) {
      setSelectedEmojis([]);
      return;
    }
    
    // Get the emojis from the selected positions
    const selectedEmojiValues = selectedEmojis.map(({row, col}) => grid[row][col]);
    
    // Check if emojis are related
    const isRelated = areEmojisRelated(selectedEmojiValues);
    
    if (isRelated) {
      // Calculate score - more emojis = higher score, with bonus for longer chains
      const basePoints = selectedEmojis.length * 10;
      const lengthBonus = selectedEmojis.length >= 5 ? 20 : 
                           selectedEmojis.length >= 4 ? 10 : 0;
      const pointsEarned = basePoints + lengthBonus;
      
      setScore(prevScore => prevScore + pointsEarned);
      setMessage(`+${pointsEarned} points! Good match!`);
      
      // Replace selected emojis with new ones
      const newGrid = [...grid];
      selectedEmojis.forEach(({row, col}) => {
        // Select from random emoji category
        const categories = Object.keys(emojiGroups);
        const randomCategory = categories[Math.floor(Math.random() * categories.length)] as keyof typeof emojiGroups;
        const categoryEmojis = emojiGroups[randomCategory];
        const randomEmoji = categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
        newGrid[row][col] = randomEmoji;
      });
      
      setGrid(newGrid);
    } else {
      setMessage('Try again! Find emojis that go together.');
    }
    
    setSelectedEmojis([]);
  }
    // Format time remaining as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Render game rules
  const renderRules = () => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-full max-w-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-center text-cyan-400">Emoji Grid Challenge</h2>
      <p className="mb-6 text-center">Create meaningful emoji sequences and match emoji patterns to score points in this fun puzzle game!</p>
      
      <button
        onClick={startGame}
        className="w-full py-3 px-6 mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
      >
        Start Game
      </button>
      
      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => { setShowRules(true); setShowCombinations(false); }}
          className={`flex-1 py-2 px-4 rounded-lg transition ${showRules ? 'bg-cyan-700/50 text-cyan-300' : 'bg-gray-800/50 text-gray-400'}`}
        >
          Game Rules
        </button>
        <button 
          onClick={() => { setShowRules(false); setShowCombinations(true); }}
          className={`flex-1 py-2 px-4 rounded-lg transition ${showCombinations ? 'bg-cyan-700/50 text-cyan-300' : 'bg-gray-800/50 text-gray-400'}`}
        >
          Example Matches
        </button>
      </div>
      
      {showRules && (
        <div className="space-y-4 text-sm">
          <p>Game Rules:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>You have 2 minutes to solve emoji puzzles and score as many points as possible</li>
            <li>Select adjacent emojis to form meaningful sequences and patterns</li>
            <li>Each emoji combination must make sense - related emojis score points!</li>
            <li>Longer emoji sequences earn more points - find the best combinations</li>
          </ul>
        </div>
      )}
      
      {showCombinations && (
        <div className="space-y-4 text-sm">
          <p>Popular Emoji Combinations:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-xl mb-1">🍕😋</div>
              <div className="text-xs text-gray-300">Enjoying pizza</div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-xl mb-1">😢🙂😄</div>
              <div className="text-xs text-gray-300">Emotional recovery</div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-xl mb-1">🌧️☂️</div>
              <div className="text-xs text-gray-300">Rain and umbrella</div>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <div className="text-xl mb-1">✈️🧳🏝️</div>
              <div className="text-xs text-gray-300">Vacation trip</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderGame = () => (
    <>
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
          <div className="text-gray-300 text-xs mb-1">Score</div>
          <div className="text-white font-bold text-xl">{score}</div>
        </div>
        
        <div className="flex items-center justify-center">
          {message && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm animate-fade-in-out">
              {message}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center py-2 px-4 bg-white/10 backdrop-blur-sm rounded-lg min-w-[100px]">
          <div className="text-gray-300 text-xs mb-1">Time</div>
          <div className={`font-bold text-xl ${timeRemaining <= 30 ? 'text-red-400' : 'text-white'}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
      
      <div 
        ref={gridRef}
        className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full max-w-md"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="grid grid-cols-6 gap-2">
          {grid.map((row, rowIndex) => (
            row.map((emoji, colIndex) => {
              const isSelected = selectedEmojis.some(
                pos => pos.row === rowIndex && pos.col === colIndex
              );
              
              // Find position in selection for connecting lines
              const selectionIndex = selectedEmojis.findIndex(
                pos => pos.row === rowIndex && pos.col === colIndex
              );
              
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleEmojiClick(rowIndex, colIndex)}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchMove={(e) => {
                    // Handle touch move for mobile drag selection
                    if (!isDragging || !gridRef.current) return;
                    
                    const touch = e.touches[0];
                    const rect = gridRef.current.getBoundingClientRect();
                    const elementSize = rect.width / 6; // 6 columns
                    
                    // Calculate which grid cell the touch is over
                    const x = Math.floor((touch.clientX - rect.left) / elementSize);
                    const y = Math.floor((touch.clientY - rect.top) / elementSize);
                    
                    // Only process if within grid bounds
                    if (x >= 0 && x < 6 && y >= 0 && y < grid.length) {
                      handleMouseEnter(y, x);
                    }
                  }}
                  className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-br from-cyan-600/70 to-blue-600/70 scale-95 shadow-inner ring-2 ring-white/30' 
                      : 'bg-white/20 hover:bg-white/30 active:bg-white/40'
                  }`}
                  disabled={!gameStarted}
                >
                  <span className="transform transition-all" style={{
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                  }}>
                    {emoji}
                  </span>
                  {isSelected && (
                    <span className="absolute text-xs text-white bg-blue-600 rounded-full h-5 w-5 flex items-center justify-center top-0 right-0">
                      {selectionIndex + 1}
                    </span>
                  )}
                </button>
              );
            })
          ))}
        </div>
      </div>
      
      <div className="flex mt-4 gap-4">
        <button 
          onClick={submitSelection}
          disabled={selectedEmojis.length < 2}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            selectedEmojis.length >= 2
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:from-cyan-700 active:to-blue-700 text-white shadow-lg'
              : 'bg-white/20 text-white/50 cursor-not-allowed'
          }`}
        >
          Submit {selectedEmojis.length > 0 && `(${selectedEmojis.length})`}
        </button>
        
        <button
          onClick={() => setSelectedEmojis([])}
          disabled={selectedEmojis.length === 0}
          className={`px-4 py-3 rounded-lg transition-all ${
            selectedEmojis.length > 0
              ? 'bg-gray-800/50 text-white hover:bg-gray-700/50 active:bg-gray-600/50'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          Clear
        </button>
      </div>
      
      {/* Game over modal */}
      {timeRemaining === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-blue-900/80">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Game Over!
            </h2>
            
            <p className="text-xl text-center mb-6">
              Final Score: <span className="font-bold">{score}</span>
            </p>
            
            <button
              onClick={startGame}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      <button
        className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-white text-sm transition-colors"
        onClick={() => {
          setShowRules(true)
          setShowCombinations(false)
        }}
      >
        Show Instructions
      </button>
    </>
  )

  // Main render
  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-cyan-900 to-blue-800 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 relative">
      {!gameStarted ? renderRules() : renderGame()}
    </div>
  )
}
