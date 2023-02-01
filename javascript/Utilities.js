export function create2DArray(rows, cols) {
    const arr = [];
    for (let index = 0; index < rows; index++) {
        arr.push(new Array(cols));
    }
    return arr;
}

export function parseGridElementToSymbol(gridElement) {
    if      (gridElement.classList.contains("start")) return 's';
    else if (gridElement.classList.contains("end"))   return 'e';
    else if (gridElement.classList.contains("wall"))  return '#';
    else return '.';
}

// ==== GET / SET ====

export function getGridElement(index) {
    return document.querySelector(".grid").children[index];
}

export function getValFromMap({col_idx : x, row_idx : y}, map) {
    return map[y][x];
}

export function setPathColor(grid_element, clr) {
    grid_element.style.backgroundColor = clr;
}

export function removeOrangePath() {
    document.querySelector(".grid").childNodes.forEach(element => {
        element.style = "";
    });
}

export function makeCopy(obj) {
    return Object.assign(Object.create(Object.getPrototypeOf(obj)), obj);
}