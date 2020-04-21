import { SidebarButtonNames, ButtonProps } from "../../components/Button";
import { IconNames } from "../../components/Icons";
import { TilesetButtonProps } from "../../components/TilesetButton";
import { RepresentationName } from "../TensorFlow";
import { TILES } from "../../constants/tiles";
import { TensorFlowService } from "../TensorFlow/index";

// Number of rows and tiles in stage grid
const DEFAULT_STAGE_GRID_SIZE: [number, number] = [5, 5];
const DEFAULT_PLAYER_POS: [number, number] = [2, 2];

type ToolbarButtonNames = SidebarButtonNames;
export type SuggestedGrids = Partial<
    Record<RepresentationName | "user", number[][] | null>
>;

export interface AppState {
    sidebarButtons: ButtonProps[];
    toolbarButtons: ButtonProps[];
    tilesetButtons: TilesetButtonProps[];
    selectedSidebarButtonName?: SidebarButtonNames;
    selectedToolbarButtonName?: ToolbarButtonNames;
    selectedTilesetButtonName?: TILES;
    grid: number[][]; // A matrix representation of the tile grid.
    gridSize: [number, number];
    isClicking: boolean;
    suggestedGrids: SuggestedGrids;
    currentRepresentation?: RepresentationName;
    playerPos: [number, number];
}

export class AppStateService {
    public static createAppInitialState() {
        return {
            sidebarButtons: [
                {
                    buttonName: SidebarButtonNames.PENCIL_BUTTON,
                    iconName: IconNames.PENCIL,
                    className: "sidebar",
                },
                {
                    buttonName: SidebarButtonNames.ERASE,
                    iconName: IconNames.PAINT_FORMAT,
                    className: "sidebar",
                },
                {
                    buttonName: SidebarButtonNames.TRASH,
                    iconName: IconNames.BIN,
                    className: "sidebar",
                },
                // Add additional buttons here and they will appear in the UI...
            ],
            toolbarButtons: [
                {
                    buttonName: SidebarButtonNames.PENCIL_BUTTON,
                    buttonText: "Narrow",
                    buttonValue: "narrow",
                },
                {
                    buttonName: SidebarButtonNames.EYE_DROPPER_BUTTON,
                    buttonText: "Turtle",
                    buttonValue: "turtle",
                },
                {
                    buttonName: SidebarButtonNames.DROPLET_BUTTON,
                    buttonText: "Wide",
                    buttonValue: "wide",
                },
                // Add additional buttons here and they will appear in the UI...
            ],
            tilesetButtons: [
                {
                    text: "Wall",
                    // icon: WallIcon,
                    buttonValue: TILES.SOLID,
                },
                {
                    text: "Crate",
                    // icon: CrateIcon,
                    buttonValue: TILES.CRATE,
                },
                {
                    text: "Player",
                    // icon: PlayerIcon,
                    buttonValue: TILES.PLAYER,
                },
                {
                    text: "Goal",
                    // icon: GoalIcon,
                    buttonValue: TILES.TARGET,
                },
                {
                    text: "Ground",
                    // icon: GroundIcon,
                    buttonValue: TILES.EMPTY,
                },
            ],
            selectedSidebarButtonName: SidebarButtonNames.PENCIL_BUTTON, // Pencil is selected by default
            selectedToolbarButtonNames: SidebarButtonNames.PENCIL_BUTTON,
            selectedTilesetButtonName: TILES.SOLID,
            gridSize: DEFAULT_STAGE_GRID_SIZE,
            grid: TensorFlowService.createGameGrid(DEFAULT_STAGE_GRID_SIZE)
                .grid,
            // AI Suggested grids
            suggestedGrids: {
                narrow: null,
                turtle: null,
                wide: null,
            },
            playerPos: DEFAULT_PLAYER_POS,
            isClicking: false,
        };
    }
}
