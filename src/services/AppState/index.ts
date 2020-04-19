import { SidebarButtonNames, ButtonProps } from "../../components/Button";
import { IconNames } from "../../components/Icons";
import { Numeric } from "../Numeric";
import {
    TilesetButtonProps,
    TilesetButtonNames,
} from "../../components/TilesetButton";
import WallIcon from "../../assets/images/block_08.png";
import CrateIcon from "../../assets/images/crate_02.png";
import PlayerIcon from "../../assets/images/player_01.png";
import GoalIcon from "../../assets/images/environment_02.png";
import GroundIcon from "../../assets/images/ground_06.png";

// Number of rows and tiles in stage grid
const DEFAULT_STAGE_GRID_SIZE: [number, number] = [5, 5];

type ToolbarButtonNames = SidebarButtonNames;

export interface AppState {
    sidebarButtons: ButtonProps[];
    toolbarButtons: ButtonProps[];
    tilesetButtons: TilesetButtonProps[];
    selectedSidebarButtonName?: SidebarButtonNames;
    selectedToolbarButtonName?: ToolbarButtonNames;
    selectedTilesetButtonName?: TilesetButtonNames;
    grid: number[][]; // A matrix representation of the tile grid.
    gridSize: [number, number];
    isClicking: boolean;
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
                },
                {
                    buttonName: SidebarButtonNames.EYE_DROPPER_BUTTON,
                    buttonText: "Turtle",
                },
                {
                    buttonName: SidebarButtonNames.DROPLET_BUTTON,
                    buttonText: "Wide",
                },
                // Add additional buttons here and they will appear in the UI...
            ],
            tilesetButtons: [
                {
                    text: "Wall",
                    icon: WallIcon,
                    buttonName: TilesetButtonNames.WALL,
                },
                {
                    text: "Crate",
                    icon: CrateIcon,
                    buttonName: TilesetButtonNames.CRATE,
                },
                {
                    text: "Player",
                    icon: PlayerIcon,
                    buttonName: TilesetButtonNames.PLAYER,
                },
                {
                    text: "Goal",
                    icon: GoalIcon,
                    buttonName: TilesetButtonNames.GOAL,
                },
                {
                    text: "Ground",
                    icon: GroundIcon,
                    buttonName: TilesetButtonNames.GROUND,
                },
            ],
            selectedSidebarButtonName: SidebarButtonNames.PENCIL_BUTTON, // Pencil is selected by default
            selectedToolbarButtonNames: SidebarButtonNames.PENCIL_BUTTON,
            selectedTilesetButtonName: TilesetButtonNames.WALL,
            gridSize: DEFAULT_STAGE_GRID_SIZE,
            grid: Numeric.createMatrix(
                DEFAULT_STAGE_GRID_SIZE[0],
                DEFAULT_STAGE_GRID_SIZE[1]
            ),
            isClicking: false,
        };
    }
}
