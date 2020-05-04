import React from "react";
import { debounce } from "lodash";
import "./App.css";
import { Layout } from "./Layout";
import { ButtonProps, SidebarButtonNames } from "./Button";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { Stage } from "./Stage";
import { Logo } from "./Logo";

import {
    TensorFlowService,
    RepresentationName,
    REPRESENTATION_NAMES_DICT,
    IPredictionResult,
    ISuggestion,
} from "../services/TensorFlow";
import {
    AppStateService,
    AppState,
    SuggestedGrids,
    SuggestionsByType,
    DEFAULT_PLAYER_POS,
} from "../services/AppState";
import { Tileset } from "./Tileset";
import { TilesetButtonProps } from "./TilesetButton";
import { TILES, CENTER_TILE_POS } from "../constants/tiles";
import {
    GHOST_LAYER_DEBOUNCE_AMOUNT_MS,
    SUPPORTED_TILESETS,
} from "../constants";
import {
    DEFAULT_NUM_STEPS,
    DEFAULT_TOOL_RADIUS,
} from "../services/AppState/index";
import _ from "lodash";
import { diffGrids } from "../services/Utils/index";
import { REPRESENTATION_NAMES } from "../services/TensorFlow/index";

interface AppProps {}

interface IModelResult {
    grid: number[][] | null;
    repName: any;
    pendingSuggestions: ISuggestion[];
}
export class App extends React.Component<AppProps, AppState> {
    private tfService: TensorFlowService;

    constructor(props: AppProps) {
        super(props);
        this.state = AppStateService.createAppInitialState();
        this.tfService = new TensorFlowService();
    }

    public componentDidMount() {
        this.onInit();
    }

    public onInit(): void {
        // 1. Set to Narrow
        this.setState({
            currentRepresentation: "narrow",
        });

        // 2. Add player
        setTimeout(() => {
            const { grid } = TensorFlowService.cloneGrid(this.state.grid);
            const updatedGrid = this.setPlayerPosOnGrid(
                grid,
                null,
                DEFAULT_PLAYER_POS
            );
            this.setState({
                grid: updatedGrid,
                numSteps: DEFAULT_NUM_STEPS,
                toolRadius: DEFAULT_TOOL_RADIUS,
            });
            // 3. Update ghostLayer
            this.updateGhostLayer(updatedGrid, this.state.gridSize);
        }, 0);
    }

    public onSidebarButtonClick = (ev: React.MouseEvent, p: ButtonProps) => {
        if (p.buttonName === SidebarButtonNames.TRASH) {
            this.clearStage();
        }

        this.setState({
            selectedSidebarButtonName: p.buttonName,
        });
    };

    public onToolbarButtonClick = (_: React.MouseEvent, p: ButtonProps) => {
        // When user clicks on a button matching the representation name, update state
        const val: RepresentationName = p.buttonValue as RepresentationName;
        if (!val) {
            return;
        }
        if (REPRESENTATION_NAMES_DICT[val]) {
            this.setState({
                selectedToolbarButtonName: p.buttonName,
                currentRepresentation: val,
            });
        }

        this.updateGhostLayer(this.state.grid, this.state.gridSize, val);
    };

    public onTilesetButtonClick = (
        ex: React.MouseEvent,
        p: TilesetButtonProps
    ) => {
        this.setState({
            selectedTilesetButtonName: p.buttonValue,
        });
    };

    public onGridClick = () => {
        this.setState({
            isClicking: true,
        });
    };

    public onGridUnClick = () => {
        this.setState({
            isClicking: false,
        });
    };

    public onCellMouseOver = (row: number, col: number, data: number) => {
        if (this.state.isClicking) {
            this.activateCell(row, col, data);
        }
    };

    public onCellClick = (row: number, col: number, data: number) => {
        this.activateCell(row, col, data);
    };

