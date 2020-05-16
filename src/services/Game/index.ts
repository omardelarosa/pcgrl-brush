import { TensorFlowService, RepresentationName } from "../TensorFlow";
import {
    TILES,
    MULTITILE_CRATE_TARGET,
    MULTITILE_PLAYER_TARGET,
} from "../../constants/tiles";
import { ACTIONS, EMPTY_SUGGESTED_GRIDS } from "../../constants";
import { abs } from "numjs";
import { timingSafeEqual } from "crypto";
import {
    DEFAULT_STAGE_GRID_SIZE,
    DEFAULT_PLAYER_POS,
} from "../../constants/index";
import _ from "lodash";

export enum Games {
    SOKOBAN,
    ZELDA,
}

export interface GameAction {
    name: string;
    value: any;
    action: ACTIONS;
}

export interface GeneratedMapResults {
    grids: number[][][];
    selectedAgents: RepresentationName[];
}

export class GameService {
    private game: Games;
    public actions: GameAction[];
    public hasWon: boolean = false;

    constructor(game: Games) {
        this.game = game;
        this.actions = [];
    }

    public movePlayer(
        direction: number[],
        grid: number[][],
        gridSize: number[] | [number, number],
        action: ACTIONS
    ) {
        /**
         *
         * SOKOBAN RULES:
         *
         */
        if (this.game === Games.SOKOBAN) {
            // Prevent further moves after winning
            if (this.hasWon) {
                return;
            }
            const pos = this.getPlayerPosFromGrid(grid, gridSize);
            // console.log("direction:", direction, playerPos);
            let nextGrid = null;
            if (pos) {
                nextGrid = grid;

                const nextPos: [number, number] = [
                    pos[0] + direction[0],
                    pos[1] + direction[1],
                ];

                // Guard against invalid positions
                if (!this.isValidPlayerPos(nextPos, grid, gridSize)) {
                    return;
                }

                let tileAtNextPos = grid[nextPos[0]][nextPos[1]];

                // Check for crate in next position...
                if (
                    tileAtNextPos === TILES.CRATE ||
                    tileAtNextPos === MULTITILE_CRATE_TARGET
                ) {
                    nextGrid = this.moveCrate(
                        nextPos,
                        direction,
                        nextGrid,
                        gridSize
                    );
                    // Could not move crate, move failed.
                    if (!nextGrid) {
                        console.log("could not move crate");
                        return;
                    }
                    console.log("moved crate!");
                    // update tile at next pos
                    tileAtNextPos = nextGrid[nextPos[0]][nextPos[1]];
                }

                // Check current position
                let tileAtCurrentPos = nextGrid[pos[0]][pos[1]];
                let nextPosTileValue = TILES.PLAYER;

                // Check for crate in next position...
                if (tileAtNextPos === TILES.TARGET) {
                    nextPosTileValue = MULTITILE_PLAYER_TARGET;
                }
                let prevPositionReplacement = TILES.EMPTY;

                // Check for multitile
                if (tileAtCurrentPos === MULTITILE_PLAYER_TARGET) {
                    prevPositionReplacement = TILES.TARGET;
                }

                nextGrid = this.applyUpdateToGrid(
                    nextGrid,
                    nextPos,
                    nextPosTileValue,
                    gridSize
                );

                // Replace prev tile
                nextGrid = this.applyUpdateToGrid(
                    nextGrid,
                    pos,
                    prevPositionReplacement,
                    gridSize
                );

                // console.log("move:", direction, "next_grid: ", nextGrid);
                this.actions.push({ name: "move", value: direction, action });

                const hasWon = this.didWin(nextGrid, gridSize);
                if (hasWon) {
                    this.actions.push({
                        name: "win",
                        value: null,
                        action: ACTIONS.WIN,
                    });
                    this.hasWon = true;
                }
                // TODO: log player action, maybe checkpoint
                return nextGrid;
            }
        }

        /**
         * ZELDA RULES:
         *
         *
         */
        if (this.game === Games.ZELDA) {
            // TODO...
        }
    }

