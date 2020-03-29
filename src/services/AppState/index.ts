import { SidebarButtonNames } from "../../components/Button";
import { IconNames } from "../../components/Icons";
import { Numeric } from "../Numeric";

// Number of rows and tiles in stage grid
const DEFAULT_STAGE_GRID_SIZE = [64, 64];

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
                    buttonName: SidebarButtonNames.EYE_DROPPER_BUTTON,
                    iconName: IconNames.EYE_DROPPER,
                    className: "sidebar",
                },
                {
                    buttonName: SidebarButtonNames.DROPLET_BUTTON,
                    iconName: IconNames.DROPLET,
                    className: "sidebar",
                },
                {
                    buttonName: SidebarButtonNames.PAINT_FORMAT_BUTTON,
                    iconName: IconNames.PAINT_FORMAT,
                    className: "sidebar",
                },
                // Add additional buttons here and they will appear in the UI...
            ],
            toolbarButtons: [
                {
                    buttonName: SidebarButtonNames.PENCIL_BUTTON,
                    iconName: IconNames.PENCIL,
                },
                {
                    buttonName: SidebarButtonNames.EYE_DROPPER_BUTTON,
                    iconName: IconNames.EYE_DROPPER,
                },
                {
                    buttonName: SidebarButtonNames.DROPLET_BUTTON,
                    iconName: IconNames.DROPLET,
                },
                {
                    buttonName: SidebarButtonNames.PAINT_FORMAT_BUTTON,
                    iconName: IconNames.PAINT_FORMAT,
                },
                // Add additional buttons here and they will appear in the UI...
            ],
            selectedSidebarButtonName: SidebarButtonNames.PENCIL_BUTTON, // Pencil is selected by default
            selectedToolbarButtonNames: SidebarButtonNames.PENCIL_BUTTON,
            gridSize: DEFAULT_STAGE_GRID_SIZE,
            grid: Numeric.createMatrix(
                DEFAULT_STAGE_GRID_SIZE[0],
                DEFAULT_STAGE_GRID_SIZE[1]
            ),
        };
    }
}
