// ==== Cursor ====

export class Cursor {

    constructor(x, y, nRows = 0, nCols = 0)
    {
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
        if(!this.validate) return false;

        const {col_idx : x, row_idx : y} = this;

        if      (direction == 'U' && (y - 1) >= 0)         {return false}
        else if (direction == 'D' && (y + 1) < this.nRows) {return false};
        if      (direction == 'L' && (x - 1) >= 0)         {return false}
        else if (direction == 'R' && (x + 1) < this.nCols) {return false};

        return true;
    }

    compare(c) {return this.col_idx == c.col_idx && this.row_idx == c.row_idx;}
}