    public moveCrate(
        pos: [number, number],
        direction: number[],
        grid: number[][],
        gridSize: number[] | [number, number]
    ): number[][] | null {
        if (this.game === Games.SOKOBAN) {
            const nextPos: [number, number] = [
                pos[0] + direction[0],
                pos[1] + direction[1],
            ];

            // Guard against invalid positions
            if (!this.isValidCratePos(nextPos, grid, gridSize)) {
                return null;
            }

            let tileAtCurrentPos = grid[pos[0]][pos[1]];
            let prevPositionReplacement = TILES.EMPTY;

            // Check for multitile
            if (tileAtCurrentPos === MULTITILE_CRATE_TARGET) {
                prevPositionReplacement = TILES.TARGET;
            }

            let tileAtNextPos = grid[nextPos[0]][nextPos[1]];
            let nextPosTileValue = TILES.CRATE;

            // Check for crate in next position...
            if (tileAtNextPos === TILES.TARGET) {
                nextPosTileValue = MULTITILE_CRATE_TARGET;
            }

            let nextGrid = this.applyUpdateToGrid(
                grid,
                nextPos,
                nextPosTileValue,
                gridSize
            );

            // Replace prev tile
            nextGrid = this.applyUpdateToGrid(
                nextGrid,
                pos,
                prevPositionReplacement,
                gridSize
            );

            return nextGrid;
        }

        if (this.game === Games.ZELDA) {
            // TODO...
            return null;
        }

        return null;
    }

    public isValidPlayerPos(
        pos: [number, number],
        grid: number[][],
        gridSize: number[] | [number, number]
    ) {
        if (
            pos[0] >= 0 &&
            pos[1] >= 0 &&
            pos[0] < gridSize[0] &&
            pos[1] < gridSize[1]
        ) {
            const currentTile = grid[pos[0]][pos[1]];
            if (currentTile === TILES.SOLID) {
                return false;
            }
            return true;
        }
        return false;
    }

    public isValidCratePos(
        pos: [number, number],
        grid: number[][],
        gridSize: number[] | [number, number]
    ) {
        if (
            pos[0] >= 0 &&
            pos[1] >= 0 &&
            pos[0] < gridSize[0] &&
            pos[1] < gridSize[1]
        ) {
            const currentTile = grid[pos[0]][pos[1]];
            if (currentTile === TILES.SOLID || currentTile === TILES.CRATE) {
                return false;
            }
            return true;
        }
        return false;
    }

    public applyUpdateToGrid(
        grid: number[][],
        pos: [number, number],
        tile: number,
        gridSize: number[] | [number, number]
    ): number[][] {
        const [row, col] = pos;
        if (row >= 0 && row < gridSize[0] && col >= 0 && col < gridSize[1]) {
            const { grid: gridClone } = TensorFlowService.cloneGrid(grid);
            let updatedGrid = gridClone;
            updatedGrid[row][col] = tile;
            return updatedGrid;
        }
        return grid;
    }

