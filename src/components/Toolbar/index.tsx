import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";

export interface ToolbarProps {
    buttons?: ButtonProps[];
    gridSize: [number, number];
    onUpdateGridSize: (newSize: [number, number]) => void;
}

export interface GridSizeUpdaterProps {
    gridSize: [number, number];
    onUpdateGridSize: (newSize: [number, number]) => void;
}

export interface GridSizeUpdaterState {
    gridSize: [number, number];
}

class GridSizeUpdater extends React.Component<
    GridSizeUpdaterProps,
    GridSizeUpdaterState
> {
    state = {
        gridSize: [0, 0],
    } as GridSizeUpdaterState;

    public onUpdateGridSize = () => {
        const { onUpdateGridSize } = this.props;
        onUpdateGridSize(this.state.gridSize);
    };

    public render() {
        const [rows, cols] = this.state.gridSize;

        return (
            <div className="grid-size-updater">
                <input
                    onChange={(ev) => {
                        const gridSize: [number, number] = [
                            Number(ev.target.value),
                            this.state.gridSize[1],
                        ];
                        this.setState({
                            gridSize,
                        });
                    }}
                    placeholder={"Rows"}
                    value={rows}
                />
                <input
                    onChange={(ev) => {
                        const gridSize: [number, number] = [
                            this.state.gridSize[0],
                            Number(ev.target.value),
                        ];
                        this.setState({
                            gridSize,
                        });
                    }}
                    placeholder={"Columns"}
                    value={cols}
                />
                <Button
                    onClick={this.onUpdateGridSize}
                    buttonText="Update Grid Size"
                />
            </div>
        );
    }
}

export function Toolbar({
    buttons = [],
    onUpdateGridSize,
    gridSize,
}: ToolbarProps) {
    return (
        <div className="toolbar rounded-container">
            {buttons.map((props: ButtonProps) => (
                <Button {...props} />
            ))}
            <GridSizeUpdater
                onUpdateGridSize={onUpdateGridSize}
                gridSize={gridSize}
            />
        </div>
    );
}