    /**
     * Determines where on the grid the player tile is.
     *
     * @param grid
     */
    public getPlayerPosFromGrid(grid: number[][]): [number, number] | null {
        for (let i = 0; i < this.state.gridSize[0]; i++) {
            for (let j = 0; j < this.state.gridSize[1]; j++) {
                if (grid[i][j] === TILES.PLAYER) {
                    return [i, j];
                }
            }
        }
        return null;
    }

    public applyUpdateToGrid(
        grid: number[][],
        pos: [number, number],
        tile: number
    ): number[][] {
        const [row, col] = pos;
        if (
            row >= 0 &&
            row < this.state.gridSize[0] &&
            col >= 0 &&
            col < this.state.gridSize[1]
        ) {
            const { grid: gridClone } = TensorFlowService.cloneGrid(grid);
            let updatedGrid = gridClone;
            // Handle player update
            if (tile === TILES.PLAYER) {
                updatedGrid = this.setPlayerPosOnGrid(
                    updatedGrid,
                    this.state.playerPos,
                    [row, col]
                );
            } else {
                updatedGrid[row][col] = tile;
            }
            return updatedGrid;
        }
        return grid;
    }

    public activateCell(row: number, col: number, data: number): void {
        // const { grid } = TensorFlowService.cloneGrid(this.state.grid);
        let nextGrid: number[][] = this.state.grid;
        let nextPlayerPos: [number, number] | null = null;
        if (
            this.state.selectedSidebarButtonName ===
            SidebarButtonNames.PENCIL_BUTTON
        ) {
            const tile = this.state.selectedTilesetButtonName as number;
            nextGrid = this.applyUpdateToGrid(nextGrid, [row, col], tile);
            if (tile === TILES.PLAYER) {
                nextPlayerPos = this.getPlayerPosFromGrid(nextGrid);
            }
        } else if (
            this.state.selectedSidebarButtonName === SidebarButtonNames.ERASE
        ) {
            nextGrid = this.applyUpdateToGrid(
                nextGrid,
                [row, col],
                TILES.EMPTY
            );
            nextPlayerPos = this.getPlayerPosFromGrid(nextGrid);
        } else {
            return;
        }

        this.setState({
            grid: nextGrid,
            playerPos: nextPlayerPos || this.state.playerPos,
        });
        this.updateGhostLayer(nextGrid, this.state.gridSize, undefined, [
            row,
            col,
        ]);
    }

    public clearStage() {
        const { grid: nextGrid } = TensorFlowService.createGameGrid(
            this.state.gridSize
        );
        this.setState({
            grid: nextGrid,
            playerPos: DEFAULT_PLAYER_POS,
        });

        this.updateGhostLayer(nextGrid, this.state.gridSize);
    }

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

    public onUpdateGridSize = (newSize: [number, number]) => {
        const { grid } = TensorFlowService.createGameGrid(newSize);
        this.setState({
            gridSize: newSize,
            grid,
        });
    };

    /**
     *
     * Aggregate all recommendations into a single virtual grid.
     *
     */
    public generateMajorityVoteGrid(
        pendingSuggestions: SuggestionsByType | null,
        currentGrid: number[][]
    ): { grid: number[][]; pendingSuggestions: ISuggestion[] | null } | null {
        const hashMapOfVotes: Record<string, number> = {};
        const minVotesForMajority = 2; // 2/3 agents is considered majority
        if (pendingSuggestions === null) {
            return null;
        }
        // 1. Iterate over all agents/representation names' suggestions
        REPRESENTATION_NAMES.forEach((repName) => {
            if (typeof repName === "undefined") {
                return;
            }
            const key: RepresentationName = repName;
            const suggestions: ISuggestion[] | null =
                pendingSuggestions[key!] || null;
            if (suggestions !== null) {
                suggestions!.forEach((s: ISuggestion) => {
                    const stringifiedSuggestion = `${s.pos}_${s.tile}`;
                    if (!hashMapOfVotes[stringifiedSuggestion]) {
                        hashMapOfVotes[stringifiedSuggestion] = 0;
                    }
                    hashMapOfVotes[stringifiedSuggestion] += 1;
                });
            }
        });

        // 2. Tally votes for overlap
        const majoritySuggestions = [];
        for (let key in hashMapOfVotes) {
            if (hashMapOfVotes[key] >= minVotesForMajority) {
                const [posStr, tileStr] = key.split("_");
                const pos = posStr.split(",").map(Number) as [number, number];
                const tile = Number(tileStr);
                majoritySuggestions.push({
                    pos,
                    tile,
                });
            }
        }

        // 3. Case 1 - No agreement, return null
        if (!majoritySuggestions.length) {
            return null;
        }

        // 3. Case 2 - Some agreement exists...
        let suggestedGrid = currentGrid;

        // 4. Apply suggestions to grid.
        majoritySuggestions.forEach((suggestion: ISuggestion) => {
            suggestedGrid = this.applyUpdateToGrid(
                suggestedGrid,
                suggestion.pos,
                // pos, // use current neighborhood pos
                suggestion.tile
            );
        });

        // 5. Return data for rendering
        return {
            grid: suggestedGrid,
            pendingSuggestions: majoritySuggestions,
        };
    }

