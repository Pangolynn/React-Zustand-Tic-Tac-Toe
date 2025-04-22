import Board from './Board.tsx';

export default function Game() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        fontFamily: 'monospace',
      }}>
        <div>
          <Board />
        </div>
        <div style={{ marginLeft: '1rem' }}>
          <ol>{}</ol>
        </div>
    </div>
  )


}