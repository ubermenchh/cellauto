const GRID_ROWS = 900;
const GRID_COLS = 900;
const CELL_SIZE = 7.5;

type State = "alive" | "dead";
type Grid = State[][];

function create_grid(alive_prob: number = 0.1): Grid {
    const grid: Grid = [];
    for (let i = 0; i < GRID_ROWS; i++) {
        grid.push(new Array(GRID_COLS).fill("dead").map(() =>
            Math.random() < alive_prob ? "alive" : "dead"
        ));
    }
    return grid;
}

let grid = create_grid();
const canvas_id = "canvas"
const canvas = document.getElementById(canvas_id) as HTMLCanvasElement;
if (canvas === null) {
    throw new Error(`Could not find canvas ${canvas_id}`)
}
const ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error(`Could not initialize Context`);
}

canvas.width = GRID_ROWS;
canvas.height = GRID_COLS;

function count_alive_nbors(grid: Grid, x: number, y: number): number {
    let count: number = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;

            const new_x = x + i;
            const new_y = y + j;

            if (new_x >= 0 && new_x < GRID_ROWS && new_y >= 0 && new_y < GRID_COLS) {
                if (grid[new_x][new_y] === "alive") {
                    count++;
                }
            }
        }
    }
    return count;
}

function compute_next_grid(current_grid: Grid): Grid {
    let next_grid: Grid = create_grid(0);

    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            const alive_nbors = count_alive_nbors(grid, r, c);

            if (current_grid[r][c] === "alive") {
                if (alive_nbors === 2 || alive_nbors === 3) {
                    next_grid[r][c] = "alive";
                } else {
                    next_grid[r][c] = "dead";
                }
            } else {
                if (alive_nbors === 3) {
                    next_grid[r][c] = "alive";
                } else {
                    next_grid[r][c] = "dead";
                }
            }
        }
    }
    return next_grid;
}

function render() {
    ctx.fillStyle = "#3A6D8C";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#EAD8B1";
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (grid[r][c] === "alive") {
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;
                ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function update() {
    grid = compute_next_grid(grid);
    render();
}

canvas.addEventListener("click", (e) => {
    const col = Math.floor(e.offsetX / CELL_SIZE);
    const row = Math.floor(e.offsetY / CELL_SIZE);
    grid[row][col] = "alive";

    render();
})

setInterval(update, 100);
