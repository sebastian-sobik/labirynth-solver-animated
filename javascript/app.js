import { Cursor } from "./Cursor.js";
import { Node } from "./Node.js";
import { create2DArray, parseBlockToSymbol, getGridElement, getValFromMap, setPathColor, removeOrangePath } from "./Utilities.js";
import * as Grid from "./Grid.js";

let _NROWS  = 20;
let _NCOLS = 20;
let _NBOXES = _NROWS * _NCOLS;

let startElement = document.querySelector('.start');
let endElement = document.querySelector('.end');
let isClicking = false;
let fill_mode = "wall";
let nothingChanged = false;
let lab;

// ==== Labirynth parser ====
function createNode(cursor = undefined, map = undefined) {
    if(!cursor || !map)  return;
    let _cursor = Object.create(Object.getPrototypeOf(cursor));
    return new Node(...['U', 'D', 'L', 'R', ''].map(direction => {
        Object.assign(_cursor, cursor);
        if(_cursor.move(direction)) return getValFromMap(_cursor, map);
        else return '#';
    }));
}

// Drawn labirynth -> return : 2D arr of symbols
function labToString() {
    if(!startElement || !endElement) return;

    const grid = document.querySelector(".grid");
    const map = create2DArray(_NROWS, _NCOLS);
    for (let i = 0; i < grid.children.length ; i++) {
         const x = i % _NCOLS;
         const y = Math.floor(i/_NCOLS)
         map[y][x] = parseBlockToSymbol(grid.children[i]);
    }
    return map;
}

// Array of symbols -> return : 2D arr of nodes, cursor with start indexes
function stringMapToNodeMap(map = undefined) {
    if(!map) return;
    const nodeMap = create2DArray(_NROWS, _NCOLS);

    let start;
    for (let r = 0; r < _NROWS; r++) {
        for (let c = 0; c < _NCOLS; c++) {
            const Node = createNode(new Cursor(c,r,_NROWS,_NCOLS), map);
            nodeMap[r][c] = Node;

            if(Node.S()=='s')
                start = new Cursor(c,r);
        }
    }
    return {nodeMap: nodeMap, cursor: start};
}



class Labirynth {
    constructor(map) {
        const {nodeMap, cursor} = stringMapToNodeMap(map);
        this.nodeMap = nodeMap;
        this.startCursor = cursor;
    }

    searchPath(cursor = undefined, came_from = '', other_j_cursors = []) {

        if(cursor == undefined) return 0;

        let paths = [];
        let end = {end: ''};
        let path = "";

        let global_cursor = Object.assign(Object.create(Object.getPrototypeOf(cursor)), cursor);
        while(1){

            if( other_j_cursors.some(j_cur => {return global_cursor.compare(j_cur)}) )
                {paths = []; break;}

            const node = this.getNode(global_cursor);
            const ways = this.possibleWays.call(null, came_from, node, end);

            if(end.end) return [path += end.end];
            // if(end.end) {path += end.end; return [path]}

            if(ways.length > 1) {// junction
               other_j_cursors.push(global_cursor);
               ways.forEach(direction => {
                    const _cursor = Object.assign(Object.create(Object.getPrototypeOf(global_cursor)), global_cursor);
                    const _other_j = Object.assign(Object.create(Object.getPrototypeOf(other_j_cursors)), other_j_cursors);

                    _cursor.move(direction);

                    let new_paths = this.searchPath(_cursor, this.oppositeMove(direction), _other_j);
                    new_paths.forEach(new_path => paths.push(path + direction + new_path));
               });
               break;
            }
            else if (ways.length === 1) {
                global_cursor.move(ways[0])
                came_from = this.oppositeMove(ways[0]);
                path += ways[0];
            }
            else if (ways.length === 0) {paths = []; break;}
        }
        return paths;
    }


    possibleWays(came_from, node, end){
        return(['R', 'L', 'U', 'D'].filter( direction => {
            if(direction === came_from) return false;

            const next_block_symbol = node[direction]();
            if(next_block_symbol === 'e') end.end = direction;
            if(next_block_symbol === '#' || next_block_symbol === 's') return false;
            return true;
        }))
    }