    public acceptGhostSuggestions = (
        r: number,
        c: number,
        d: number,
        repName?: RepresentationName
    ): void => {
        // 1. Find suggestedGrid
        if (!repName || typeof repName === "undefined") {
            console.log("Unable to find ghost grid with name: ", repName);
            return;
        }

        console.log("Accepting Ghost suggestion from: ", repName);
        const key: RepresentationName = repName;
        const suggestedGrid = this.state.suggestedGrids[key!];

        // 2. Apply changes from the corresponding grid.
        if (suggestedGrid) {
            const nextPlayerPos = this.getPlayerPosFromGrid(suggestedGrid);
            const pendingSuggestions: SuggestionsByType = {};
            const suggestedGrids = {} as SuggestedGrids;
            REPRESENTATION_NAMES.forEach((repName) => {
                suggestedGrids[key!] = suggestedGrid;
            });
            this.setState({
                grid: suggestedGrid,
                playerPos: nextPlayerPos ? nextPlayerPos : this.state.playerPos,
                pendingSuggestions,
                suggestedGrids,
            });

            // 3. Get more updates from model to support chaining
            this.getSuggestionsFromModel(
                suggestedGrid,
                this.state.gridSize,
                undefined,
                CENTER_TILE_POS
            );
        }
    };

    public updateToolRadius = (step: number, radius: number): void => {
        if (radius !== this.state.toolRadius) {
            this.setState({
                toolRadius: radius,
            });
        }

        if (step !== this.state.numSteps) {
            this.setState({
                numSteps: step,
            });
        }
    };

