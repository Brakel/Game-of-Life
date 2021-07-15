/**
 * The universe of the Game of Life is an infinite, two-dimensional orthogonal
 * grid of square cells, each of which is in one of two possible states, live
 * or dead, (or populated and unpopulated, respectively). Every cell interacts
 * with its eight neighbours, which are the cells that are horizontally, vertically, 
 * or diagonally adjacent. At each step in time, the following transitions occur:
 *
 *   1. Any live cell with fewer than two live neighbours dies, as if by underpopulation.
 *   2. Any live cell with two or three live neighbours lives on to the next generation.
 *   3. Any live cell with more than three live neighbours dies, as if by overpopulation.
 *   4. Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 *
 * These rules, which compare the behavior of the automaton to real life, can be condensed 
 * into the following:
 *
 *   1. Any live cell with two or three live neighbours survives.
 *   2. Any dead cell with three live neighbours becomes a live cell.
 *   3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
 *
 * The initial pattern constitutes the seed of the system. The first generation is
 * created by applying the above rules simultaneously to every cell in the seed, live
 * or dead; births and deaths occur simultaneously, and the discrete moment at which
 * this happens is sometimes called a tick. Each generation is a pure function of the
 * preceding one. The rules continue to be applied repeatedly to create further generations.
 *
 * https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
 */


const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvasWidth = 800;
const canvasHeight = 800;
const cellsPerRow = 100;


canvas.width = canvasWidth;
canvas.height = canvasHeight;

/**
 * Class representing a cell
 */
class Cell {
    /**
     * Create a cell
     * @param {Array} position 
     * @param {number} size 
     * @param {Array} neighbours 
     */
    constructor(position, size, neighbours) {
        this.alive = Math.random() < 0.1;
        this.neighbours = neighbours;
        this.livingNeighbous = 0;
        this.position = position;
        this.size = size;
    }
}

/**
 * Class representing a board
 */
class Board {
    /**
     * Create a board
     * @param {number} width 
     * @param {number} height 
     */
    constructor(rowLength) {
        /** @type {number} Amount of cells each row contains */
        this.rowLength = rowLength;
        /** @type {number} Amount of cells each column contains */
        this.columnLength = canvas.height / (canvas.width / cellsPerRow);
        /** @type {Array.<number>} Array of cells the board contains*/
        this.cells = [];
        /** @type {number} Size of an individual cell in pixels */
        this.cellSize = canvas.width / cellsPerRow;
    }

    /**
     * Get the area of the board
     * @return {number} Area of the board
     */
    get getCellCount() {
        return this.rowLength * this.columnLength;
    }
}

/** @type {object.<string, Array.<number>>} Row/column indices to apply 
 * to move from a cell in a particular direction */
Board.directions = [
    [-1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, -1],
];

/**
 * Initialises the cells array with Cells
 */
Board.prototype.init = function () {
    this.cells = [];
    for (let row = 0; row < this.columnLength; row++) {
        this.cells.push([])
        for (let col = 0; col < this.rowLength; col++) {
            this.cells[row].push(new Cell([row, col], this.cellSize, this.getNeighbours(row, col)));
        }
    }
    this.draw();
}

/**
 * Draws each cell to the canvas
 */
Board.prototype.draw = function () {
    for (let row = 0; row < this.columnLength; row++) {
        for (let col = 0; col < this.rowLength; col++) {
            let cell = this.cells[row][col];
            ctx.fillStyle = cell.alive ? `hsla(${cell.position[0] + cell.position[1] * 4}, 80%, 80%, 1)` : `hsla(240, 30%, 20%, 100%)`;
            ctx.fillRect(cell.position[1] * cell.size, cell.position[0] * cell.size, cell.size, cell.size);
        }
    }
}

/**
 * Returns whether a given position is valid on the board
 * @param {number} row 
 * @param {number} col 
 * @returns {boolean}
 */
Board.prototype.isInBounds = function (row, col) {
    return row >= 0 && row < this.columnLength && col >= 0 && col < this.rowLength;
}

/**
 * Takes the current cell position and returns its neighbour
 * @param {number} row 
 * @param {number} col 
 * @returns {Array} An array of x, y positions on the board
 */
Board.prototype.getNeighbours = function (row, col) {
    let neighboursArr = [];
    for (let i = 0; i < Board.directions.length; i++) {
        if (this.isInBounds(row + Board.directions[i][0], col + Board.directions[i][1])) {
            neighboursArr.push([row + Board.directions[i][0], col + Board.directions[i][1]]);
        }
    }
    return neighboursArr;
}

/**
 * Loops through the cells array and updates livingNeighbours
 */
Board.prototype.updateLivingNeighbours = function () {
    for (let row = 0; row < this.columnLength; row++) {
        for (let col = 0; col < this.rowLength; col++) {
            let cell = this.cells[row][col];
            cell.livingNeighbous = 0;
            for (let i = 0; i < cell.neighbours.length; i++) {
                let n = cell.neighbours[i];
                if (this.cells[n[0]][n[1]].alive)
                    cell.livingNeighbous++;
            }
        }
    }
}

/**
 * Loops through the cells array and updates the alive boolean
 */
Board.prototype.updateAliveStatus = function () {
    for (let row = 0; row < this.columnLength; row++) {
        for (let col = 0; col < this.rowLength; col++) {
            let cell = this.cells[row][col];
            if (cell.alive) {
                if (cell.livingNeighbous < 2 || cell.livingNeighbous > 3) cell.alive = false;
            }
            if (!cell.alive) {
                if (cell.livingNeighbous === 3) cell.alive = true;
            }
        }
    }
}

let lastTime;

class AnimationController {

    constructor(fps) {
        this.fps = fps;
        this.board = new Board(cellsPerRow);
        this.isPlaying = false;
        this.tref = 0; // Reference to the rAF time
        this.board.init();
    }

    animate = (time) => {
        console.log(time - lastTime);
        lastTime = time;


        this.board.updateLivingNeighbours();
        this.board.updateAliveStatus();
        this.board.draw();

        setTimeout(() => {
            this.isPlaying ?
                this.tref = requestAnimationFrame(this.animate) :
                cancelAnimationFrame(this.tref);
        }, 1000 / this.fps);
    }

    pause = () => {
        if (this.isPlaying) {
            this.isPlaying = false;
        }
    }

    play = () => {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.tref = requestAnimationFrame(this.animate)
        }
    }

    restart = () => {
        this.pause();
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.board.init();
    }
}

let ac = new AnimationController(5);

document.getElementById("play-btn").onclick = ac.play;
document.getElementById("pause-btn").onclick = ac.pause;
document.getElementById("restart-btn").onclick = ac.restart;