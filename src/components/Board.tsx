import { Square } from "./Square"
import { create } from 'zustand'
import { combine } from 'zustand/middleware';

type SquareValue = 'X' | 'O' | null;
type Squares = SquareValue[];

type GameState = {
  squares: Squares;
  xIsNext: boolean;
  history: Squares[];
}

type GameActions = {
  setSquares: (
    next: Squares | ((prev: Squares) => Squares)
  ) => void;
  setXIsNext: (
    next: boolean | ((prev: boolean) => boolean)
  ) => void;
  setHistory: (
    next: Squares[] | ((prev: Squares[]) => Squares[])
  ) => void;
}

const useGameStore = create(
  combine< GameState, GameActions>({ 
    history: [Array(9).fill(null) as Squares], 
    squares: Array(9).fill(null) as Squares , 
    xIsNext:  true }, 
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
      setSquares: (nextSquares) => {
        set((state) => ({
          squares:
          typeof nextSquares === 'function'
          ? nextSquares(state.squares)
          : nextSquares,
        }))
      },
      setXIsNext: (nextXIsNext) => {
        set((state) => ({
          xIsNext:
            typeof nextXIsNext === 'function'
            ? nextXIsNext(state.xIsNext)
            : nextXIsNext,
        }))
      }
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

export default function Board() {
  const { squares, xIsNext, setXIsNext, setSquares } = useGameStore();
  const player = xIsNext ? 'X' : 'O';
  const winner = calculateWinner(squares);
  const turns = calculateTurns(squares);
  const status = calculateStatus(winner, turns, player);

  const handleClick = (i: number) => {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = player;
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  }

  const clearBoard = () => {
      setSquares(Array(9).fill(null));
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
    <button onClick={clearBoard}>Clear Board</button>
    </>
  )
}