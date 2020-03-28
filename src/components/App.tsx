import React from "react";
import "./App.css";
import { Layout } from "./Layout";
import { ButtonProps, SidebarButtonNames } from "./Button";
import { Sidebar } from "./Sidebar";
import { Toolbar, ToolbarProps } from "./Toolbar";
import { Stage } from "./Stage";
import { IconNames } from "./Icons/index";
import { Logo } from "./Logo";
import { TensorFlowService } from "../services/TensorFlow/index";

interface AppProps {}

// Temporarily aliasing this type until distinct button types are made
type ToolbarButtonNames = SidebarButtonNames;

interface AppState {
    sidebarButtons: ButtonProps[];
    toolbarButtons: ButtonProps[];
    selectedSidebarButtonName?: SidebarButtonNames;
    selectedToolbarButtonName?: ToolbarButtonNames;
}

const appInitialState = {
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
};

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = appInitialState;
    }

    public componentDidMount() {
        TensorFlowService.tensorFlowHelloWorld();
    }

    public onSidebarButtonClick = (ev: React.MouseEvent, p: ButtonProps) => {
        // This is a basic selection state, needs actual functionalities defined.
        this.setState({
            selectedSidebarButtonName: p.buttonName,
        });
    };

    public onToolbarButtonClick = (ev: React.MouseEvent, p: ButtonProps) => {
        // This is a basic selection state, needs actual functionalities defined.
        this.setState({
            selectedToolbarButtonName: p.buttonName,
        });
    };

    public render() {
        return (
            <div className="App">
                <Layout
                    logo={<Logo />}
                    sidebar={
                        <Sidebar
                            buttons={this.state.sidebarButtons.map(b => ({
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
                            buttons={this.state.toolbarButtons.map(b => ({
                                ...b,
                                selected:
                                    b.buttonName ===
                                    this.state.selectedToolbarButtonName,
                                onClick: this.onToolbarButtonClick,
                            }))}
                        />
                    }
                    stage={<Stage />}
                />
            </div>
        );
    }
}
