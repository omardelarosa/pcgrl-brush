import { TensorFlowService } from "../TensorFlow";
import {
    TILES,
    MULTITILE_CRATE_TARGET,
    MULTITILE_PLAYER_TARGET,
} from "../../constants/tiles";
import { ACTIONS } from "../../constants";

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
}
