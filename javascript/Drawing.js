import {fill_mode, lab_obj} from "./app.js";


export function drawStyle(e) {
    if(fill_mode === "start") {
        clearStyle(lab_obj.StartElement);
        lab_obj.StartElement = e;
    }
    else if(fill_mode === "end") {
        clearStyle(lab_obj.EndElement);
        lab_obj.EndElement = e;
    }
    addStyle(e, fill_mode);
}

export function clearStyle(e) {
    if(!e) return;

    if(e.classList.contains('start')) {lab_obj.StartElement = null;}
    else if(e.classList.contains('end')) {lab_obj.EndElement = null;}

    e.classList.remove('wall','start', 'end');
}

function addStyle(e, className="") {
    clearStyle(e);
    if(className)
        e.classList.add(className);
}