import React from "react";
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
} from "../services/TensorFlow";
import {
    AppStateService,
    AppState,
    SuggestedGrids,
} from "../services/AppState";
import { Tileset } from "./Tileset";
import { TilesetButtonProps } from "./TilesetButton";
import { TILES } from "../constants/tiles";

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

    public activateCell(row: number, col: number, data: number): void {
        const { grid } = TensorFlowService.cloneGrid(this.state.grid);
        const update = { grid, playerPos: this.state.playerPos };
        if (
            this.state.selectedSidebarButtonName ===
            SidebarButtonNames.PENCIL_BUTTON
        ) {
            const tile = this.state.selectedTilesetButtonName as number;
            if (tile == TILES.PLAYER) {
                // Remove previous player position
                this.setPlayerPosOnGrid(update.grid, this.state.playerPos, [
                    row,
                    col,
                ]);
                update.playerPos = [row, col];
            }
            update.grid[row][col] = tile;
        } else if (
            this.state.selectedSidebarButtonName === SidebarButtonNames.ERASE
        ) {
            update.grid[row][col] = 0;
        } else {
            return;
        }
        update.grid = grid;
        this.setState(update);
        this.updateGhostLayer(grid, this.state.gridSize);
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

    public async updateGhostLayer(
        nextGrid: number[][],
        nextSize: [number, number],
        repName?: RepresentationName
    ) {
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
            console.log(`Processing state using ${repName} model`);
            // Convert state to Tensor
            this.tfService
                .predictAndDraw(
                    this.state.grid,
                    this.state.gridSize,
                    repName
                    // TODO: add offset?
                )
                .then(({ suggestedGrid, targets }: IPredictionResult) => {
                    console.log(
                        "Suggestion received from model:",
                        suggestedGrid
                    );
                    const update = {
                        suggestedGrids: {} as SuggestedGrids,
                    };
                    update.suggestedGrids[repName] = suggestedGrid;
                    this.setState(update);
                    // console.log("Update:", update);
                    return null;
                });
        });
    }

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
