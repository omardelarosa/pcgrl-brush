import React from "react";
import "./styles.css";
import { ISuggestion } from "../../services/TensorFlow";
import { RepresentationName } from "../../services/TensorFlow/index";

export type CellHandler = (
    r: number,
    c: number,
    d: number,
    l?: RepresentationName
) => void;

export const noop = () => undefined;

interface GridProps {
    matrix: number[][] | null;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onCellMouseDown?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
    className?: string;
    gridLabel?: RepresentationName;
    pendingSuggestions?: ISuggestion[];
}
interface GridState {}

function GridCell({
    row,
    col,
    data,
    onCellClick = noop,
    onCellMouseOver = noop,
    onCellMouseDown = noop,
    isHighlighted = false,
    gridLabel,
}: {
    row: number;
    col: number;
    data: number;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onCellMouseDown?: CellHandler;
    isHighlighted?: boolean;
    gridLabel?: RepresentationName;
}) {
    // TODO: add a classname based on the value to make tiling easier
    return (
        <div
            className={[
                "grid-cell",
                typeof data !== "undefined" ? `t${data}` : "",
                isHighlighted ? "grid-cell__highlighted" : "",
            ].join(" ")}
            onClick={() => onCellClick(row, col, data, gridLabel)}
            onMouseOver={() => onCellMouseOver(row, col, data)}
            onMouseDown={() => onCellMouseDown(row, col, data)}
        ></div>
    );
}

function GridRow({ children }: { children: JSX.Element[] }) {
    return <div className="grid-row noselect">{children}</div>;
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
            gridLabel,
            pendingSuggestions = [],
        } = this.props;
        const suggestionSet: Record<number, Record<number, boolean>> = {};
        pendingSuggestions.forEach((suggestion: ISuggestion) => {
            const [row, col] = suggestion.pos;
            if (!suggestionSet[row]) {
                suggestionSet[row] = {};
            }
            suggestionSet[row][col] = true;
        });
        return (
            <div className="grid-wrapper">
                <div
                    className={"grid " + this.props.className}
                    onMouseDown={() => onGridClick(-1, -1, -1, gridLabel)}
                    onMouseUp={() => onGridUnClick(-1, -1, -1, gridLabel)}
                >
                    {/* Iterate over matrix making row elements */}
                    {this.props.matrix &&
                        this.props.matrix.map((rowItems, rowIdx) => (
                            <GridRow key={`row_${rowIdx}`}>
                                {rowItems.map((item, colIdx) => {
                                    return (
                                        <GridCell
                                            key={`${rowIdx}_${colIdx}`}
                                            row={rowIdx}
                                            col={colIdx}
                                            data={item}
                                            isHighlighted={
                                                suggestionSet[rowIdx] &&
                                                suggestionSet[rowIdx][colIdx]
                                            }
                                            onCellClick={onCellClick}
                                            onCellMouseOver={onCellMouseOver}
                                            onCellMouseDown={onCellMouseDown}
                                            gridLabel={gridLabel || undefined}
                                        />
                                    );
                                })}
                            </GridRow>
                        ))}
                </div>
                {gridLabel && (
                    <div className="grid-row grid-label">{gridLabel}</div>
                )}
            </div>
        );
    }
}
