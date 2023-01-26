export class Node {
    constructor(up, down, left, right, symbol) {
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
        this.symbol = symbol;
    }

    U() {return this.up}
    D() {return this.down}
    L() {return this.left}
    R() {return this.right}
    S() {return this.symbol}
}