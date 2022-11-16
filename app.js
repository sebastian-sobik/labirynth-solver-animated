let numBoxes = 25;
let numRows = 5;
let numCols = 5;

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

fixElementsQuantity(0, numBoxes);


// ==== Cursor ====

let cursor = {col_idx: 0, row_idx: 0}; // we established x,y distance before

function move__Valid__Cursor(direction = '', cursor = undefined) {
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

function setPathColor(grid_el, clr) {
    grid_el.style.backgroundColor = clr;
}

function getGridElement(index) {
    return document.querySelector(".grid").children[index];
}


// ==== Validation ====

function getDirection(key) {
    if(key == "ArrowUp") return 'U';
    if(key == "ArrowDown") return 'D';
    if(key == "ArrowLeft") return 'L';
    if(key == "ArrowRight") return 'R';
    return '';
}

function ifCrossedBounds(direction, cursor) {
    const {col_idx : x, row_idx : y} = cursor;
    if(direction == 'U' && (y - 1) >= 0) {return false};
    if(direction == 'D' && (y + 1) < numRows) {return false};
    if(direction == 'L' && (x - 1) >= 0) {return false};
    if(direction == 'R' && (x + 1) < numCols) {return false};
    return true;
}


// ==== Testing part ====

const clr = "#BABDFE";

document.addEventListener("keydown", (e) => {
    const direction = getDirection(e.key);
    if(!ifCrossedBounds(direction, cursor)) {
        move__Valid__Cursor(direction, cursor);
    }
    const grid_el  = getGridElement(calcChildIndex(cursor));
    setPathColor(grid_el, clr);
    setTimeout(()=>{grid_el.style.backgroundColor=''},1000);
})