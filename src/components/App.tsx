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
} from "../services/TensorFlow";
import {
    AppStateService,
    AppState,
    SuggestedGrids,
} from "../services/AppState";
import { Numeric } from "../services/Numeric";
import { Tileset } from "./Tileset";
import { TilesetButtonProps } from "./TilesetButton";
import { Tensor, Rank } from "@tensorflow/tfjs";

interface AppProps {}

// Temporarily aliasing this type until distinct button types are made

export class App extends React.Component<AppProps, AppState> {
    private tfService: TensorFlowService;
    constructor(props: AppProps) {
        super(props);
        this.state = AppStateService.createAppInitialState();
        this.tfService = new TensorFlowService();
    }

    public componentDidMount() {}

    public onSidebarButtonClick = (ev: React.MouseEvent, p: ButtonProps) => {
        if (p.buttonName === SidebarButtonNames.TRASH) {
            this.clearStage();
        }

        this.setState({
            selectedSidebarButtonName: p.buttonName,
        });
    };

    public onToolbarButtonClick = (ev: React.MouseEvent, p: ButtonProps) => {
        this.setState({
            selectedToolbarButtonName: p.buttonName,
        });

        // When user clicks on a button matching the representation name, update state
        const val: RepresentationName = p.buttonValue as RepresentationName;
        if (REPRESENTATION_NAMES_DICT[val]) {
            this.setState({
                currentRepresentation: val,
            });
        }
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
        if (
            this.state.selectedSidebarButtonName ===
            SidebarButtonNames.PENCIL_BUTTON
        ) {
            grid[row][col] = this.state.selectedTilesetButtonName as number;
        } else if (
            this.state.selectedSidebarButtonName === SidebarButtonNames.ERASE
        ) {
            grid[row][col] = 0;
        } else {
            return;
        }
        this.setState({
            grid,
        });
        console.log(grid);
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

    public onUpdateGridSize = (newSize: [number, number]) => {
        const { grid, t } = TensorFlowService.createGameGrid(newSize);
        this.setState({
            gridSize: newSize,
            grid,
        });
    };

    public async updateGhostLayer(
        nextGrid: number[][],
        nextSize: [number, number]
    ) {
        // Skip TF updates on 0 grid
        if (!nextSize[0] || !nextSize[1]) {
            return;
        }

        Promise.all(
            REPRESENTATION_NAMES.map((repName: RepresentationName) => {
                // NOTE: this is very slow if all representations are processed each time.
                // Only process current representation.
                console.log(
                    "RepName",
                    repName,
                    this.state.currentRepresentation
                );
                if (repName !== this.state.currentRepresentation) {
                    return;
                }

                // Convert state to Tensor
                this.tfService
                    .transformStateToTensor(nextGrid, nextSize, repName)
                    .then((stateAsTensors: Tensor[]) => {
                        // TODO: let this update the model on the right
                        return this.tfService
                            .predictAndDraw(
                                stateAsTensors,
                                // This is just temporary
                                this.state.grid,
                                repName
                            )
                            .then((suggestedGrid: number[][]) => {
                                console.log("Suggestedgrid:", suggestedGrid);
                                return {
                                    suggestedGrid,
                                    repName,
                                };
                            });
                    });
            })
        ).then((suggestions) => {
            console.log("suggestions", suggestions);
            const update = {
                suggestedGrids: {} as SuggestedGrids,
            };
            suggestions.forEach((suggestion) => {
                console.log(suggestion);
                // if (suggestion) {
                //     const { suggestedGrid, repName } = suggestion;
                //     update.suggestedGrids[
                //         repName as RepresentationName
                //     ] = suggestedGrid;
                // }
            });

            this.setState(update);
            return null;
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
                                    b.buttonName ===
                                    this.state.selectedToolbarButtonName,
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
