import * as React from "react";
import "./styles.css";

export interface SizeUpdaterProps {
    gridSize: [number, number];
    onUpdateGridSize: (newSize: [number, number]) => void;
}

export interface SizeUpdaterState {}

export class SizeUpdater extends React.Component<
    SizeUpdaterProps,
    SizeUpdaterState
> {
    public render() {
        const [rows, cols] = this.props.gridSize;
        const { onUpdateGridSize } = this.props;
        return (
            <div className="size-updater button">
                <span className="size-updater__title">Grid Size</span>
                <div className="size-updater__input-group">
                    <div>
                        {"rows: "}
                        <input
                            className="button button-input"
                            onChange={(ev) => {
                                const gridSize: [number, number] = [
                                    Number(ev.target.value),
                                    this.props.gridSize[1],
                                ];
                                onUpdateGridSize(gridSize);
                            }}
                            placeholder={"Rows"}
                            value={rows}
                        />
                    </div>
                    <div>
                        {"cols: "}
                        <input
                            className="button button-input"
                            onChange={(ev) => {
                                const gridSize: [number, number] = [
                                    this.props.gridSize[0],
                                    Number(ev.target.value),
                                ];
                                onUpdateGridSize(gridSize);
                            }}
                            placeholder={"Columns"}
                            value={cols}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
