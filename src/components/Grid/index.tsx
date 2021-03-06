import React from "react";
import "./styles.css";
import { ISuggestion } from "../../services/TensorFlow";
import {
    RepresentationName,
    TensorFlowService,
} from "../../services/TensorFlow/index";
import { BOARD_SIZE_PX } from "../../constants";
import { LoadingIndicator } from "../LoadingIndicator";
import { times } from "lodash";
import { TILES } from "../../constants/tiles";

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
    size,
    onCellClick = noop,
    onCellMouseOver = noop,
    onCellMouseDown = noop,
    isHighlighted = false,
    gridLabel,
}: {
    row: number;
    col: number;
    data: number;
    size: number[];
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
                typeof data !== "undefined" ? `t${data % 10}` : "",
                isHighlighted ? "grid-cell__highlighted" : "",
            ].join(" ")}
            /* style={{
                width: size[0],
                height: size[1],
            }} */
            onClick={() => onCellClick(row, col, data, gridLabel)}
            onMouseOver={() => onCellMouseOver(row, col, data)}
            onMouseDown={() => onCellMouseDown(row, col, data)}
        ></div>
    );
}

function GridRow({ children }: { children: JSX.Element[] }) {
    return <div className="grid-row noselect">{children}</div>;
}

function OuterWall() {
    return <div className={`grid-cell t${TILES.SOLID}`}></div>;
}

function WallRow({ matrix }: { matrix: number[][] }) {
    const size = matrix.length + 2;
    return (
        <div className="grid-row noselect">
            {times(size, (n) => (
                <OuterWall key={`outer_wall_${n}`} />
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
        const matrix = this.props.matrix;
        let cellSize = [0, 0];
        if (matrix) {
            const cellPx = Math.round(BOARD_SIZE_PX / matrix.length / 2);
            cellSize = [cellPx, cellPx];
        }

        // NOTE: user grid can never be "empty" since user might want to have all empty tiles.
        const isEmptyMatrix =
            gridLabel !== "user" && TensorFlowService.isEmptyGrid(matrix);

        return (
            <div className="grid-wrapper">
                <div
                    className={"grid " + this.props.className}
                    onMouseDown={() => onGridClick(-1, -1, -1, gridLabel)}
                    onMouseUp={() => onGridUnClick(-1, -1, -1, gridLabel)}
                >
                    {/* Iterate over matrix making row elements */}
                    {!isEmptyMatrix && matrix ? (
                        [
                            <WallRow matrix={matrix} key="wall-row1" />,
                            ...matrix.map((rowItems, rowIdx) => (
                                <GridRow key={`row_${rowIdx}`}>
                                    {[
                                        <OuterWall
                                            key={`outer-wall-${rowIdx}-1`}
                                        />,
                                        ...rowItems.map((item, colIdx) => {
                                            return (
                                                <GridCell
                                                    key={`${rowIdx}_${colIdx}`}
                                                    row={rowIdx}
                                                    col={colIdx}
                                                    data={item}
                                                    size={cellSize}
                                                    isHighlighted={
                                                        suggestionSet[rowIdx] &&
                                                        suggestionSet[rowIdx][
                                                            colIdx
                                                        ]
                                                    }
                                                    onCellClick={onCellClick}
                                                    onCellMouseOver={
                                                        onCellMouseOver
                                                    }
                                                    onCellMouseDown={
                                                        onCellMouseDown
                                                    }
                                                    gridLabel={
                                                        gridLabel || undefined
                                                    }
                                                />
                                            );
                                        }),
                                        <OuterWall
                                            key={`outer-wall-${rowIdx}-2`}
                                        />,
                                    ]}
                                </GridRow>
                            )),
                            <WallRow matrix={matrix} key="wall-row2" />,
                        ]
                    ) : (
                        <LoadingIndicator />
                    )}
                </div>
            </div>
        );
    }
}
