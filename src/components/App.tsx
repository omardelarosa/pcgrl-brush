import React from "react";
import "./App.css";
import { Layout } from "./Layout";
import { ButtonProps, SidebarButtonNames } from "./Button";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { Stage } from "./Stage";
import { Logo } from "./Logo";
import { TensorFlowService } from "../services/TensorFlow/index";
import { AppStateService } from "../services/State";

interface AppProps {}

// Temporarily aliasing this type until distinct button types are made
type ToolbarButtonNames = SidebarButtonNames;

interface AppState {
    sidebarButtons: ButtonProps[];
    toolbarButtons: ButtonProps[];
    selectedSidebarButtonName?: SidebarButtonNames;
    selectedToolbarButtonName?: ToolbarButtonNames;
    grid: number[][]; // A matrix representation of the tile grid.
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = AppStateService.createAppInitialState();
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

    public onGridCellClick = (row: number, col: number, data: number) => {
        console.log("clicked: ", row, col, data);
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
                    stage={
                        <Stage
                            matrix={this.state.grid}
                            onCellClick={this.onGridCellClick}
                        />
                    }
                />
            </div>
        );
    }
}
