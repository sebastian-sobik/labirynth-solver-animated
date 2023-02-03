import { Cursor, getChildIndex } from "./Cursor.js";
import { Node } from "./Node.js";
import { create2DArray, parseGridElementToSymbol, getGridElement, getValFromMap, setPathColor, removeOrangePath, makeCopy } from "./Utilities.js";
import * as Grid from "./Grid.js";
import { drawStyle, clearStyle } from "./Drawing.js";

// Settings
export let _NROWS  = 20;
export let _NCOLS = 20;
let _NBOXES = _NROWS * _NCOLS;
const DISPLAY_TIME = 50;
export let fill_mode = "wall";

// GRID elements
export let lab_obj = {
    StartElement : document.querySelector('.start'),
    EndElement : document.querySelector('.end')
}
let isClicking = false;
export let isDrawing = false;

// Algorithm
let labirynth;
let nothingChanged = false;

// Utilities
let menuIndex = 0;
const grid = document.querySelector(".grid");

function labToString() {
    if(!lab_obj.StartElement || !lab_obj.EndElement) return;

    const map = create2DArray(_NROWS, _NCOLS);
    const grid_elements = grid.children;

    for (let i = 0; i < grid_elements.length ; i++) {
         const x = i % _NCOLS;
         const y = Math.floor(i/_NCOLS);
         map[y][x] = parseGridElementToSymbol(grid_elements[i]);
    }
    return map;
}


function stringMapToNodeMap(map) {
    if(!map) return;

    const nodeMap = create2DArray(_NROWS, _NCOLS);

    let start;
    for (let row = 0; row < _NROWS; row++) {
        for (let col = 0; col < _NCOLS; col++) {
            const node = createNode(new Cursor(col, row, _NROWS, _NCOLS), map);
            nodeMap[row][col] = node;

            if(node.S()=='s')
                start = new Cursor(col,row);
        }
    }
    return {nodeMap: nodeMap, cursor: start};
}

function createNode(cursor, map) {
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

    detectInfiniteLoop(prev_junctions, global_cursor) {
        return prev_junctions.some(junction_cur => {return global_cursor.compare(junction_cur)})
    }

    searchPath(cursor, came_from = '', prev_junctions = [], min_moves = 0) {

        let end = {end: ''};
        let path = '';
        let junc_path = '';

        let moves_counter = 0;
        let global_cursor = Object.assign(Object.create(Object.getPrototypeOf(cursor)), cursor);


        while(1)
        {
            // [1st] We are interested in best path, so we skip longer ones immediately
            // [2nd] We detect infinite loops
            if(
            (++moves_counter >= min_moves && min_moves > 0)
            || this.detectInfiniteLoop(prev_junctions, global_cursor))
            {
                path = "";
                break;
            }

            const node = this.getNode(global_cursor);

            // Returns array of possible ways
            const ways = this.possibleWays.call(null, came_from, node, end);

            // If there is end next to us, we skip everything and return current path + move
            if(end.end) return [path += end.end];

            if(ways.length === 0)
            {
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
                    const _cursor = makeCopy(global_cursor);
                    const prev_junctions_copy = makeCopy(prev_junctions);

                    _cursor.move(direction);
                    const returned_path = this.searchPath(_cursor, this.oppositeMove(direction), prev_junctions_copy,  min_moves);

                    if((min_moves == 0 || returned_path.length < min_moves) && returned_path.length > 0)
                    {
                        junc_path = direction + returned_path;
                        min_moves = junc_path.length;
                    }
                });

               // There is no way to end throught this junction
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

        // Found final path to the end
        return path + junc_path;

    }

    possibleWays(came_from, node, end)
    {
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





    ["touchstart", "mousedown"].forEach(x => grid.addEventListener(x, ()=>{  isClicking = true   }));
    ["touchend",   "mouseup"  ].forEach(x => grid.addEventListener(x, ()=>{  isClicking = false  }));


    // Drawing while holding left/right button
    ["mouseover",  "mouseout" ].forEach(x => grid.addEventListener(x, e => {
        if(!isClicking || fill_mode === "start" || fill_mode === "end") return;
        else drawStyle(e.target);
    }))

    grid.addEventListener("mousedown", (e)=>{
        if(nothingChanged) {
            nothingChanged = false;
            isDrawing = false;
            removeOrangePath();
        }
        if(e.button === 2 || fill_mode === "path")
            clearStyle(e.target);
        else
            drawStyle(e.target);
    });

    // Prevent right click menu from showing
    grid.addEventListener("contextmenu", e => e.preventDefault());

    [".axis", ".grid"].forEach(
        x => document.querySelector(x).addEventListener("click", ()=>{
            isDrawing = false;
        })
    )

    // Changing fill-mode
    document.querySelector(".fill-mode").addEventListener("change", e => fill_mode = e.target.id);

    // Changing grid size
    document.querySelector(".axis select").addEventListener("change", function(e){
        const {value} = e.target;
        ["--colNum","--rowNum"].forEach(e=>document.documentElement.style.setProperty(e, value));
        _NROWS = _NCOLS = value;
        Grid.fixElementsQuantity(_NBOXES, _NROWS*_NCOLS);
        _NBOXES = _NROWS*_NCOLS;
    })

    // Running labirynth solver
    document.querySelector(".run-btn").addEventListener("click", ()=>{
        if(!lab_obj.StartElement || ! lab_obj.EndElement) return;
        isDrawing = false

        if(nothingChanged) {
            removeOrangePath();
            nothingChanged = false;
            return;
        }
        labirynth = new Labirynth( labToString() );
        let path = labirynth.searchPath(labirynth.startCursor);

        if(path) displayPath(path);
        nothingChanged = true;
    })

    // Filling grid with walls
    document.querySelector(".btn-wall").addEventListener("click", ()=>{
        grid.childNodes.forEach(element => {
            element.classList = "grid-element wall";
            element.style = "";
        });
    })

    // Clearing grid
    document.querySelector(".btn-clear").addEventListener("click", ()=>{
        grid.childNodes.forEach(element => {
            element.classList = "grid-element";
            element.style = "";
        });
    })

    // Filling grid with random elements
    document.querySelector(".btn-random").addEventListener("click", ()=>{
        grid.childNodes.forEach(element => {
            element.classList = "grid-element " + ((Math.random() > 0.5) ? "wall" : "path");
            element.style = "";
        });
    })

    // Changing fill-mode with by scrolling
    document.addEventListener("wheel", ({wheelDeltaY})=>{
        const menu = ["#wall", "#path", "#start","#end"].map( query => document.querySelector(query));
        const scrolledUp = wheelDeltaY > 0;

        if(scrolledUp && menuIndex > 0)
            menuIndex--;
        else if(!scrolledUp && menuIndex < menu.length - 1)
            menuIndex++;

        menu[menuIndex].click();
    })

}

function displayPath(path = "") {
    const cursor = makeCopy(labirynth.startCursor);
    cursor.move(path[0]);
    isDrawing = true;
    let i = 1;


    let s = setInterval(()=>{
        const gridElement = getGridElement(getChildIndex(cursor));
        setPathColor(gridElement, "#fdc843");
        cursor.move(path[i++]);

        if(i == path.length || !isDrawing) clearInterval(s);
    }, DISPLAY_TIME)
}


