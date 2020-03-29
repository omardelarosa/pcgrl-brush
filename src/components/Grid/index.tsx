import React from "react";
import "./styles.css";

interface GridProps {
    matrix: number[][];
    onCellClick: (r: number, c: number, d: number) => void;
}
interface GridState {}

function GridCell({
    row,
    col,
    data,
    onCellClick,
}: {
    row: number;
    col: number;
    data: number;
    onCellClick: (r: number, c: number, d: number) => void;
}) {
    // TODO: add a classname based on the value to make tiling easier
    return (
        <div
            className={`grid-cell${data ? " filled" : ""}`}
            onClick={() => onCellClick(row, col, data)}
        ></div>
    );
}

function GridRow({
    items = [],
    rowIndex,
    onCellClick,
}: {
    items: number[];
    rowIndex: number;
    onCellClick: (r: number, c: number, d: number) => void;
}) {
    return (
        <div className="grid-row">
            {items.map((item, colIdx) => (
                <GridCell
                    key={`${rowIndex}_${colIdx}`}
                    row={rowIndex}
                    col={colIdx}
                    data={item}
                    onCellClick={onCellClick}
                />
            ))}
        </div>
    );
}

export class Grid extends React.Component<GridProps, GridState> {
    public static defaultProps: GridProps = {
        matrix: [[]],
        onCellClick: () => undefined,
    };

    public render() {
        return (
            <div className="grid">
                {/* Iterate over matrix making row elements */}
                {this.props.matrix.map((rowItems, idx) => (
                    <GridRow
                        items={rowItems}
                        rowIndex={idx}
                        key={`row_${idx}`}
                        onCellClick={this.props.onCellClick}
                    />
                ))}
            </div>
        );
    }
}
