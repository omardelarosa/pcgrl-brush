import React from "react";
import "./styles.css";

export type CellHandler = (r: number, c: number, d: number) => void;

export const noop = () => undefined;

interface GridProps {
    matrix: number[][];
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
}
interface GridState {}

function GridCell({
    row,
    col,
    data,
    onCellClick = noop,
    onCellMouseOver = noop,
}: {
    row: number;
    col: number;
    data: number;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
}) {
    // TODO: add a classname based on the value to make tiling easier
    return (
        <div
            className={`grid-cell${data ? " filled" : ""}`}
            onClick={() => onCellClick(row, col, data)}
            onMouseOver={() => onCellMouseOver(row, col, data)}
        ></div>
    );
}

function GridRow({
    items = [],
    rowIndex,
    onCellClick = noop,
    onCellMouseOver = noop,
}: {
    items: number[];
    rowIndex: number;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
}) {
    return (
        <div className="grid-row noselect">
            {items.map((item, colIdx) => (
                <GridCell
                    key={`${rowIndex}_${colIdx}`}
                    row={rowIndex}
                    col={colIdx}
                    data={item}
                    onCellClick={onCellClick}
                    onCellMouseOver={onCellMouseOver}
                />
            ))}
        </div>
    );
}

export class Grid extends React.Component<GridProps, GridState> {
    public static defaultProps: GridProps = {
        matrix: [[]],
        onCellClick: noop,
        onCellMouseOver: noop,
        onGridClick: noop,
        onGridUnClick: noop,
    };

    public render() {
        const {
            onGridClick = noop,
            onGridUnClick = noop,
            onCellClick = noop,
            onCellMouseOver = noop,
        } = this.props;
        return (
            <div
                className="grid"
                onMouseDown={() => onGridClick(-1, -1, -1)}
                onMouseUp={() => onGridUnClick(-1, -1, -1)}
            >
                {/* Iterate over matrix making row elements */}
                {this.props.matrix.map((rowItems, idx) => (
                    <GridRow
                        items={rowItems}
                        rowIndex={idx}
                        key={`row_${idx}`}
                        onCellClick={onCellClick}
                        onCellMouseOver={onCellMouseOver}
                    />
                ))}
            </div>
        );
    }
}
