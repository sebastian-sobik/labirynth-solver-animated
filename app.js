let numBoxes = 25;
let numRows = 5;
let numCols = 5;

// ==== Cursor ====

let cursor = {col_idx: 0, row_idx: 0};

function moveCursor(direction = '', cursor = undefined) {
    if(cursor == undefined || direction == '') return ;
    if(direction == 'U') {cursor.row_idx -= 1};
    if(direction == 'D') {cursor.row_idx += 1};
    if(direction == 'L') {cursor.col_idx -= 1};
    if(direction == 'R') {cursor.col_idx += 1};
}

function calcChildIndex(cursor) {
    const {col_idx : x, row_idx : y} = cursor;
    if(x < 0 || x > (numCols-1)) return -1;
    if(y < 0 || y > (numRows-1)) return -1;
    return y * numCols + x;
}

// ==== GET / SET ====

function setPathColor(grid_element, clr) {
    grid_element.style.backgroundColor = clr;
}

function getGridElement(index) {
    return document.querySelector(".grid").children[index];
}

function getValFromMap({col_idx : x, row_idx : y}, map) {
    return map[y][x];
}

// ==== Validation ====

function isCrossingBound(direction, cursor) {
    const {col_idx : x, row_idx : y} = cursor;
    if(direction == 'U' && (y - 1) >= 0) {return false};
    if(direction == 'D' && (y + 1) < numRows) {return false};
    if(direction == 'L' && (x - 1) >= 0) {return false};
    if(direction == 'R' && (x + 1) < numCols) {return false};
    return true;
}

// ==== Labirynth parser ====

class Cursor {
    constructor(x, y){
        this.col_idx = x;
        this.row_idx = y;
    }
}

class Node {
    constructor(up, down, left, right, symbol) {
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.symbol = symbol;
    }

    Up() {return this.up}
    Down() {return this.down}
    Left() {return this.left}
    Right() {return this.right}
    Symbol() {return this.symbol}
}

function create2DArray(rows, cols) {
    const arr = [];
    for (let index = 0; index < rows; index++) {
        arr.push(new Array(cols));
    }
    return arr;
}

function parseBlockToSymbol(block) {
    if(block.classList.contains("start")) return 's';
    if(block.classList.contains("end")) return 'e';
    if(block.classList.contains("wall")) return '#';
    else return '.';
}

function labToString() {
    const grid = document.querySelector(".grid");
    const map = create2DArray(numRows, numCols);
    for (let i = 0; i < grid.children.length ; i++) {
         const symbol = parseBlockToSymbol(grid.children[i]);
         const x = i%(numCols);
         const y = Math.floor(i/numCols)
         map[y][x] = symbol;
    }
    return map;
}

function createNode(cursor = undefined, map = undefined) {
    if(!cursor && !map) return -1;
    return new Node(...['U', 'D', 'L', 'R', ''].map(direction => {
        let _cursor = {...cursor};
        if(isCrossingBound(direction, _cursor) && direction != ''){return '#'}
        moveCursor(direction, _cursor);

        return getValFromMap(_cursor, map);
    }));
}

function findStart(NodeMap) {
    for (let row = 0; row < NodeMap.length; row++) {
        for (let col = 0; col < NodeMap[row].length; col++) {
            if(NodeMap[row][col].Symbol() == 's') return new Cursor(col, row)
        }
    }
    return -1;
}

function mapToNodeMap(map) {
    const nodeMap = create2DArray(numRows, numCols);
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            nodeMap[r][c] = createNode({col_idx : c, row_idx : r}, map);
        }
    }
    return nodeMap;
}

const NodeMap = mapToNodeMap(labToString());


// ==== Testing part ====

const clr = "#BABDFE";

function getDirection(key) {
    if(key == "ArrowUp") return 'U';
    if(key == "ArrowDown") return 'D';
    if(key == "ArrowLeft") return 'L';
    if(key == "ArrowRight") return 'R';
    return '';
}

document.addEventListener("keydown", (e) => {
    const direction = getDirection(e.key);
    if(!isCrossingBound(direction, cursor)) {
        moveCursor(direction, cursor);
    }
    const grid_el  = getGridElement(calcChildIndex(cursor));
    setPathColor(grid_el, clr);
    setTimeout(()=>{grid_el.style.backgroundColor=''},1000);
})

function printMap(map) {
    for (const row of map) {
            let r = "";
            for (let index = 0; index < row.length; index++) {
                r+=row[index] + " ";
            }
            console.log(r);
        }
}


// ==== Maintaining grid size ====


function fixElementsQuantity(numBefore, numNow) {
    const difference = numBefore - numNow;
    if(difference < 0) //adding
        addGridElements(-difference);
    else if(difference > 0) //removing
        removeGridElements(difference);
}

function addGridElements(num) {
    const gridDOM = document.querySelector(".grid");
    for (let index = 0; index < num; index++)
        gridDOM.append(createGridElement());
}

function removeGridElements(num) {
    const gridDOM = document.querySelector(".grid");
    for (let index = 0; index < num; index++)
        gridDOM.lastElementChild.remove();
}

function createGridElement(){
    const el = document.createElement("div");
    el.classList.add("grid-element");
    return el;
}

document.querySelector(".axis").addEventListener("change", function(e){
    const {name, value} = e.target;

    if(name == "x") {
        document.documentElement.style.setProperty("--colNum", value);
        numCols = value;
    }
    else if (name == "y") {
        document.documentElement.style.setProperty("--rowNum", value);
        numRows = value;
    }

    fixElementsQuantity(numBoxes, numRows*numCols);
    numBoxes = numRows*numCols;
})

//fixElementsQuantity(0, numBoxes);

