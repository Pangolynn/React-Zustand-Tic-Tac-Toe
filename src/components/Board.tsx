import { Square } from "./Square"
import { create } from 'zustand'
import { combine } from 'zustand/middleware';

type SquareValue = 'X' | 'O' | null;
type Squares = SquareValue[];

type GameState = {
  currentMove: number;
  history: Squares[];
}

type BoardProps = {
  xIsNext: boolean;
  squares: Squares;
  onPlay: 
    (nextSquares: Squares) => void;
}

type GameActions = {
  setHistory: (
    next: Squares[] | ((prev: Squares[]) => Squares[])
  ) => void;
  setCurrentMove: (
    next: number | ((prev: number) => number) ) => void;
}

const useGameStore = create(
  combine<GameState, GameActions>({ 
    history: [Array(9).fill(null) as Squares], 
    currentMove: 0,
  }, 
  (set) => {
    return {
      setHistory: (nextHistory) => {
        set((state) => ({
          history:
            typeof nextHistory === 'function'
            ? nextHistory(state.history)
            : nextHistory,
        }))
      },
      setCurrentMove: (nextCurrentMove) => {
        set((state) => ({
          currentMove:
            typeof nextCurrentMove === "function"
            ? nextCurrentMove(state.currentMove)
            : nextCurrentMove,
        }))
      },
    }
  }),
)

const calculateWinner = (squares: Squares): SquareValue => {
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ]

  for(let i = 0; i < lines.length; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

const calculateTurns = (squares: Squares): number => {
  return squares.filter(x => x === null).length;
}

const calculateStatus = (winner: SquareValue, turns: number, player: ('X' | 'O')): string => {
  if (!winner && !turns) return 'Draw';
  if (winner) return `Winner is ${winner}`;
  return `Next player: ${player}`;
}

const Board = ({ xIsNext, squares, onPlay  }: BoardProps) => {
  const player = xIsNext ? 'X' : 'O';
  const winner = calculateWinner(squares);
  const turns = calculateTurns(squares);
  const status = calculateStatus(winner, turns, player);

  const handleClick = (i: number): void => {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = player;
    onPlay(nextSquares);
  }
  
  return (
    <>
    <div style={{ marginBottom: '0.5rem' }}>{status}</div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        width: 'calc(3 * 2.5rem)',
        height: 'calc(3 * 2.5rem)',
        border: '1px solid #999',
      }}
    >    
      { squares.map((square, squareIndex) => (
        <Square key={squareIndex} value={square} onSquareClick={() => handleClick(squareIndex)} />
      ))
      } 
    </div>
    </>
  )
}

export default function Game() {
  const history = useGameStore((state) => state.history);
  const setHistory = useGameStore((state) => state.setHistory);
  const currentMove = useGameStore((state) => state.currentMove);
  const setCurrentMove = useGameStore((state) => state.setCurrentMove);
  const xIsNext = currentMove % 2 == 0;
  const currentSquares = history[currentMove];

  const handlePlay = (nextSquares: Squares): void => {
      const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares]);
      setHistory(nextHistory)
      setCurrentMove(nextHistory.length - 1);
  }

  const resetGame = (): void => {
   setHistory([Array(9).fill(null)]);
   setCurrentMove(0);
  }

  function jumpTo(nextMove: number): void {
    setCurrentMove(nextMove)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}>
        <div>
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay}/>
        </div>
        <div style={{ marginLeft: '1rem' }}>
          <ol>{
            history.map((_, historyIndex) => {
              const description = 
                historyIndex > 0
                ? `Go to move #${historyIndex}`
                : `Go to game start`

                return (
                  <li key={historyIndex}>
                    <button onClick={() => jumpTo(historyIndex)}>
                      {description}
                    </button>
                  </li>
                )
            })
            }</ol>
        </div>
        <button onClick={resetGame}>Reset Game</button>
    </div>
  )
}