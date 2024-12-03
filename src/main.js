import './style.css'

const numRows = 20;
const numCols = 20;
const delay = 40;
const dirs = [-1, 0, 1, 0, -1];
const nodes = Array(numRows * numCols).fill(0);

function initGrid(numRows, numCols) {
  const appContainer = document.getElementById("app");
  const gridContainer = document.createElement("div");
  gridContainer.classList.add("grid");
  for(let r = 0; r < numRows; r++){
    const row = document.createElement("div");
    row.classList.add("grid_row");
    for(let c = 0; c < numCols; c++){
      const cell = document.createElement("div");
      cell.id = `cell_row-${r}-col-${c}`
      cell.classList.add(["cell"])
      row.appendChild(cell);
    }
    gridContainer.appendChild(row);
  }
  appContainer.appendChild(gridContainer);
}

const isValidDir = (row_idx, col_idx) => {
  if (row_idx < 0 || row_idx >= numRows || col_idx < 0 || col_idx >= numCols) {
    return false;
  }
  return true;
}

function markCell(row_idx, col_idx, direction) {
  const cell = document.getElementById(`cell_row-${row_idx}-col-${col_idx}`);
  cell.classList.add(`open_${direction}`);
}

async function sleep(delay){
  return new Promise((resolve) => setTimeout(resolve, delay))
}

function generatePermutations(str) {
    const permutations = [];
    function permute(str, left, right) {
        if (left == right) {
            permutations.push([...str]);
        } else {
            for (let i = left; i <= right; i++) {
                str = swap(str, left, i);
                permute(str, left + 1, right);
                str = swap(str, left, i);
            }
        }
    }
    function swap(a, i, j) {
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
        return a;
    }
    permute(str, 0, str.length - 1);
    return permutations;
}

const permutations = generatePermutations([0, 1, 2, 3]);
function setActive (row_idx, col_idx) {
  const cell = document.getElementById(`cell_row-${row_idx}-col-${col_idx}`);
  cell.classList.add('active');
}
function clearActive (row_idx, col_idx) {
  const cell = document.getElementById(`cell_row-${row_idx}-col-${col_idx}`);
  if(cell.classList.contains("active")){
    cell.classList.remove('active');
  }
}

// logic for finding the neigbour direction
// 0 -> 2 => 00 -> 10
// 1 -> 3 => 01 -> 11
// 2 -> 0 => 10 -> 00
// 3 -> 1 => 11 -> 01
async function generateMaze(row_idx, col_idx){
  let perm = permutations[Math.floor(Math.random() * permutations.length)];
  setActive(row_idx, col_idx);
  for(let dir of perm){
    let _dir = dir ^ 2;
    let _row_idx = row_idx + dirs[dir];
    let _col_idx = col_idx + dirs[dir + 1];
    if(!isValidDir(_row_idx, _col_idx) || nodes[_row_idx * numCols + _col_idx] != 0) continue;

    nodes[row_idx * numCols + col_idx] = nodes[row_idx * numCols + col_idx] | (1 << dir);
    nodes[_row_idx * numCols + _col_idx] = nodes[_row_idx * numCols + _col_idx] | (1 << _dir);
    
    markCell(row_idx, col_idx, dir);
    markCell(_row_idx, _col_idx, _dir);
    await sleep(delay);
    clearActive(row_idx, col_idx);
    await generateMaze(_row_idx, _col_idx);
    setActive(row_idx, col_idx);
  }
  clearActive(row_idx, col_idx);
}

initGrid(numRows, numCols)
generateMaze(0, 0)