    public getSuggestionsFromModel = debounce((
        nextGrid: number[][],
        nextSize: [number, number],
        repName?: RepresentationName,
        clickedTile = DEFAULT_PLAYER_POS // use center tile as default on load
    ) => {
        // Skip TF updates on 0 grid
        if (!nextSize[0] || !nextSize[1]) {
            return;
        }

        const currentRepName =
            repName || this.state.currentRepresentation || "user";

        if (!currentRepName) {
            return;
        }

        const currentGrid = nextGrid;

        // console.log(`Processing state using ${currentRepName} model`);

        const fn = async (
            steps: number,
            repName: RepresentationName
        ): Promise<IModelResult> => {
            // console.log("START: repName: ", repName);
            // // uncomment to debug
            // Keep track of all mutations
            const suggestedGridStack = [currentGrid];

            // This doesn't matter for wide.
            let neighborhoodPositions = [];

            // Use relative position for non-wide
            if (repName !== "wide") {
                neighborhoodPositions = this.tfService.getNeighbors(
                    clickedTile,
                    this.state.gridSize,
                    this.state.toolRadius
                );
            } else {
                // Just repeat clicked position over and over for wide.
                for (let i = 0; i < steps; i++) {
                    neighborhoodPositions.push(clickedTile);
                }
            }

            // console.log("neighbors: ", neighborhoodPositions);
            // For
            // const iters = repName !== 'wide' ? neighborhoodPositions.length : NUMBER_OF_SUGGESTIONS_IN_WIDE;
            const iters = neighborhoodPositions.length;

            // For each position in neighborhood...
            for (let p = 0; p < iters; p++) {
                const pos = neighborhoodPositions[p];
                const suggestedGrid = suggestedGridStack[p];
                if (!suggestedGrid) {
                    console.log("grids", suggestedGridStack, p, repName);
                    throw new Error("Missing grid!");
                }

                // Skip invalid positions
                if (pos === null) {
                    suggestedGridStack.push(suggestedGrid);
                    continue;
                }

                // console.log("pos: ", pos);
                // Keep generating new grids based on suggestions
                const suggestionsApplied: ISuggestion[] = [];
                for (let i = 0; i < steps; i++) {
                    const {
                        suggestions,
                    }: IPredictionResult = await this.tfService.predictAndDraw(
                        suggestedGrid,
                        this.state.gridSize,
                        repName!,
                        pos,
                        this.state.toolRadius
                    );
                    // For debugging -- uncomment
                    // console.log("step: ", p, i, "pos: ", pos);
                    if (suggestions) {
                        // const numSuggestions = suggestions.length;
                        let numSuggestions = 1;
                        // When using wide, steps means the number of tiles to consider
                        if (repName === "wide") {
                            numSuggestions = steps;
                        }
                        for (let j = 0; j < numSuggestions; j++) {
                            const suggestion: ISuggestion | null =
                                suggestions[j];
                            suggestionsApplied.push(suggestion);
                            if (suggestion) {
                                const nextSuggestedGrid = this.applyUpdateToGrid(
                                    suggestedGrid,
                                    suggestion.pos,
                                    // pos, // use current neighborhood pos
                                    suggestion.tile
                                );

                                /**
                                 * Handle 'turtle' agent which returns a direction
                                 */
                                const direction = suggestion.direction;
                                // When a direction is given...
                                if (direction) {
                                    // recompute neighbors by shifting in direction
                                    const updatedNeighborhoodPositions = this.tfService.getNeighbors(
                                        [
                                            clickedTile[0] + direction[0],
                                            clickedTile[1] + direction[1],
                                        ],
                                        this.state.gridSize,
                                        this.state.toolRadius
                                    );

                                    // Change neighborhood positions to match
                                    updatedNeighborhoodPositions.forEach(
                                        (nextPos, idx) => {
                                            neighborhoodPositions[
                                                idx
                                            ] = nextPos;
                                        }
                                    );
                                }

                                suggestedGridStack.push(nextSuggestedGrid);
                            }
                        }
                    } else {
                        // When there are no suggestions, terminate loop
                        break;
                    }
                }
                // console.log("suggestions_applied:", suggestionsApplied);
            }

            // Save the suggestion in the state update
            const nextGrid: number[][] | null =
                _.last(suggestedGridStack) || null;
            // console.log("END: repName: ", repName);
            // console.log("SuggestedGridStack:", suggestedGridStack);
            const pendingSuggestions: ISuggestion[] = [];
            // Aggregate all the suggestions from the loop above by diffing
            // current grid and last suggested grid.
            if (nextGrid) {
                const diffs = diffGrids(
                    currentGrid,
                    nextGrid,
                    this.state.gridSize
                );
                diffs.forEach((diff) => {
                    const suggestion: ISuggestion = {
                        pos: diff.pos,
                        tile: diff.b,
                    };
                    pendingSuggestions.push(suggestion);
                });
            }

            // console.log("pending_suggestions:", pendingSuggestions);

            return {
                grid: nextGrid,
                repName,
                pendingSuggestions,
            };
        };

        // Invoke async anon function -- a trick to do an async/await loop
        Promise.all(
            REPRESENTATION_NAMES.map((repName) =>
                fn(this.state.numSteps, repName)
            )
        ).then((results) => {
            // Save the suggestion in the state update
            const suggestedGrids = {} as any;
            const pendingSuggestions = {} as any;
            results.forEach((result: any) => {
                if (result) {
                    const key = result.repName as RepresentationName;
                    if (typeof key !== "undefined" && key !== null) {
                        suggestedGrids[key] = result.grid;
                        pendingSuggestions[key] = result.pendingSuggestions;
                    }
                }
            });
            // console.log("pending_suggestions:", pendingSuggestions);

            const majorityVoteData = this.generateMajorityVoteGrid(
                pendingSuggestions,
                currentGrid
            );
            if (majorityVoteData) {
                suggestedGrids["majority"] = majorityVoteData.grid;
                pendingSuggestions["majority"] =
                    majorityVoteData.pendingSuggestions;
                pendingSuggestions["user"] =
                    majorityVoteData.pendingSuggestions;
            } else {
                suggestedGrids["majority"] = currentGrid;
                pendingSuggestions["majority"] = [];
            }

            console.log("majority", majorityVoteData);

            // Update the UI state based on the suggested grids, etc.
            this.setState({
                suggestedGrids,
                // Add an array of pending suggestions to state
                pendingSuggestions,
            });
        });
    }, GHOST_LAYER_DEBOUNCE_AMOUNT_MS);

