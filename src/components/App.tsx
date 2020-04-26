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
    REPRESENTATION_NAMES,
    RepresentationName,
    REPRESENTATION_NAMES_DICT,
    IPredictionResult,
    ISuggestion,
} from "../services/TensorFlow";
import {
    AppStateService,
    AppState,
    SuggestedGrids,
} from "../services/AppState";
import { Tileset } from "./Tileset";
import { TilesetButtonProps } from "./TilesetButton";
import { TILES, GHOST_LAYER_DEBOUNCE_AMOUNT_MS } from "../constants/tiles";

interface AppProps {}

// Temporarily aliasing this type until distinct button types are made

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
            const pos = this.state.playerPos;
            const { grid } = TensorFlowService.cloneGrid(this.state.grid);
            const updatedGrid = this.setPlayerPosOnGrid(grid, [0, 0], pos);
            this.setState({
                grid: updatedGrid,
            });
            // 3. Update ghostLayer
            this.updateGhostLayer(updatedGrid, this.state.gridSize, "narrow");
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
        let nextPlayerPos = this.state.playerPos;
        if (
            this.state.selectedSidebarButtonName ===
            SidebarButtonNames.PENCIL_BUTTON
        ) {
            const tile = this.state.selectedTilesetButtonName as number;
            nextGrid = this.applyUpdateToGrid(nextGrid, [row, col], tile);
            if (tile === TILES.PLAYER) {
                nextPlayerPos = [row, col];
            }
        } else if (
            this.state.selectedSidebarButtonName === SidebarButtonNames.ERASE
        ) {
            nextGrid = this.applyUpdateToGrid(
                nextGrid,
                [row, col],
                TILES.EMPTY
            );
        } else {
            return;
        }
        this.setState({
            grid: nextGrid,
            playerPos: nextPlayerPos,
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
        });

        this.updateGhostLayer(nextGrid, this.state.gridSize);
    }

    public setPlayerPosOnGrid(
        grid: number[][],
        currentPos: [number, number],
        nextPos: [number, number]
    ): number[][] {
        grid[currentPos[0]][currentPos[1]] = TILES.EMPTY; // remove from prev
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

    public acceptGhostSuggestions = (): void => {
        console.log("Accepting Ghost suggestion");
        // 1. Find suggestedGrid
        if (!this.state.currentRepresentation) {
            return;
        }
        const suggestedGrid = this.state.suggestedGrids[
            this.state.currentRepresentation
        ];
        if (suggestedGrid) {
            const nextPlayerPos = this.getPlayerPosFromGrid(suggestedGrid);
            this.setState({
                grid: suggestedGrid,
                playerPos: nextPlayerPos ? nextPlayerPos : this.state.playerPos,
                pendingSuggestions: [],
            });
        }
    };

    public updateGhostLayer = debounce(
        (
            nextGrid: number[][],
            nextSize: [number, number],
            repName?: RepresentationName,
            clickedTile?: [number, number]
        ) => {
            // Skip TF updates on 0 grid
            if (!nextSize[0] || !nextSize[1]) {
                return;
            }

            const currentRepName = repName || this.state.currentRepresentation;

            REPRESENTATION_NAMES.forEach((repName: RepresentationName) => {
                // NOTE: this is very slow if all representations are processed each time.
                // Only process current representation.

                if (repName !== currentRepName) {
                    return null;
                }

                if (repName !== "wide" && !clickedTile) {
                    return null;
                }
                console.log(`Processing state using ${repName} model`);
                // Convert state to Tensor
                this.tfService
                    .predictAndDraw(
                        this.state.grid,
                        this.state.gridSize,
                        repName,
                        clickedTile
                        // TODO: add offset?
                    )
                    .then(({ suggestions }: IPredictionResult) => {
                        console.log(
                            "Suggestion received from model:",
                            suggestions
                        );
                        let suggestedGrid = this.state.grid;
                        const suggestedGrids = {} as SuggestedGrids;
                        if (suggestions) {
                            suggestions.forEach(
                                (suggestion: ISuggestion | null) => {
                                    if (suggestion) {
                                        suggestedGrid = this.applyUpdateToGrid(
                                            suggestedGrid,
                                            suggestion.pos,
                                            suggestion.tile
                                        );
                                    }
                                }
                            );
                        }

                        // Save the suggestion in the state update
                        suggestedGrids[repName] = suggestedGrid;

                        this.setState({
                            suggestedGrids,
                            // Add an array of pending suggestions to state
                            pendingSuggestions: suggestions || [],
                        });
                        return null;
                    });
            });
        },
        GHOST_LAYER_DEBOUNCE_AMOUNT_MS
    );

    public render() {
        return (
            <div className="App">
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
                            enableResize
                        />
                    }
                    stage={
                        <Stage
                            grids={{
                                user: this.state.grid,
                                ...this.state.suggestedGrids,
                            }}
                            onGridClick={this.onGridClick}
                            onGridUnClick={this.onGridUnClick}
                            onCellMouseOver={this.onCellMouseOver}
                            onCellMouseDown={this.onCellClick}
                            onCellClick={this.onCellClick}
                            onGhostGridClick={this.acceptGhostSuggestions}
                            pendingSuggestions={this.state.pendingSuggestions}
                        />
                    }
                    tileset={
                        <Tileset
                            buttons={this.state.tilesetButtons.map((b) => ({
                                ...b,
                                selected:
                                    b.buttonValue ===
                                    this.state.selectedTilesetButtonName,
                                onClick: this.onTilesetButtonClick,
                            }))}
                        />
                    }
                />
            </div>
        );
    }
}
