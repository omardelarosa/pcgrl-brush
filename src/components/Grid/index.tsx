import React from "react";
import "./styles.css";

export type CellHandler = (r: number, c: number, d: number) => void;

export const noop = () => undefined;

interface GridProps {
    matrix: number[][] | null;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onCellMouseDown?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
    className?: string;
    gridLabel?: string;
}
interface GridState {}

function GridCell({
    row,
    col,
    data,
    onCellClick = noop,
    onCellMouseOver = noop,
    onCellMouseDown = noop,
}: {
    row: number;
    col: number;
    data: number;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onCellMouseDown?: CellHandler;
}) {
    // TODO: add a classname based on the value to make tiling easier
    return (
        <div
            className={`grid-cell${
                typeof data !== "undefined" ? ` t${data}` : ""
            }`}
            onClick={() => onCellClick(row, col, data)}
            onMouseOver={() => onCellMouseOver(row, col, data)}
            onMouseDown={() => onCellMouseDown(row, col, data)}
        ></div>
    );
}

function GridRow({
    items = [],
    rowIndex,
    onCellClick = noop,
    onCellMouseOver = noop,
    onCellMouseDown = noop,
}: {
    items: number[];
    rowIndex: number;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onCellMouseDown?: CellHandler;
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
                    onCellMouseDown={onCellMouseDown}
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
        onCellMouseDown: noop,
    };

    public render() {
        const {
            onGridClick = noop,
            onGridUnClick = noop,
            onCellClick = noop,
            onCellMouseOver = noop,
            onCellMouseDown = noop,
            gridLabel = "",
        } = this.props;
        return (
            <div className="grid-wrapper">
                <div
                    className={"grid " + this.props.className}
                    onMouseDown={() => onGridClick(-1, -1, -1)}
                    onMouseUp={() => onGridUnClick(-1, -1, -1)}
                >
                    {/* Iterate over matrix making row elements */}
                    {this.props.matrix &&
                        this.props.matrix.map((rowItems, idx) => (
                            <GridRow
                                items={rowItems}
                                rowIndex={idx}
                                key={`row_${idx}`}
                                onCellClick={onCellClick}
                                onCellMouseOver={onCellMouseOver}
                                onCellMouseDown={onCellMouseDown}
                            />
                        ))}
                </div>
                {gridLabel && (
                    <div className="grid-row grid-label">{gridLabel}</div>
                )}
            </div>
        );
    }
}
