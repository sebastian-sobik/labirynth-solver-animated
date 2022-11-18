let numBoxes = 25;
let numRows = 5;
let numCols = 5;

// ==== Cursor ====

class Cursor {
    constructor(x, y, nRows = 0, nCols = 0){
        this.col_idx = x;
        this.row_idx = y;
        this.nRows = nRows;
        this.nCols = nCols;
        (nRows>0 && nCols>0) ? this.validate = true : this.validate = false;
    }
    offValidation() {this.validate = false}
    onValidation() {this.validate = true}
    move(direction = '') {
        if(direction == '') return 1;
        if(this.isInvalidMove(direction)) return 0;

        if(direction == 'U') {this.row_idx -= 1};
        if(direction == 'D') {this.row_idx += 1};
        if(direction == 'L') {this.col_idx -= 1};
        if(direction == 'R') {this.col_idx += 1};
        return 1;
    }
    isInvalidMove(direction) {
        const {col_idx : x, row_idx : y} = this;
        if(!this.validate) return false;
        if(direction == 'U' && (y - 1) >= 0) {return false};
        if(direction == 'D' && (y + 1) < this.nRows) {return false};
        if(direction == 'L' && (x - 1) >= 0) {return false};
        if(direction == 'R' && (x + 1) < this.nCols) {return false};
        return true;
    }
    compare(c) {return this.col_idx == c.col_idx && this.row_idx == c.row_idx;}
}

// ==== Labirynth parser ====

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

// * is it possible to skip copying cursor to _cursor that many times?

function createNode(cursor = undefined, map = undefined) {
    if(!cursor && !map)  return -1;
    return new Node(...['U', 'D', 'L', 'R', ''].map(direction => {
        const _cursor = Object.assign(Object.create(Object.getPrototypeOf(cursor)), cursor);
        if(_cursor.move(direction)) return getValFromMap(_cursor, map);
        else return '#';
    }));
}

// function findStart(NodeMap) {
//     for (let row = 0; row < NodeMap.length; row++) {
//         for (let col = 0; col < NodeMap[row].length; col++) {
//             if(NodeMap[row][col].Symbol() == 's') return new Cursor(col, row)
//         }
//     }
//     return -1;
// }

function mapToNodeMap(map) {
    const nodeMap = create2DArray(numRows, numCols);
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            nodeMap[r][c] = createNode(new Cursor(c,r,numRows,numCols), map);
        }
    }
    return nodeMap;
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

function getChildIndex(cursor) {
    const {col_idx : x, row_idx : y} = cursor;
    if(x < 0 || x > (numCols-1)) return -1;
    if(y < 0 || y > (numRows-1)) return -1;
    return y * numCols + x;
}

const NodeMap = mapToNodeMap(labToString());











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