    getNode({col_idx : x, row_idx : y}) {return this.nodeMap[y][x];};

    oppositeMove(d) {
        if(d === 'U') return 'D'
        else if(d === 'D') return 'U';
        if(d === 'L') return 'R'
        else if(d === 'R') return 'L';
    }
}


const init = () => {

    function clearStyle(e){
        if(!e) return;

        if(e.classList.contains('start')) {startElement = null;}
        else if(e.classList.contains('end')) {endElement = null;}

        e.classList.remove('wall','start', 'end');
    }

    function addStyle(e, className="") {
        clearStyle(e);
        if(className)
            e.classList.add(className);
        }


    function drawStyle(e) {
        if(fill_mode === "start") {
            clearStyle(startElement);
            startElement = e;
        }
        else if(fill_mode === "end") {
            clearStyle(endElement);
            endElement = e;
        }

        addStyle(e, fill_mode);
    }


    ["touchstart", "mousedown"].forEach(x => document.addEventListener(x, ()=>{  isClicking = true   }));
    ["touchend", "mouseup"].forEach(x => document.addEventListener(x,     ()=>{  isClicking = false  }));

    ["mouseover", "mouseout"].forEach(x => document.querySelector('.grid').addEventListener(x, e=>{
        if(!isClicking || fill_mode === "start" || fill_mode === "end") return;
        else drawStyle(e.target);
    }))

    document.querySelector('.grid').addEventListener("mousedown", (e)=>{
        if(nothingChanged) {nothingChanged = false; removeOrangePath();}
        if(e.button === 2 || fill_mode === "path") clearStyle(e.target);   //? Change
        else drawStyle(e.target);
    });

    document.querySelector(".fill-mode").addEventListener("change", e => fill_mode = e.target.id);

    document.querySelector('.grid').addEventListener("contextmenu", e => e.preventDefault());

    document.querySelector(".axis select").addEventListener("change", function(e){
        const {value} = e.target;
        ["--colNum","--rowNum"].forEach(e=>document.documentElement.style.setProperty(e, value));
        _NROWS = _NCOLS = value;
        Grid.fixElementsQuantity(_NBOXES, _NROWS*_NCOLS);
        _NBOXES = _NROWS*_NCOLS;
    })

    document.querySelector(".run-btn").addEventListener("click", ()=>{
        if(!startElement || ! endElement) return;
        if(nothingChanged) {
            removeOrangePath();
            nothingChanged = false;
            return;
        }

        lab = new Labirynth( labToString() );
        let paths = lab.searchPath(lab.startCursor);

        if(paths.length === 0) return;
        let path = paths.reduce(function(a, b) {
            return a.length <= b.length ? a : b;
          });

        displayPath(path);
        nothingChanged = true;
    })

    document.querySelector(".btn-wall").addEventListener("click", ()=>{
        document.querySelector(".grid").childNodes.forEach(element => {
            element.classList = "grid-element wall";
            element.style = "";
        });
    })

    document.querySelector(".btn-clear").addEventListener("click", ()=>{
        document.querySelector(".grid").childNodes.forEach(element => {
            element.classList = "grid-element";
            element.style = "";
        });
    })

    document.querySelector(".btn-random").addEventListener("click", ()=>{
        document.querySelector(".grid").childNodes.forEach(element => {
            element.classList = "grid-element " + ((Math.random() > 0.5) ? "wall" : "path");
            element.style = "";
        });
    })
}
window.onload = init;

function displayPath(path = "") {
    const cursor = Object.assign(Object.create(Object.getPrototypeOf(lab.startCursor)), lab.startCursor);
    for(let i = 0; i < path.length - 1; i++){
        cursor.move(path[i]);
        const dom_el = getGridElement(getChildIndex(cursor));
        setTimeout(setPathColor.bind(null, dom_el, "#fdc843"), i*150);
    }
}

function getChildIndex(cursor) {
    const {col_idx : x, row_idx : y} = cursor;
    if(x < 0 || x > (_NCOLS-1)) return -1;
    if(y < 0 || y > (_NROWS-1)) return -1;
    return y * _NCOLS + x;
}