    public updateGhostLayer = (
        nextGrid: number[][],
        nextSize: [number, number],
        repName?: RepresentationName,
        clickedTile?: [number, number]
    ) => {
        // Cancel any pending calls
        this.getSuggestionsFromModel.cancel();

        this.getSuggestionsFromModel(
            nextGrid,
            nextSize,
            undefined,
            clickedTile
        );
    };

    public updateTileSet = (t: string) => {
        this.setState({
            tileset: t,
        });
    };

    public render() {
        return (
            <div className={["App", this.state.tileset || ""].join(" ")}>
                <Layout
                    logo={<Logo />}
                    sidebar={
                        <Sidebar
                            buttons={this.state.sidebarButtons.map((b) => ({
                                ...b,
                                selected:
                                    b.buttonName ===
                                    this.state.selectedSidebarButtonName,
                                onClick: this.onSidebarButtonClick,
                            }))}
                        />
                    }
                    toolbar={
                        <Toolbar
                            buttons={this.state.toolbarButtons.map((b) => ({
                                ...b,
                                selected:
                                    b.buttonValue ===
                                    this.state.currentRepresentation,
                                onClick: this.onToolbarButtonClick,
                            }))}
                            gridSize={this.state.gridSize}
                            onUpdateGridSize={this.onUpdateGridSize}
                            onStepSizeChange={this.updateToolRadius}
                            enableResize
                        />
                    }
                    stages={[
                        <Stage
                            grids={
                                {
                                    user: this.state.grid as number[][],
                                } as SuggestedGrids
                            }
                            onGridClick={this.onGridClick}
                            onGridUnClick={this.onGridUnClick}
                            onCellMouseOver={this.onCellMouseOver}
                            onCellMouseDown={this.onCellClick}
                            onCellClick={this.onCellClick}
                            onGhostGridClick={this.acceptGhostSuggestions}
                            pendingSuggestions={this.state.pendingSuggestions}
                        />,
                        <Stage
                            grids={{
                                ...this.state.suggestedGrids,
                            }}
                            vertical
                            onGridClick={this.onGridClick}
                            onGridUnClick={this.onGridUnClick}
                            onCellMouseOver={this.onCellMouseOver}
                            onCellMouseDown={this.onCellClick}
                            onCellClick={this.onCellClick}
                            onGhostGridClick={this.acceptGhostSuggestions}
                            pendingSuggestions={this.state.pendingSuggestions}
                        />,
                    ]}
                    tileset={
                        <Tileset
                            buttons={this.state.tilesetButtons.map((b) => ({
                                ...b,
                                selected:
                                    b.buttonValue ===
                                    this.state.selectedTilesetButtonName,
                                onClick: this.onTilesetButtonClick,
                            }))}
                            tilesets={SUPPORTED_TILESETS}
                            onTileSetChange={this.updateTileSet}
                        />
                    }
                />
            </div>
        );
    }
}
