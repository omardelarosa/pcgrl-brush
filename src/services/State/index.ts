import { SidebarButtonNames } from "../../components/Button";
import { IconNames } from "../../components/Icons";
import { TensorFlowService } from "../TensorFlow";

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
            grid: TensorFlowService.createMatrix(100, 100),
        };
    }
}
