import React from "react";
import "./App.css";
import { Layout } from "./Layout";
import { ButtonProps, SidebarButtonNames } from "./Button";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { Stage } from "./Stage";
import { Logo } from "./Logo";
import { TensorFlowService } from "../services/TensorFlow/index";
import { AppStateService, AppState } from "../services/AppState";

interface AppProps {}

// Temporarily aliasing this type until distinct button types are made

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

    public onGridClick = () => {
        this.setState({
            isClicking: true,
        });
    };

    public onGridUnClick = () => {
        this.setState({
            isClicking: false,
        });
        console.log(this.state.grid);
    };

    public onCellMouseOver = (row: number, col: number, data: number) => {
        if (this.state.isClicking) {
            const nextGrid = this.state.grid;
            nextGrid[row][col] = 1;
            this.setState({
                grid: nextGrid,
            });
        }
    };

    public onCellClick = (row: number, col: number, data: number) => {
        const nextGrid = this.state.grid;
        nextGrid[row][col] = 1;
        this.setState({
            grid: nextGrid,
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
                    stage={
                        <Stage
                            matrix={this.state.grid}
                            onGridClick={this.onGridClick}
                            onGridUnClick={this.onGridUnClick}
                            onCellMouseOver={this.onCellMouseOver}
                            onCellClick={this.onCellClick}
                        />
                    }
                />
            </div>
        );
    }
}
