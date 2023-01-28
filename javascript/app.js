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

function createNode(cursor = undefined, map = undefined) {
    if(!cursor || !map)  return;
    let _cursor = Object.create(Object.getPrototypeOf(cursor));
    return new Node(...['U', 'D', 'L', 'R', ''].map(direction => {
        Object.assign(_cursor, cursor);
        if(_cursor.move(direction)) return getValFromMap(_cursor, map);
        else return '#';
    }));
}


class Labirynth {
    constructor(map) {
        const {nodeMap, cursor} = stringMapToNodeMap(map);
        this.nodeMap = nodeMap;
        this.startCursor = cursor;
    }

    searchPath(cursor, came_from = '', prev_junctions = [], min_moves = 0) {

        let end = {end: ''};
        let path = '';
        let junc_path = '';

        let moves_counter = 0;
        let global_cursor = Object.assign(Object.create(Object.getPrototypeOf(cursor)), cursor);


        while(1)
        {
            if(++moves_counter >= min_moves && min_moves > 0) {
                path = "";
                break;
            }

            // Detect infinite loops
            if( prev_junctions.some(junction_cur => {return global_cursor.compare(junction_cur)}) ){
                path = "";
                break;
            }

            const node = this.getNode(global_cursor);
            const ways = this.possibleWays.call(null, came_from, node, end);

            // If there is end next to us, we skip everything and return current path + move
            if(end.end) return [path += end.end];


            if(ways.length === 0) {
                path = "";
                break;
            }
            // Encountered junction
            else if(ways.length > 1)
            {
               prev_junctions.push(global_cursor);

               //Recursion for each possible way
               ways.forEach( direction =>
                {
                    const _cursor = Object.assign(Object.create(Object.getPrototypeOf(global_cursor)), global_cursor);
                    const prev_junctions_copy = Object.assign(Object.create(Object.getPrototypeOf(prev_junctions)), prev_junctions);

                    _cursor.move(direction);
                    const returned_path = "" + this.searchPath(_cursor, this.oppositeMove(direction), prev_junctions_copy,  min_moves);

                    if((min_moves == 0 || returned_path.length < min_moves) && returned_path.length != 0)
                    {
                        junc_path = direction + returned_path;
                        min_moves = junc_path.length;
                    }
                });
               if(!junc_path) path = "";
               break;
            }
            // One possible way
            else if (ways.length === 1)
            {
                global_cursor.move(ways[0])
                came_from = this.oppositeMove(ways[0]);
                path += ways[0];
            }
        }

        // We have found final paths to the end
        return path + junc_path;

    }

    possibleWays(came_from, node, end) {
        return(['U', 'R', 'D', 'L',].filter( direction => {
            if(direction === came_from) return false;

            const next_symbol = node[direction]();
            if(next_symbol === 'e') end.end = direction;
            if(next_symbol === '#' || next_symbol === 's') return false;
            return true;
        }))
    }

    getNode({col_idx : x, row_idx : y}) {return this.nodeMap[y][x];};

    oppositeMove(direction) {
        if       (direction === 'U') return 'D'
        else if  (direction === 'D') return 'U';
        if       (direction === 'L') return 'R'
        else if  (direction === 'R') return 'L';
    }
}


window.onload = () => {

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

    function addStyle(e, className="") {
        clearStyle(e);
        if(className)
            e.classList.add(className);
    }

    function clearStyle(e){
        if(!e) return;

        if(e.classList.contains('start')) {startElement = null;}
        else if(e.classList.contains('end')) {endElement = null;}

        e.classList.remove('wall','start', 'end');
    }

    ["touchstart", "mousedown"].forEach(x => document.addEventListener(x, ()=>{  isClicking = true   }));
    ["touchend",   "mouseup"  ].forEach(x => document.addEventListener(x, ()=>{  isClicking = false  }));

    ["mouseover",  "mouseout" ].forEach(x => document.querySelector('.grid').addEventListener(x, e=>{
        if(!isClicking || fill_mode === "start" || fill_mode === "end") return;
        else drawStyle(e.target);
    }))

    document.querySelector('.grid').addEventListener("mousedown", (e)=>{
        if(nothingChanged) {
            nothingChanged = false;
            removeOrangePath();
        }

        if(e.button === 2 || fill_mode === "path")
            clearStyle(e.target);
        else
            drawStyle(e.target);
    });
    document.querySelector('.grid').addEventListener("contextmenu", e => e.preventDefault());

    document.querySelector(".fill-mode").addEventListener("change", e => fill_mode = e.target.id);

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
        let path = lab.searchPath(lab.startCursor);

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

function displayPath(path = "") {
    const cursor = Object.assign(Object.create(Object.getPrototypeOf(lab.startCursor)), lab.startCursor);
    for(let i = 0; i < path.length - 1; i++){
        cursor.move(path[i]);
        const dom_el = getGridElement(getChildIndex(cursor));
        setTimeout(setPathColor.bind(null, dom_el, "#fdc843"), i*100);
    }
}

function getChildIndex(cursor) {
    const {col_idx : x, row_idx : y} = cursor;
    if(x < 0 || x > (_NCOLS-1)) return -1;
    if(y < 0 || y > (_NROWS-1)) return -1;
    return y * _NCOLS + x;
}
