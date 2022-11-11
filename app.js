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

function createGridElement(){
    const el = document.createElement("div");
    el.classList.add("grid-element");
    return el;
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