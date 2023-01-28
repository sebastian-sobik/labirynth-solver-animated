export function fixElementsQuantity(numBefore, numNow) {
    const difference = numBefore - numNow;

    if(difference < 0)
        addGridElements(-difference);
    else if(difference > 0)
        removeGridElements(difference);
}

export function addGridElements(num) {
    const grid = document.querySelector(".grid");

    for (let index = 0; index < num; index++)
        grid.append(createGridElement());
}

export function removeGridElements(num) {
    const grid = document.querySelector(".grid");

    for (let index = 0; index < num; index++)
        grid.lastElementChild.remove();
}

export function createGridElement(){
    const el = document.createElement("div");
    el.classList.add("grid-element");

    return el;
}