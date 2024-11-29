type Grid = boolean[][];
type Coords = { x: number, y: number };

const CONFIG = {
    GRID_SIZE: 125,
    CELL_SIZE: 10,
    ALIVE_PROB: 0.3,
};

function create_grid(size: number, prob: number = 0.3): Grid {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.random() < prob)
    );
}

function count_live_nbors(grid: Grid, x: number, y: number): number {
    const size = grid.length;
    let count = 0;

    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0)
                continue;

            const new_x = (x + dx + size) % size;
            const new_y = (y + dy + size) % size;

            if (grid[new_x][new_y]) count++;
        }
    }
    return count;
}

function compute_next_grid(current_grid: Grid): Grid {
    const size = current_grid.length;

    return current_grid.map((row, x) =>
        row.map((is_alive, y) => {
            const live_nbors = count_live_nbors(current_grid, x, y);

            if (is_alive) {
                return live_nbors === 2 || live_nbors === 3;
            } else {
                return live_nbors === 3;
            }
        })
    );
}

function render_grid(ctx: CanvasRenderingContext2D, grid: Grid, cell_size: number) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    grid.forEach((row, x) => {
        row.forEach((is_alive, y) => {
            if (is_alive) {
                ctx.fillStyle = "#999999";
                ctx.fillRect(x * cell_size, y * cell_size, cell_size - 1, cell_size - 1);
            }
        });
    });
}

const app = document.getElementById("app") as HTMLCanvasElement;
const ctx = app.getContext("2d")!;

app.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
app.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;

let current_grid = create_grid(CONFIG.GRID_SIZE, CONFIG.ALIVE_PROB);
let animation_frame_id: number | null = null;

function simulate() {
    current_grid = compute_next_grid(current_grid);
    render_grid(ctx, current_grid, CONFIG.CELL_SIZE);
    animation_frame_id = requestAnimationFrame(simulate);
}

function handle_canvas_click(event: MouseEvent) {
    const rect = app.getBoundingClientRect();

    const x = Math.floor((event.clientX - rect.left) / CONFIG.CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / CONFIG.CELL_SIZE);

    current_grid = current_grid.map((row, row_index) =>
        row.map((cell, col_index) =>
            row_index === x && col_index === y ? !cell : cell
        )
    );

    render_grid(ctx, current_grid, CONFIG.CELL_SIZE);
}

function start() {
    if (!animation_frame_id)
        simulate();
}

function stop() {
    if (animation_frame_id) {
        cancelAnimationFrame(animation_frame_id);
        animation_frame_id = null;
    }
}

function reset() {
    stop();
    current_grid = create_grid(CONFIG.GRID_SIZE, CONFIG.ALIVE_PROB);
    render_grid(ctx, current_grid, CONFIG.CELL_SIZE);
}

app.addEventListener("click", handle_canvas_click);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start")?.addEventListener("click", start);
    document.getElementById("stop")?.addEventListener("click", stop);
    document.getElementById("reset")?.addEventListener("click", reset);

    start();
});
