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
    ISuggestion,
} from "../services/TensorFlow";
import {
    AppStateService,
    AppState,
    SuggestedGrids,
    SuggestionsByType,
    DEFAULT_PLAYER_POS,
    Checkpoint,
} from "../services/AppState";
import { Tileset } from "./Tileset";
import { TilesetButtonProps } from "./TilesetButton";
import { TILES, CENTER_TILE_POS } from "../constants/tiles";
import {
    GHOST_LAYER_DEBOUNCE_AMOUNT_MS,
    SUPPORTED_TILESETS,
    EMPTY_SUGGESTED_GRIDS,
    ValidKeysType,
    ACTIONS,
    MAX_GRID_HISTORY_LENGTH,
} from "../constants";
import {
    DEFAULT_NUM_STEPS,
    DEFAULT_TOOL_RADIUS,
    DEFAULT_STAGE_GRID_SIZE,
} from "../services/AppState";
import { REPRESENTATION_NAMES } from "../services/TensorFlow";
import { Footer } from "./Footer";
import { KEY_MAPPINGS } from "../constants";
import { Saving } from "./Saving";
import { GameService, Games } from "../services/Game";
import { GameActionViewer } from "./GameActionViewer";

interface AppProps {
    queryState?: Checkpoint | null;
}

export interface IModelResult {
    grid: number[][] | null;
    repName: any;
    pendingSuggestions: ISuggestion[];
}
export class App extends React.Component<AppProps, AppState> {
    private tfService: TensorFlowService;
    private gameService: GameService;

    constructor(props: AppProps) {
        super(props);
        this.state = AppStateService.createAppInitialState();
        this.tfService = new TensorFlowService();
        this.gameService = new GameService(Games.SOKOBAN);

        // Attaches services to window object for debugging.
        (window as any).__PCGRL = {
            tf: this.tfService,
            gs: this.gameService,
        };
    }

    public componentDidMount() {
        this.onInit();
    }

    public onInit(): void {
        // 1. Set to Narrow by default
        this.setState({
            currentRepresentation: "narrow",
        });

        // 2. Add player, etc on next tick
        setTimeout(() => {
            // Use existing checkpoint if available
            if (this.props.queryState) {
                const checkpoint = this.props.queryState;
                const grid = TensorFlowService.textToGrid(checkpoint.gridText);
                const gridSize = (checkpoint.gridSize ||
                    DEFAULT_STAGE_GRID_SIZE) as [number, number];
                this.setState(
                    {
                        grid,
                        gridSize,
                        numSteps: checkpoint.steps || DEFAULT_NUM_STEPS,
                        toolRadius: checkpoint.radius || DEFAULT_TOOL_RADIUS,
                        checkpoints: [checkpoint],
                        checkpointIndex: 0,
                    },
                    () => {
                        this.getSuggestionsFromModel(grid, gridSize);
                    }
                );
                // Otherwise...
            } else {
                const { grid } = TensorFlowService.cloneGrid(this.state.grid);

                // Add a player by default
                const updatedGrid = this.setPlayerPosOnGrid(
                    grid,
                    null,
                    DEFAULT_PLAYER_POS
                );

                // add checkpoint
                this.addCheckpoint(updatedGrid);
                this.setState({
                    grid: updatedGrid,
                    numSteps: DEFAULT_NUM_STEPS,
                    toolRadius: DEFAULT_TOOL_RADIUS,
                });

                // 3. Update ghostLayer
                this.updateGhostLayer(updatedGrid, this.state.gridSize);
            }
        }, 0);

        this.attachEventListeners();
    }

    public componentWillUnmount() {
        // Clean up...
        this.detachEventListeners();
    }

    public attachEventListeners = () => {
        // Attach global event listener..
        window.addEventListener("keypress", this.handleKeyPress);
    };

    public detachEventListeners = () => {
        // Detach global event listener..
        window.removeEventListener("keypress", this.handleKeyPress);
    };

