import { useState } from 'react'
import './App.css'

function Square({ value, onClick, isWinning }) {
  return (
    <button
      className={`square ${isWinning ? 'winning' : ''} ${value ? 'filled' : ''}`}
      onClick={onClick}
    >
      {value && <span className={`mark ${value.toLowerCase()}`}>{value}</span>}
    </button>
  )
}

function Board({ squares, onClick, winningLine }) {
  const renderSquare = (i) => (
    <Square
      key={i}
      value={squares[i]}
      onClick={() => onClick(i)}
      isWinning={winningLine && winningLine.includes(i)}
    />
  )

  return (
    <div className="board">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => renderSquare(i))}
    </div>
  )
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ]

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] }
    }
  }
  return null
}

function getComputerMove(squares, difficulty) {
  const emptySquares = squares
    .map((sq, i) => sq === null ? i : null)
    .filter(i => i !== null)

  if (emptySquares.length === 0) return null

  if (difficulty === 'easy') {
    // Random move
    return emptySquares[Math.floor(Math.random() * emptySquares.length)]
  }

  // Medium/Hard: Try to win or block
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  // Try to win
  for (const [a, b, c] of lines) {
    const vals = [squares[a], squares[b], squares[c]]
    if (vals.filter(v => v === 'O').length === 2 && vals.includes(null)) {
      const idx = [a, b, c][vals.indexOf(null)]
      return idx
    }
  }

  // Block opponent
  for (const [a, b, c] of lines) {
    const vals = [squares[a], squares[b], squares[c]]
    if (vals.filter(v => v === 'X').length === 2 && vals.includes(null)) {
      const idx = [a, b, c][vals.indexOf(null)]
      return idx
    }
  }

  if (difficulty === 'hard') {
    // Take center if available
    if (squares[4] === null) return 4

    // Take corners
    const corners = [0, 2, 6, 8].filter(i => squares[i] === null)
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)]
    }
  }

  // Random from remaining
  return emptySquares[Math.floor(Math.random() * emptySquares.length)]
}

export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setXIsNext] = useState(true)
  const [gameMode, setGameMode] = useState('pvp') // 'pvp' or 'pvc'
  const [difficulty, setDifficulty] = useState('medium')
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 })

  const result = calculateWinner(squares)
  const winner = result?.winner
  const winningLine = result?.line
  const isDraw = !winner && squares.every(sq => sq !== null)

  const handleClick = (i) => {
    if (squares[i] || winner) return

    const newSquares = squares.slice()
    newSquares[i] = xIsNext ? 'X' : 'O'
    setSquares(newSquares)

    const newResult = calculateWinner(newSquares)
    if (newResult) {
      setScores(prev => ({ ...prev, [newResult.winner]: prev[newResult.winner] + 1 }))
      setXIsNext(!xIsNext)
      return
    }

    if (newSquares.every(sq => sq !== null)) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }))
      setXIsNext(!xIsNext)
      return
    }

    // Computer's turn
    if (gameMode === 'pvc' && xIsNext) {
      setXIsNext(false)
      setTimeout(() => {
        const computerMove = getComputerMove(newSquares, difficulty)
        if (computerMove !== null) {
          const computerSquares = newSquares.slice()
          computerSquares[computerMove] = 'O'
          setSquares(computerSquares)

          const compResult = calculateWinner(computerSquares)
          if (compResult) {
            setScores(prev => ({ ...prev, O: prev.O + 1 }))
          } else if (computerSquares.every(sq => sq !== null)) {
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }))
          }
          setXIsNext(true)
        }
      }, 400)
    } else {
      setXIsNext(!xIsNext)
    }
  }

  const resetGame = () => {
    setSquares(Array(9).fill(null))
    setXIsNext(true)
  }

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 })
    resetGame()
  }

  const changeGameMode = (mode) => {
    setGameMode(mode)
    resetGame()
  }

  let status
  if (winner) {
    status = `Winner: ${winner}`
  } else if (isDraw) {
    status = "It's a draw!"
  } else {
    status = `Next: ${xIsNext ? 'X' : 'O'}`
  }

  return (
    <div className="app">
      <header className="header">
        <h1>React Puzzle Games - Tic-Tac-Toe</h1>
        <div className="header-controls">
          <select
            className="header-select"
            value={gameMode}
            onChange={(e) => changeGameMode(e.target.value)}
          >
            <option value="pvp">Player vs Player</option>
            <option value="pvc">Player vs Computer</option>
          </select>
          {gameMode === 'pvc' && (
            <select
              className="header-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          )}
          <button className="header-btn" onClick={resetGame}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            NEW GAME
          </button>
          <button className="header-btn" onClick={resetScores}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <polyline points="23 20 23 14 17 14"/>
              <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/>
            </svg>
            RESET ALL
          </button>
          <div className="header-info">
            <span className="score-badge x">X: {scores.X}</span>
            <span className="score-badge">Draws: {scores.draws}</span>
            <span className="score-badge o">O: {scores.O}</span>
          </div>
        </div>
      </header>

      <main className="game-container">
        <div className="game">
          <div className={`status ${winner ? 'winner' : ''} ${isDraw ? 'draw' : ''}`}>
            {status}
          </div>

          <Board squares={squares} onClick={handleClick} winningLine={winningLine} />
        </div>
      </main>

      <footer className="footer">
        <div className="footer-github">
          <a href="https://github.com/react-puzzle-games" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
        <div>Made with love by <a href="https://react-puzzle-games.ovidiu.dev" target="_blank" rel="noopener noreferrer">React Puzzle Games</a></div>
      </footer>
    </div>
  )
}