    /**
     * Determines where on the grid the player tile is.
     *
     * @param grid
     */
    public getPlayerPosFromGrid(
        grid: number[][],
        gridSize: number[] | [number, number]
    ): [number, number] | null {
        for (let i = 0; i < gridSize[0]; i++) {
            for (let j = 0; j < gridSize[1]; j++) {
                if (
                    grid[i][j] === TILES.PLAYER ||
                    grid[i][j] === MULTITILE_PLAYER_TARGET
                ) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    /**
     * Adds a player to a grid.
     *
     * @param grid
     * @param currentPos
     * @param nextPos
     */
    public setPlayerPosOnGrid(
        grid: number[][],
        currentPos: [number, number] | null,
        nextPos: [number, number]
    ): number[][] {
        if (currentPos) {
            grid[currentPos[0]][currentPos[1]] = TILES.EMPTY; // remove from prev
        }
        grid[nextPos[0]][nextPos[1]] = TILES.PLAYER; // add next
        return grid;
    }

    /**
     * Clears a game grid.
     * @param currentGrid
     */
    public clearGrid(gridSize: [number, number]) {
        let { grid } = TensorFlowService.createGameGrid(gridSize);
        return grid;
    }

    public reset() {
        // TODO: keep track of "best?"
        this.actions = [];
        this.hasWon = false;
    }

    public didWin(
        grid: number[][],
        gridSize: number[] | [number, number]
    ): boolean {
        if (this.game === Games.SOKOBAN) {
            let numTargetsCovered = 0;
            let numCrates = 0;
            let numTargets = 0;
            let numPlayers = 0;
            for (let i = 0; i < gridSize[0]; i++) {
                for (let j = 0; j < gridSize[1]; j++) {
                    const tile = grid[i][j];
                    if (tile === TILES.CRATE) {
                        numCrates += 1;
                    } else if (tile === TILES.TARGET) {
                        numTargets += 1;
                    } else if (tile === TILES.PLAYER) {
                        numPlayers += 1;
                    } else if (tile === MULTITILE_PLAYER_TARGET) {
                        numPlayers += 1;
                        numTargets += 1;
                    } else if (tile === MULTITILE_CRATE_TARGET) {
                        numTargetsCovered += 1;
                    }
                }
            }

            // Win conditions
            return (
                numPlayers === 1 &&
                numTargetsCovered > 0 &&
                numCrates === 0 &&
                numTargets === 0
            );
        }

        if (this.game === Games.ZELDA) {
            // TODO...
            return false;
        }
        return false;
    }

    /**
     *
     * @param iterations number of times to run the model
     * @param steps number of steps per model run
     * @param toolRadius tool radius determining the von nuemann neighborhood of tooltip
     * @param timeout number of milliseconds to wait before timing out
     */
    public async generateRandomMap(
        iterations: number,
        steps: number,
        toolRadius: number,
        timeout: number
    ): Promise<GeneratedMapResults> {
        const size = DEFAULT_STAGE_GRID_SIZE;

        // TODO: create a random initial state
        const { grid } = TensorFlowService.createGameGrid(size);
        let nextGrid = grid;

        const clickedTile = DEFAULT_PLAYER_POS; // center tile?
        const timeoutMS = timeout; // number

        // Create a bound function for applying updates
        const applyUpdateToGrid = (
            grid: number[][],
            pos: [number, number],
            tile: number
        ) => {
            return gs.applyUpdateToGrid(grid, pos, tile, size);
        };

        // Worker
        const worker = async (n: number, nextGrid: number[][]) => {
            return tfService
                .generateModelSuggestions(
                    grid,
                    "user",
                    size,
                    toolRadius,
                    steps,
                    clickedTile,
                    applyUpdateToGrid
                )
                .then((results) => {
                    // 2. Process model results and apply data changes in component.

                    // Save the suggestion in the state update
                    const suggestedGrids = { ...EMPTY_SUGGESTED_GRIDS };
                    const pendingSuggestions = {} as any;
                    results.forEach((result: any) => {
                        if (result) {
                            const key = result.repName as RepresentationName;
                            if (typeof key !== "undefined" && key !== null) {
                                suggestedGrids[key] = result.grid;
                                pendingSuggestions[key] =
                                    result.pendingSuggestions;
                            }
                        }
                    });
                    // console.log("pending_suggestions:", pendingSuggestions);

                    const majorityVoteData = tfService.generateMajorityVoteGrid(
                        pendingSuggestions,
                        nextGrid,
                        applyUpdateToGrid
                    );
                    if (majorityVoteData) {
                        suggestedGrids["majority"] = majorityVoteData.grid;
                        pendingSuggestions["majority"] =
                            majorityVoteData.pendingSuggestions;
                        pendingSuggestions["user"] =
                            majorityVoteData.pendingSuggestions;
                    } else {
                        suggestedGrids["majority"] = nextGrid;
                        pendingSuggestions["majority"] = [];
                    }
                    return {
                        suggestedGrids,
                        pendingSuggestions,
                    };
                });
        };

        let hasTimedOut = false;
        const timer = setTimeout(() => {
            hasTimedOut = true;
        }, timeoutMS);

        const tfService = new TensorFlowService();
        const gs = new GameService(Games.SOKOBAN);

        let counter = 1;

        const looper = async () => {
            let results: GeneratedMapResults = {
                grids: [],
                selectedAgents: [],
            };

            for (let counter = 1; counter <= iterations; counter++) {
                if (hasTimedOut) {
                    console.warn(
                        "timed out when creating level.  canceling further operations"
                    );
                    break;
                }
                const res = await worker(counter, nextGrid);
                const agents = Object.keys(res.suggestedGrids);
                // const num_agents = agents.length;
                // const randInt = Math.round(Math.random() * num_agents);
                let selectedAgent = _.sample(agents);
                let selectedGrid: any = null;
                if (selectedAgent) {
                    selectedGrid =
                        res.suggestedGrids[selectedAgent as RepresentationName];
                } else {
                    clearTimeout(timer);
                    throw new Error("Invalid agent selected: " + selectedAgent);
                }
                console.log(`iteration[${counter}]`, selectedAgent);
                results.grids.push(selectedGrid);
                results.selectedAgents.push(
                    selectedAgent as RepresentationName
                );
            }

            return results;
        };

        return looper().then((results) => {
            clearTimeout(timer);
            return results;
        });
    }
}

export class SolverSokoban {
    public width: number;
    public height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public runGame(grid: number[][]) {
        let state = new State(this.width, this.height);
        let valid = state.initGrid(grid);
        if (!valid) {
            // console.log("invalid map input");
            return null;
        }
        //console.log(state.bitGrid);

        let bfs = new BFSAgent();
        let res = bfs.getSolution(state, 20000);
        // console.log(res);
        return {
            actions: res.actions,
            iterations: res.iterations,
        };
    }
}

export class Node {
    public state: State;
    public parent: Node | null = null;
    public action: number = -1;

    private directions: [number, number][] = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ]; //TODO: should be somewhere else

    constructor(state: State, parent: Node | null, action: number) {
        this.state = state;
        this.parent = parent;
        this.action = action;
    }

    public getActions() {
        let actions: number[] = [];
        let current: Node = this;
        while (current.parent !== null) {
            actions.unshift(current.action);
            current = current.parent;
        }
        return actions;
    }

    public getChildren() {
        let children: Node[] = [];
        for (let d = 0; d < 4; d++) {
            let childState = this.state.getCopy();
            let res = childState.updateState(this.directions[d]);
            // console.log(childState);
            // console.log(childState.toKey());
            // console.log(res);
            // console.log(childState.checkWin());
            if (res === 1) {
                // simple move
                children.push(new Node(childState, this, d));
            } else if (res === 3) {
                // crate pushed not dead lock
                children.push(new Node(childState, this, d));
            }
        }
        return children;
    }
}

export class State {
    // map
    public width: number;
    public height: number;
    public bitGrid: number[][];
    public player: [number, number] = [0, 0];
    // state
    public deadlocks: boolean[][] = [];
    private targets: [number, number][] = [];
    private crates: [number, number][] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.bitGrid = [];
        for (let i = 0; i < this.height; i++) {
            this.bitGrid[i] = [];
            for (let j = 0; j < this.width; j++) {
                this.bitGrid[i][j] = 1;
            }
        }
    }

    // from grid with no overlapping elements
    public initGrid(grid: number[][]) {
        // TODO: check validity
        let playerCnt = 0;
        this.player = [-1, -1];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.bitGrid[i][j] = 1 << grid[i][j];
                // update status
                if (grid[i][j] === TILES.TARGET) {
                    this.targets.push([i, j]);
                } else if (grid[i][j] === TILES.CRATE) {
                    this.crates.push([i, j]);
                } else if (grid[i][j] === TILES.PLAYER) {
                    //if (this.player !== null) { return false;}
                    this.bitGrid[i][j] = 1 << TILES.EMPTY;
                    playerCnt += 1;
                    this.player = [i, j];
                }
            }
        }
        // check grid valid
        if (playerCnt !== 1) {
            return false;
        }
        if (this.crates.length !== this.targets.length) {
            return false;
        }
        this.initDeadlocks();
        for (let pos of this.crates) {
            // init crate at deadlock
            if (this.deadlocks[pos[0]][pos[1]]) {
                return false;
            }
        }
        //console.log(this.deadlocks);
        return true;
    }

    public copyBitGrid(
        bitGrid: number[][],
        player: [number, number],
        deadlocks: boolean[][]
    ) {
        this.player = [player[0], player[1]];
        this.deadlocks = deadlocks; // sharing one deadlock map
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.bitGrid[i][j] = bitGrid[i][j];
                // update status
                if (bitGrid[i][j] & (1 << TILES.TARGET)) {
                    this.targets.push([i, j]);
                }
                if (bitGrid[i][j] & (1 << TILES.CRATE)) {
                    this.crates.push([i, j]);
                }
            }
        }
        return this;
    }

    public updateCartes() {
        this.crates = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.bitGrid[i][j] & (1 << TILES.CRATE)) {
                    this.crates.push([i, j]);
                }
            }
        }
    }

    public getCopy() {
        return new State(this.width, this.height).copyBitGrid(
            this.bitGrid,
            this.player,
            this.deadlocks
        );
    }

    public initDeadlocks() {
        let solidMask = 1 << TILES.SOLID;
        let targetSolidMask = (1 << TILES.SOLID) | (1 << TILES.TARGET);
        let bitGridExtended: number[][] = [];
        for (let i = 0; i <= this.height + 1; i++) {
            bitGridExtended[i] = [];
        }
        for (let i = 0; i < this.height; i++) {
            this.deadlocks.push([]);
            this.deadlocks[i] = new Array(this.width).fill(false);
            for (let j = 0; j < this.width; j++) {
                bitGridExtended[i + 1][j + 1] = this.bitGrid[i][j];
            }
        }
        for (let i = 0; i <= this.height + 1; i++) {
            bitGridExtended[i][0] = solidMask;
            bitGridExtended[i][this.width + 1] = solidMask;
        }
        for (let j = 0; j <= this.width + 1; j++) {
            bitGridExtended[0][j] = solidMask;
            bitGridExtended[this.height + 1][j] = solidMask;
        }
        //console.log(bitGridExtended);
        let corners: [number, number][] = [];
        for (let i = 1; i <= this.height; i++) {
            this.deadlocks[i] = [];
            // if (self.solid[y-1][x] and self.solid[y][x-1])
            // or (self.solid[y-1][x] and self.solid[y][x+1])
            // or (self.solid[y+1][x] and self.solid[y][x-1])
            // or (self.solid[y+1][x] and self.solid[y][x+1]):
            for (let j = 1; j <= this.width; j++) {
                if (bitGridExtended[i][j] & targetSolidMask) {
                    continue;
                }
                if (
                    (bitGridExtended[i - 1][j] & solidMask &&
                        bitGridExtended[i][j - 1] & solidMask) ||
                    (bitGridExtended[i - 1][j] & solidMask &&
                        bitGridExtended[i][j + 1] & solidMask) ||
                    (bitGridExtended[i + 1][j] & solidMask &&
                        bitGridExtended[i][j - 1] & solidMask) ||
                    (bitGridExtended[i + 1][j] & solidMask &&
                        bitGridExtended[i][j + 1] & solidMask)
                ) {
                    corners.push([i, j]);
                    this.deadlocks[i - 1][j - 1] = true;
                }
            }
        }
        // console.log(corners);
        // console.log(this.deadlocks);
        for (let c1 of corners) {
            for (let c2 of corners) {
                let dx = c1[0] - c2[0];
                let dy = c1[1] - c2[1];
                if ((dx === 0 && dy === 0) || (dx !== 0 && dy !== 0)) {
                    continue;
                }
                let walls: [number, number][] = [];
                let x = c2[0],
                    y = c2[1];
                if (dx > 0) {
                    let step = dx / Math.abs(dx);
                    for (let i = x + step; i !== c1[0]; i += step) {
                        if (
                            bitGridExtended[i][y] & targetSolidMask ||
                            !(
                                bitGridExtended[i][y - 1] & solidMask ||
                                bitGridExtended[i][y + 1] & solidMask
                            )
                        ) {
                            walls = [];
                            break;
                        }
                        walls.push([i, y]);
                    }
                }
                if (dy > 0) {
                    let step = dy / Math.abs(dy);
                    for (let i = y + step; i !== c1[1]; i += step) {
                        if (
                            bitGridExtended[x][i] & targetSolidMask ||
                            !(
                                bitGridExtended[x - 1][i] & solidMask ||
                                bitGridExtended[x + 1][i] & solidMask
                            )
                        ) {
                            walls = [];
                            break;
                        }
                        walls.push([x, i]);
                    }
                }
                for (let w of walls) {
                    this.deadlocks[w[0] - 1][w[1] - 1] = true;
                }
            }
        }
        //console.log(this.deadlocks);
    }
    public toKey() {
        let key =
            this.player[0].toString() +
            "," +
            this.player[1].toString() +
            "_" +
            this.crates.length.toString() +
            "_" +
            this.targets.length.toString();
        for (let pos of this.crates) {
            key += "_" + pos[0].toString() + "," + pos[1].toString();
        }
        // for (let pos of this.targets) {
        //     key += "_" + pos[0].toString() + "," + pos[1].toString();
        // }
        return key;
    }

    public checkWin() {
        if (this.targets.length !== this.crates.length) {
            return false;
        }
        for (let pos of this.crates) {
            if (!(this.bitGrid[pos[0]][pos[1]] & (1 << TILES.TARGET))) {
                return false;
            }
        }
        return true;
    }

    public getHuristic() {
        let totalDist = 0;
        for (let cpos of this.crates) {
            let bestDist = this.width + this.height;
            let bestMatch = 0;
            for (let i = 0; i < this.targets.length; i++) {
                let tpos = this.targets[i];
                let dist =
                    Math.abs(cpos[0] - tpos[0]) + Math.abs(cpos[1] - tpos[1]);
                if (bestDist > dist) {
                    bestMatch = i;
                    bestDist = dist;
                }
            }
            totalDist += bestDist;
        }
        return totalDist;
    }

    public checkOutside(x: number, y: number) {
        return x < 0 || y < 0 || x >= this.height || y >= this.width;
    }

    public checkMovable(x: number, y: number) {
        return !(
            this.checkOutside(x, y) ||
            this.bitGrid[x][y] & (1 << TILES.SOLID) ||
            this.bitGrid[x][y] & (1 << TILES.CRATE)
        );
    }
    public updateState(dir: [number, number]) {
        let x = this.player[0] + dir[0];
        let y = this.player[1] + dir[1];
        if (this.checkMovable(x, y)) {
            this.player[0] = x;
            this.player[1] = y;
            return 1; // simple move
        } else if (
            !this.checkOutside(x, y) &&
            this.bitGrid[x][y] & (1 << TILES.CRATE)
        ) {
            let cx = x + dir[0];
            let cy = y + dir[1];
            if (this.checkMovable(cx, cy)) {
                this.player[0] = x;
                this.player[1] = y;
                this.bitGrid[x][y] &= ~(1 << TILES.CRATE);
                this.bitGrid[cx][cy] |= 1 << TILES.CRATE;
                this.updateCartes();
                if (this.deadlocks[cx][cy]) {
                    return 2; //pushed to deadlock
                }
                return 3; // push crate
            }
        }
        return 0; // not updated
    }
}

