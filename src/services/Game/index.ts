import { TensorFlowService } from "../TensorFlow";
import {
    TILES,
    MULTITILE_CRATE_TARGET,
    MULTITILE_PLAYER_TARGET,
} from "../../constants/tiles";
import { ACTIONS } from "../../constants";
import { abs } from "numjs";
import { timingSafeEqual } from "crypto";

export enum Games {
    SOKOBAN,
    ZELDA,
}

export interface GameAction {
    name: string;
    value: any;
    action: ACTIONS;
}

export class GameService {
    private game: Games;
    public actions: GameAction[];
    public hasWon: boolean = false;
    private solver: SolverSokoban;

    constructor(game: Games) {
        this.game = game;
        this.actions = [];
        this.solver = new SolverSokoban(5,5);

        // let map = [
        //     [0,0,0,0,0],
        //     [0,3,4,3,0],
        //     [0,3,3,2,4],
        //     [0,0,4,0,0],
        //     [4,1,1,1,0]
        // ];
        let map = [
            [0,0,2,0,0],
            [4,3,0,3,4],
            [4,3,3,3,4],
            [0,0,4,0,0],
            [0,1,1,1,0]
        ];
        // let map = [
        //     [0,0,0,0,0],
        //     [0,4,4,3,2],
        //     [0,4,3,3,0],
        //     [0,0,0,0,0],
        //     [0,1,1,1,0]
        // ];
        this.solver.runGame(map);
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
        state.initGrid(grid);
        //console.log(state.bitGrid);

        let bfs = new BFSAgent();
        let res = bfs.getSolution(state, 20000);
        console.log(res);
    }
}

export class Node {
    public state: State;
    public parent: Node|null = null;
    public action: number = -1;

    private directions: [number,number][] = [[-1,0],[1,0],[0,-1],[0,1]]; //TODO: should be somewhere else

    constructor(
        state: State,
        parent: Node|null,
        action: number
    ) {
        this.state = state;
        this.parent = parent;
        this.action = action;
    }

    public getActions() {
        let actions: number[]  = [];
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
            if (res === 0) { // not updated
                continue;
            } else if (res === 1) { // simple move
                children.push(new Node(childState, this, d));
            } else if (res === 2) { // crate pushed
                children.push(new Node(childState, this, d));
                //TODO
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
    public player: [number, number] = [0,0];
    // state
    private deadlocks: number[][] = [];
    private targets: [number,number][] = [];
    private crates: [number,number][] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.bitGrid = [];
        for (let i = 0; i < this.height; i++) {
            this.bitGrid[i] = [];
            for (let j=0; j < this.width; j++){
                this.bitGrid[i][j] = 1;
            }
        }
    }

    // from grid with no overlapping elements
    public initGrid(
        grid: number[][],
    ) {
        // TODO: check validity
        this.player = [-1,-1];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (grid[i][j] !== TILES.PLAYER) {
                    this.bitGrid[i][j] |= (1 << grid[i][j]);
                } else {
                    this.bitGrid[i][j] |= (1 << TILES.EMPTY);
                }
                // update status
                if (grid[i][j] === TILES.TARGET) {
                    this.targets.push([i,j]);
                } else if (grid[i][j] === TILES.CRATE) {
                    this.crates.push([i,j]);
                } else if (grid[i][j] === TILES.PLAYER) {
                    //if (this.player !== null) { return false;}
                    this.player = [i,j];
                }
            }
        }
        return true;
    }

    public copyBitGrid(
        bitGrid: number[][],
        player: [number, number]
    ) {
        this.player = [player[0], player[1]];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                this.bitGrid[i][j] = bitGrid[i][j];
                // update status
                if (bitGrid[i][j] & (1 << TILES.TARGET)) {
                    this.targets.push([i,j]);
                }
                if (bitGrid[i][j] & (1 << TILES.CRATE)) {
                    this.crates.push([i,j]);
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
                    this.crates.push([i,j]);
                }
            }
        }
    }

    public getCopy() {
        return new State(this.width, this.height)
                .copyBitGrid(this.bitGrid, this.player);
    }

    public toKey() {
        let key = this.player[0].toString() + ',' + this.player[1].toString() + '_'
            + this.crates.length.toString() + '_' + this.targets.length.toString();
        for (let pos of this.crates) {
            key += '_' + pos[0].toString() +','+ pos[1].toString();
        }
        for (let pos of this.targets) {
            key += '_' + pos[0].toString() +','+ pos[1].toString();
        }
        return key;
    }

    public checkWin() {
        if (this.targets.length !== this.crates.length) { return false; }
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
                let dist = Math.abs(cpos[0]-tpos[0]) + Math.abs(cpos[1]-tpos[1]);
                if (bestDist > dist) {
                    bestMatch = i;
                    bestDist = dist;
                }
            }
            totalDist += bestDist;
        }
        return totalDist;
    }

    public checkOutside(x: number,y: number) {
        return x < 0 || y < 0 || x >= this.height || y >= this.width;
    }

    public checkMovable(x: number,y: number) {
        return !(this.checkOutside(x,y)
            || (this.bitGrid[x][y] & (1 << TILES.SOLID))
            || (this.bitGrid[x][y] & (1 << TILES.CRATE)));
    }
    public updateState(dir: [number, number]) {
        let x = this.player[0] + dir[0];
        let y = this.player[1] + dir[1];
        if (this.checkMovable(x,y)) {
            this.player[0] = x;
            this.player[1] = y;
            return 1; // simple move
        } else if (!this.checkOutside(x,y) && this.bitGrid[x][y] & (1 << TILES.CRATE)) {
            let cx = x + dir[0];
            let cy = y + dir[1];
            if (this.checkMovable(cx,cy)) {
                this.player[0] = x;
                this.player[1] = y;
                this.bitGrid[x][y] &= ~(1 << TILES.CRATE);
                this.bitGrid[cx][cy] |= (1 << TILES.CRATE);
                this.updateCartes();
                return 2; // push crate
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
    public getSolution(
        state: State,
        maxIterations: number
    ) {
        //console.log(state.toKey());
        let iterations = 0;
        let bestNode: Node = new Node(state, null, -1);
        let bestHuristic = -1;
        let queue:Node[] = [new Node(state, null, -1)];
        let visited = new Set<string>();
        while( queue.length > 0 &&
                (iterations < maxIterations || maxIterations <= 0)) {
            iterations += 1;
            let current: Node = queue.shift()!;
            //console.log(current);
            if (current.state.checkWin()) {
                return {
                    actions: current.getActions(),
                    node: current,
                    iterations: iterations
                }
            }
            if (!visited.has(current.state.toKey())) {
                let h= current.state.getHuristic();
                //console.log(h);
                if (bestHuristic === -1 || h < bestHuristic) {
                    bestNode = current;
                    bestHuristic = h;
                } else if (h === bestHuristic && current) {// best node not null
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
            iterations: iterations
        }
    }
}