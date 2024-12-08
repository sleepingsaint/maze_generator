import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css'

const dirs = [-1, 0, 1, 0, -1];

interface CellProps {
  row_idx: number;
  col_idx: number;
  node_state: number;
  isActive: boolean;
}

function Cell(props: CellProps) {
  const { row_idx, col_idx, node_state, isActive } = props;
  let classNames = ['grid_cell'];
  for (let i = 0; i < 4; i++) {
    if ((node_state & (1 << i)) != 0) {
      classNames.push(`open_${i}`);
    }
  }
  if (isActive) {
    classNames.push("active");
  }
  return <div
    className={classNames.join(' ')}
    id={`row-${row_idx}-col-${col_idx}`}
    key={`row-${row_idx}-col-${col_idx}`}
  ></div>;
}

function generatePermutations(arr: Array<number>) {
  const permutations: Array<Array<number>> = [];
  function permute(arr: Array<number>, left: number, right: number) {
    if (left == right) {
      permutations.push([...arr]);
    } else {
      for (let i = left; i <= right; i++) {
        arr = swap(arr, left, i);
        permute(arr, left + 1, right);
        arr = swap(arr, left, i);
      }
    }
  }
  function swap(a: Array<number>, i: number, j: number) {
    const temp = a[i];
    a[i] = a[j];
    a[j] = temp;
    return a;
  }
  permute(arr, 0, arr.length - 1);
  return permutations;
}

function App() {
  const [numRows, setNumRows] = useState<number>(10);
  const [numCols, setNumCols] = useState<number>(10);
  const [fps, setFps] = useState<number>(60);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [nodes, setNodes] = useState<Array<number>>(Array(numRows * numCols).fill(0));
  const [stack, setStack] = useState<Array<{ x: number, y: number }>>([{ x: numRows - 1, y: 0 }]);

  useEffect(() => {
    setNodes(Array(numRows*numCols).fill(0));
    setStack([{x: numRows - 1, y: 0}])
  }, [numRows, numCols])

  const isValidDir = useCallback(
    (row_idx: number, col_idx: number) => {
      if (row_idx < 0 || row_idx >= numRows || col_idx < 0 || col_idx >= numCols) {
        return false;
      }
      return true;
    }, [numRows, numCols]);

  const permutations = useMemo(() => {
    let availablePerumtations = generatePermutations([0, 1, 2, 3]);
    const _permutations = [];
    for (let i = 0; i < nodes.length; i++) {
      const idx = Math.floor(Math.random() * availablePerumtations.length);
      _permutations.push(availablePerumtations[idx]);
    }
    return _permutations;
  }, [nodes.length])

  useEffect(() => {
    if (!isRunning || stack.length == 0) return;
    const _timeout = setTimeout(() => {
      const coord = stack[stack.length - 1];
      const permutation = permutations[coord.x * numCols + coord.y];
      var cellFound = false;
      for (const dir of permutation) {
        const _dir = dir ^ 2;
        const _coord = { x: coord.x + dirs[dir], y: coord.y + dirs[dir + 1] };
        if (!isValidDir(_coord.x, _coord.y) || nodes[_coord.x * numCols + _coord.y] != 0) {
          continue;
        }
        nodes[coord.x * numCols + coord.y] = nodes[coord.x * numCols + coord.y] | (1 << dir);
        nodes[_coord.x * numCols + _coord.y] = nodes[_coord.x * numCols + _coord.y] | (1 << _dir);
        cellFound = true;
        stack.push(_coord);
        break;
      }
      if (!cellFound) {
        stack.pop();
      }
      setNodes([...nodes]);
      setStack([...stack]);
    }, 1000 / fps);
    return () => clearTimeout(_timeout);
  }, [fps, isRunning, nodes, stack]);


  return (
    <div className='container'>
      <div className='controls'>
        <div>
          <p>Number of Rows: {numRows}</p>
          <input type="range" name="numRows" id="numRows" min={10} max={100} value={numRows} onChange={e => setNumRows(parseInt(e.target.value))} disabled={isRunning} />
        </div>
        <div>
          <p>Number of Cols: {numCols}</p>
          <input type="range" name="numCols" id="numCols" min={10} max={100} value={numCols} onChange={e => setNumCols(parseInt(e.target.value))} disabled={isRunning} />
        </div>
        <div>
          <p>FPS: {fps}</p>
          <input type="range" name="numCols" id="numCols" min={1} max={144} value={fps} onChange={e => setFps(parseInt(e.target.value))} />
        </div>
        <button onClick={() => setIsRunning(!isRunning)}>{isRunning ? "Pause": "Start"}</button>
      </div>
      <div className='grid'>
        {Array(numRows).fill(0).map((_, row_idx) => (
          <div className='grid_row' key={`row-${row_idx}`}>
            {Array(numCols).fill(0).map((_, col_idx) => <Cell
              key={`row-${row_idx}-col-${col_idx}`}
              row_idx={row_idx}
              col_idx={col_idx}
              node_state={nodes[row_idx * numCols + col_idx]}
              isActive={stack.length > 0 && (row_idx == stack[stack.length - 1].x && col_idx == stack[stack.length - 1].y)}
            />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
