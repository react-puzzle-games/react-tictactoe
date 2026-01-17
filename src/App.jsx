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
        <h1>Tic-Tac-Toe</h1>
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
        </div>
      </header>

      <main className="game-container">
        <div className="game">
          <div className="scoreboard">
            <div className="score x-score">
              <span className="score-label">X</span>
              <span className="score-value">{scores.X}</span>
            </div>
            <div className="score draws">
              <span className="score-label">Draws</span>
              <span className="score-value">{scores.draws}</span>
            </div>
            <div className="score o-score">
              <span className="score-label">O</span>
              <span className="score-value">{scores.O}</span>
            </div>
          </div>

          <div className={`status ${winner ? 'winner' : ''} ${isDraw ? 'draw' : ''}`}>
            {status}
          </div>

          <Board squares={squares} onClick={handleClick} winningLine={winningLine} />

          <div className="controls">
            <button className="btn" onClick={resetGame}>
              New Game
            </button>
            <button className="btn btn-secondary" onClick={resetScores}>
              Reset Scores
            </button>
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>
          Built by <a href="https://ovidiu.dev" target="_blank" rel="noopener noreferrer">Ovidiu</a> |{' '}
          <a href="https://react-puzzle-games.ovidiu.dev" target="_blank" rel="noopener noreferrer">More Games</a>
        </p>
      </footer>
    </div>
  )
}
