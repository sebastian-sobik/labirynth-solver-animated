import { pSBC } from "./colorGrader.js";

export function create2DArray(rows, cols) {
    const arr = [];
    for (let index = 0; index < rows; index++) {
        arr.push(new Array(cols));
    }
    return arr;
}

export function parseBlockToSymbol(block) {
    if(block.classList.contains("start")) return 's';
    if(block.classList.contains("end")) return 'e';
    if(block.classList.contains("wall")) return '#';
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
    const {backgroundColor} = grid_element.style;
    if(backgroundColor)
        grid_element.style.backgroundColor = pSBC(-0.2, backgroundColor);
    else {
        grid_element.style.backgroundColor = clr;
    }
}

export function removeOrangePath() {
    document.querySelector(".grid").childNodes.forEach(element => {
        element.style = "";
    });

}