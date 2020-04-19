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
} from "../services/TensorFlow";
import { AppStateService, AppState } from "../services/AppState";
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
    };

    public onTilesetButtonClick = (
        ex: React.MouseEvent,
        p: TilesetButtonProps
    ) => {
        this.setState({
            selectedTilesetButtonName: p.buttonName,
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
        const nextGrid = Numeric.cloneMatrix(this.state.grid);
        if (
            this.state.selectedSidebarButtonName ===
            SidebarButtonNames.PENCIL_BUTTON
        ) {
            nextGrid[row][col] = 1;
        } else if (
            this.state.selectedSidebarButtonName === SidebarButtonNames.ERASE
        ) {
            nextGrid[row][col] = 0;
        } else {
            return;
        }
        this.setState({
            grid: nextGrid,
        });

        this.updateGhostLayer(nextGrid, this.state.gridSize);
    }

    public clearStage() {
        const [rows, cols] = this.state.gridSize;
        const nextGrid = Numeric.createMatrix(rows, cols);
        this.setState({
            grid: nextGrid,
        });

        this.updateGhostLayer(nextGrid, [rows, cols]);
    }

    public onUpdateGridSize = (newSize: [number, number]) => {
        const [rows, cols] = newSize;
        const [rowsOld, colsOld] = this.state.gridSize;
        const nextGrid = Numeric.createMatrix(rows, cols);
        const lastGrid = this.state.grid;
        // Transfer what is possible from old grid.
        for (let r = 0; r < rowsOld; r++) {
            for (let c = 0; c < colsOld; c++) {
                if (r <= rowsOld) {
                    const row = nextGrid[r];
                    if (row && c <= row.length) {
                        row[c] = lastGrid[r][c];
                    }
                }
            }
        }

        this.setState({
            gridSize: newSize,
            grid: nextGrid,
        });

        this.updateGhostLayer(nextGrid, newSize);
    };

    public async updateGhostLayer(
        nextGrid: number[][],
        nextSize: [number, number]
    ) {
        // Skip TF updates on 0 grid
        if (!nextSize[0] || !nextSize[1]) {
            return;
        }

        REPRESENTATION_NAMES.forEach((repName: RepresentationName) => {
            // Convert state to Tensor
            const stateAsTensor: Tensor = this.tfService.transformStateToTensor(
                nextGrid,
                nextSize,
                repName
            );

            // TODO: let this update the model on the right
            this.tfService
                .predictAndDraw(
                    stateAsTensor,
                    // This is just temporary
                    this.state.grid
                )
                .then((suggestedGrid) => {
                    const update = {
                        suggestedGrids: { ...this.state.suggestedGrids },
                    };
                    update.suggestedGrids[repName] = suggestedGrid;
                    this.setState({ ...update });
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
                                    b.buttonName ===
                                    this.state.selectedToolbarButtonName,
                                onClick: this.onToolbarButtonClick,
                            }))}
                            gridSize={this.state.gridSize}
                            onUpdateGridSize={this.onUpdateGridSize}
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
                                    b.buttonName ===
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
