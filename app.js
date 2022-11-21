// ==== Testing ====
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

    U() {return this.up}
    D() {return this.down}
    L() {return this.left}
    R() {return this.right}
    S() {return this.symbol}
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
    if(!startEl || !endEl) return -1;
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

function mapToNodeMap(map) {
    const nodeMap = create2DArray(numRows, numCols);
    let start;
    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const Node = createNode(new Cursor(c,r,numRows,numCols), map)
            nodeMap[r][c] = Node;
            if(Node.S()=='s') start = new Cursor(c,r);
        }
    }
    return {nodeMap: nodeMap, cursor: start};
}


class Labirynth {
    constructor(map) {
        const {nodeMap, cursor} = mapToNodeMap(map);
        this.nodeMap = nodeMap;
        this.startCursor = cursor;
        this.mapCursor = new Cursor(0,0);
    }

    searchPath(cursor = undefined, came_from = '', other_j_cursors = []) {
        if(cursor == undefined) return 0;
        let paths = [];
        let end = {end: ''};
        let path = "";

        while(1){
            const node = this.getNode(cursor);
            const ways = this.possibleWays.call(null, came_from, node, end);
            if(end.end) {path += end.end; return [path];}

            if(ways.length > 1) {// junction
               other_j_cursors.push(cursor);
               ways.forEach(dir => {
                    const _cursor = Object.assign(Object.create(Object.getPrototypeOf(cursor)), cursor);
                    const _other_j = Object.assign(Object.create(Object.getPrototypeOf(other_j_cursors)), other_j_cursors);
                    _cursor.move(dir);
                    let new_paths = this.searchPath(_cursor, this.oppositeMove(dir), _other_j);
                    new_paths.forEach(new_path => paths.push(path + dir + new_path));
               });
               break;
            }
            else if (ways.length === 1) {
                cursor.move(ways[0])
                came_from = this.oppositeMove(ways[0]);
                path += ways[0];
            }
            else if (ways.length === 0) {paths = []; break;}
            if(other_j_cursors.some(j_cur => {
                return cursor.compare(j_cur);
            })) {paths = []; break;}
        }

        //robi ruch
        return paths;
    }


    possibleWays(came_from, node, end){
        return(['R', 'L', 'U', 'D'].filter(dir=>{
            if(dir === came_from) return false;
            const next_block_symbol = node[dir]();
            if(next_block_symbol === 'e') end.end = dir;
            if(next_block_symbol === '#' || next_block_symbol === 's') return false;
            return true;
        }))
    }

    getNode({col_idx : x, row_idx : y}) {return this.nodeMap[y][x];};

    oppositeMove(d) {
        if(d === 'U') return 'D';
        if(d === 'D') return 'U';
        if(d === 'L') return 'R';
        if(d === 'R') return 'L';
    }
}

// === Customising map ===

let isClicking = false;
let startEl = document.querySelector('.start');
let endEl = document.querySelector('.end');
let curr_fill_mode = "wall";
let curr_draw_mode = "draw";



const init = () => {

    function clearStyle(e){if(!e)return;checkIfStartEnd(e);e.classList.remove('wall','start', 'end');}
    function addStyle(e, className="") {clearStyle(e);if(className) e.classList.add(className);}
    function checkIfStartEnd(e) {
        if(e){
            if(e.classList.contains('start')) {startEl = null;}
            else if(e.classList.contains('end')) {endEl = null;}
        }
    }

    function drawStyle(e) {
        if(curr_fill_mode === "start") {
            clearStyle(startEl);
            startEl = e;
        }
        else if(curr_fill_mode === "end") {
            clearStyle(endEl);
            endEl = e;
        }
        else{
            clearStyle(e);
        }
        addStyle(e, curr_fill_mode);
    }


    ["touchstart", "mousedown"].forEach(x => document.addEventListener(x, ()=>{isClicking = true;}));
    ["touchend", "mouseup"].forEach(x => document.addEventListener(x, ()=>{isClicking = false;}));
    ["mouseover", "mouseout"].forEach(x => document.querySelector('.grid').addEventListener(x, e=>{
        if(!isClicking || curr_fill_mode === "start" || curr_fill_mode === "end") return;
        if(curr_draw_mode === "delete") clearStyle(e.target);
        else drawStyle(e.target);
    }))

    document.querySelector('.grid').addEventListener("mousedown", (e)=>{
        if(curr_draw_mode === "delete" || e.button === 2 ) clearStyle(e.target);
        else drawStyle(e.target);
    });
    document.querySelector('.grid').addEventListener("contextmenu", (e)=>{e.preventDefault()})
    document.querySelector(".fill-mode").addEventListener("change", e => curr_fill_mode = e.target.id);
    document.querySelector(".edit-mode").addEventListener("change", e => curr_draw_mode = e.target.id);
}

window.onload = init;




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