    public handleKeyPress = (ev: KeyboardEvent) => {
        // TODO: make this game agnostic...
        if (this.state.playMode) {
            if (ev.code in KEY_MAPPINGS.codes_to_actions) {
                const action: ACTIONS =
                    KEY_MAPPINGS.codes_to_actions[ev.code as ValidKeysType];
                switch (action) {
                    case ACTIONS.MOVE_DOWN:
                        this.movePlayer([0, 1], action);
                        break;
                    case ACTIONS.MOVE_UP:
                        this.movePlayer([0, -1], action);
                        break;
                    case ACTIONS.MOVE_LEFT:
                        this.movePlayer([-1, 0], action);
                        break;
                    case ACTIONS.MOVE_RIGHT:
                        this.movePlayer([1, 0], action);
                        break;
                    case ACTIONS.RETRY:
                        this.gameService.reset();
                        this.restoreCheckpoint(this.state.checkpointIndex);
                        break;
                }
            }
        }
    };

    /**
     * Delegates to game service and updates state accordingly.
     *
     * @param direction
     * @param action
     */
    public movePlayer(direction: number[], action: ACTIONS) {
        const nextGrid = this.gameService.movePlayer(
            direction,
            this.state.grid,
            this.state.gridSize,
            action
        );
        if (nextGrid) {
            this.setState({ grid: nextGrid });
        }
    }