// class BFSAgent(Agent):
//     def getSolution(self, state, maxIterations=-1):
//         iterations = 0
//         bestNode = None
//         queue = [Node(state.clone(), None, None)]
//         visisted = set()
//         while (iterations < maxIterations or maxIterations <= 0) and len(queue) > 0:
//             iterations += 1
//             current = queue.pop(0)
//             if current.checkWin():
//                 return current.getActions(), current, iterations
//             if current.getKey() not in visisted:
//                 if bestNode == None or current.getHeuristic() < bestNode.getHeuristic():
//                     bestNode = current
//                 elif current.getHeuristic() == bestNode.getHeuristic() and current.getCost() < bestNode.getCost():
//                     bestNode = current
//                 visisted.add(current.getKey())
//                 queue.extend(current.getChildren())
//         return bestNode.getActions(), bestNode, iterations

export class BFSAgent {
    public getSolution(state: State, maxIterations: number) {
        //console.log(state.toKey());
        let iterations = 0;
        let bestNode: Node = new Node(state, null, -1);
        let bestHuristic = -1;
        let queue: Node[] = [new Node(state, null, -1)];
        let visited = new Set<string>();
        while (
            queue.length > 0 &&
            (iterations < maxIterations || maxIterations <= 0)
        ) {
            iterations += 1;
            let current: Node = queue.shift()!;
            //console.log(current);
            if (current.state.checkWin()) {
                return {
                    actions: current.getActions(),
                    node: current,
                    iterations: iterations,
                };
            }
            if (!visited.has(current.state.toKey())) {
                let h = current.state.getHuristic();
                //console.log(h);
                if (bestHuristic === -1 || h < bestHuristic) {
                    bestNode = current;
                    bestHuristic = h;
                } else if (h === bestHuristic && current) {
                    // best node not null
                    bestNode = current;
                    bestHuristic = h;
                }
            } else {
                //console.log('visited');
            }
            visited.add(current.state.toKey());
            queue = queue.concat(current.getChildren());
        }
        return {
            actions: bestNode.getActions(),
            node: bestNode,
            iterations: iterations,
        };
    }
}