    public onSidebarButtonClick = (ev: React.MouseEvent, p: ButtonProps) => {
        if (p.buttonName === SidebarButtonNames.TRASH) {
            this.clearStage();
        }

        let playMode = false;
        if (p.buttonName === SidebarButtonNames.PLAY) {
            playMode = true;
        }

        if (playMode !== this.state.playMode) {
            // when re-entering edit mode...
            if (playMode === false) {
                // Restore to the last edited state
                this.restoreCheckpoint(this.state.checkpointIndex);
            } else {
                // add checkpoint during mode transition
                this.addCheckpoint(this.state.grid);
            }
            // when entering play mode
        }

        let saveMode = false;
        if (p.buttonName === SidebarButtonNames.SAVE) {
            saveMode = true;

            // Unset playmode, restore
            if (playMode) {
                // Restore to the last edited state
                this.restoreCheckpoint(this.state.checkpointIndex);
                playMode = false;
            }
        }
        // console.log("saveMode: ", saveMode);

        this.setState({
            selectedSidebarButtonName: p.buttonName,
            playMode,
            saveMode,
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

    public getPlayerPosFromGrid(grid: number[][]): [number, number] | null {
        return this.gameService.getPlayerPosFromGrid(grid, this.state.gridSize);
    }

    /**
     * Bound instance of grid mutator.  Must be bound to component in order
     * to properly access the game service instance from TF service.
     */
    public applyUpdateToGrid = (
        grid: number[][],
        pos: [number, number],
        tile: number
    ): number[][] => {
        return this.gameService.applyUpdateToGrid(
            grid,
            pos,
            tile,
            this.state.gridSize
        );
    };

    public addCheckpoint(grid: number[][]) {
        // TODO: add support for dynamic grid sizes
        let checkpoints = [...this.state.checkpoints];
        // let gridHistory = [...this.state.gridHistory];

        // Keep track of current spot in history
        const currentCheckpointIndex = this.state.checkpointIndex;
        let nextCheckpointIndex = currentCheckpointIndex + 1;

        while (
            checkpoints.length >= MAX_GRID_HISTORY_LENGTH ||
            currentCheckpointIndex < checkpoints.length - 1
        ) {
            checkpoints.shift();
            nextCheckpointIndex--; // decrement pointer, since list is getting shorter
        }

        // const grid = this.state.grid;

        const checkpoint: Checkpoint = {
            gridText: TensorFlowService.gridToText(grid),
            gridSize: this.state.gridSize,
            radius: this.state.toolRadius,
            steps: this.state.numSteps,
        };

        // Add new grid
        checkpoints.push(checkpoint);

        const a: Checkpoint | undefined = checkpoints[currentCheckpointIndex];
        const b: Checkpoint | undefined = checkpoints[nextCheckpointIndex];

        // Diff and avoid adding redundant checkpoints
        if (JSON.stringify(a) === JSON.stringify(b)) {
            return;
        }

        this.setState({
            checkpoints,
            checkpointIndex: nextCheckpointIndex,
        });
    }

    public restoreCheckpoint(idx: number): void {
        if (idx === -1) {
            console.log("No history!");
            return;
        }

        if (idx >= this.state.checkpoints.length) {
            console.log("Too far forward...");
            return;
        }

        const checkpoint: Checkpoint = this.state.checkpoints[idx];
        if (checkpoint) {
            const nextGrid: number[][] = TensorFlowService.textToGrid(
                checkpoint.gridText
            );
            this.setState(
                {
                    grid: nextGrid,
                    checkpointIndex: idx,
                    toolRadius: Number(checkpoint.radius),
                    numSteps: Number(checkpoint.steps),
                    suggestedGrids: {
                        ...EMPTY_SUGGESTED_GRIDS,
                    },
                    pendingSuggestions: null,
                },
                () => {
                    // TODO: safely get suggestions for new grid...
                    this.getSuggestionsFromModel(nextGrid, this.state.gridSize);
                }
            );
        }
    }

    public activateCell(row: number, col: number, data: number): void {
        // Grid is immutable in playmode
        if (this.state.playMode) {
            return;
        }

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

        // add checkpoint
        this.addCheckpoint(this.state.grid);

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
        const nextGrid = this.gameService.clearGrid(this.state.gridSize);

        // add checkpoint
        this.addCheckpoint(this.state.grid);
        this.setState(
            {
                grid: nextGrid,
            },
            () => {
                this.updateGhostLayer(nextGrid, this.state.gridSize);
            }
        );
    }

    /**
     * Delegates to game service to all for game-specific implementations later.
     * @param grid
     * @param currentPos
     * @param nextPos
     */
    public setPlayerPosOnGrid(
        grid: number[][],
        currentPos: [number, number] | null,
        nextPos: [number, number]
    ): number[][] {
        return this.gameService.setPlayerPosOnGrid(grid, currentPos, nextPos);
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
     * Delegates to TF service
     *
     */
    public generateMajorityVoteGrid(
        pendingSuggestions: SuggestionsByType | null,
        currentGrid: number[][]
    ): { grid: number[][]; pendingSuggestions: ISuggestion[] | null } | null {
        return this.tfService.generateMajorityVoteGrid(
            pendingSuggestions,
            currentGrid,
            this.applyUpdateToGrid
        );
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
            const suggestedGrids = { ...EMPTY_SUGGESTED_GRIDS };
            REPRESENTATION_NAMES.forEach((repName) => {
                suggestedGrids[key!] = suggestedGrid;
            });

            // add checkpoint
            this.addCheckpoint(this.state.grid);

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

    public handleUndoRedo = (direction: number) => {
        // console.log("direction: ", direction);
        this.restoreCheckpoint(this.state.checkpointIndex + direction);
    };

    public updateToolRadius = (step: number, radius: number): void => {
        if (radius !== this.state.toolRadius) {
            this.setState(
                {
                    toolRadius: radius,
                    pendingSuggestions: null,
                    suggestedGrids: { ...EMPTY_SUGGESTED_GRIDS },
                },
                () => {
                    this.getSuggestionsFromModel(
                        this.state.grid,
                        this.state.gridSize
                    );
                }
            );
        }

        if (step !== this.state.numSteps) {
            this.setState(
                {
                    numSteps: step,
                    pendingSuggestions: null,
                    suggestedGrids: { ...EMPTY_SUGGESTED_GRIDS },
                },
                () => {
                    this.getSuggestionsFromModel(
                        this.state.grid,
                        this.state.gridSize
                    );
                }
            );
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

        // 1. Generate suggestions from TF service, asynchronously...
        this.tfService
            .generateModelSuggestions(
                nextGrid,
                currentRepName,
                nextSize,
                this.state.toolRadius,
                this.state.numSteps,
                clickedTile,
                this.applyUpdateToGrid
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

                // Update the UI state based on the suggested grids, etc.
                this.setState({
                    suggestedGrids,
                    // Add an array of pending suggestions to state
                    pendingSuggestions,
                });
            });
        // .catch((err) => {
        //     console.warn("error generating suggestions: ", err);
        // });
    }, GHOST_LAYER_DEBOUNCE_AMOUNT_MS);

    public updateGhostLayer = (
        nextGrid: number[][],
        nextSize: [number, number],
        repName?: RepresentationName,
        clickedTile?: [number, number]
    ) => {
        // Cancel any pending calls
        this.getSuggestionsFromModel.cancel();

        if (this.state.playMode) {
            return;
        }

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
            <div
                className={[
                    "App",
                    this.state.tileset || "",
                    this.state.playMode ? "play-mode" : "",
                ].join(" ")}
            >
                <Layout
                    header={[
                        <div className="logo-container" key="logo-container">
                            <Logo />
                        </div>,
                        <div
                            className="toolbar-container"
                            key="toolbar-container"
                        >
                            <Toolbar
                                playMode={this.state.playMode}
                                buttons={this.state.toolbarButtons.map((b) => ({
                                    ...b,
                                    selected:
                                        b.buttonValue ===
                                        this.state.currentRepresentation,
                                    onClick: this.onToolbarButtonClick,
                                }))}
                                onHistoryClick={this.handleUndoRedo}
                                gridSize={this.state.gridSize}
                                onUpdateGridSize={this.onUpdateGridSize}
                                onStepSizeChange={this.updateToolRadius}
                                defaultSelected={this.state.toolRadius}
                                defaultStep={this.state.numSteps}
                            />
                        </div>,
                    ]}
                    center={[
                        <div
                            className="sidebar-container"
                            key="sidebar_container1"
                        >
                            <Sidebar
                                buttons={this.state.sidebarButtons.map((b) => ({
                                    ...b,
                                    selected:
                                        b.buttonName ===
                                        this.state.selectedSidebarButtonName,
                                    onClick: this.onSidebarButtonClick,
                                }))}
                            />
                        </div>,
                        this.state.saveMode ? (
                            <div
                                className="stage-container"
                                key="stage_container1"
                            >
                                <Saving
                                    checkpoints={this.state.checkpoints}
                                    checkpointIndex={this.state.checkpointIndex}
                                />
                            </div>
                        ) : (
                            <div
                                className="stage-container"
                                key="stage_container2"
                            >
                                {!this.state.playMode ? (
                                    <Stage
                                        grids={{
                                            ...this.state.suggestedGrids,
                                        }}
                                        vertical={false}
                                        classSuffix="suggestions-stage"
                                        onGridClick={this.onGridClick}
                                        onGridUnClick={this.onGridUnClick}
                                        onCellMouseOver={this.onCellMouseOver}
                                        onCellMouseDown={this.onCellClick}
                                        onCellClick={this.onCellClick}
                                        onGhostGridClick={
                                            this.acceptGhostSuggestions
                                        }
                                        pendingSuggestions={
                                            this.state.pendingSuggestions
                                        }
                                    />
                                ) : (
                                    <GameActionViewer
                                        gameService={this.gameService}
                                    />
                                )}
                                <Stage
                                    grids={
                                        {
                                            user: this.state.grid as number[][],
                                        } as SuggestedGrids
                                    }
                                    classSuffix="user-stage"
                                    onGridClick={this.onGridClick}
                                    onGridUnClick={this.onGridUnClick}
                                    onCellMouseOver={this.onCellMouseOver}
                                    onCellMouseDown={this.onCellClick}
                                    onCellClick={this.onCellClick}
                                    onGhostGridClick={
                                        this.acceptGhostSuggestions
                                    }
                                    pendingSuggestions={
                                        this.state.playMode
                                            ? null
                                            : this.state.pendingSuggestions
                                    }
                                />
                            </div>
                        ),
                        this.state.playMode ? null : (
                            <div
                                className="tileset-container"
                                key="tileset_container1"
                            >
                                <Tileset
                                    buttons={this.state.tilesetButtons.map(
                                        (b) => ({
                                            ...b,
                                            selected:
                                                b.buttonValue ===
                                                this.state
                                                    .selectedTilesetButtonName,
                                            onClick: this.onTilesetButtonClick,
                                        })
                                    )}
                                    tilesets={SUPPORTED_TILESETS}
                                    onTileSetChange={this.updateTileSet}
                                />
                            </div>
                        ),
                    ]}
                    footer={[
                        <div
                            className="footer-stage-wrapper"
                            key="footer-stage-wrapper"
                        >
                            <Footer />
                        </div>,
                    ]}
                />
            </div>
        );
    }
}
