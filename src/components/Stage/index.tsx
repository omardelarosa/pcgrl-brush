import React from "react";
import "./styles.css";
import { Grid, noop } from "../Grid";
import { CellHandler } from "../Grid/index";
import { RepresentationName } from "../../services/TensorFlow";

interface StageProps {
    grids: Record<string | RepresentationName, number[][]>;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
    onCellMouseDown?: CellHandler;
}

export function Stage({
    grids,
    onCellClick = noop,
    onCellMouseOver = noop,
    onGridUnClick = noop,
    onGridClick = noop,
    onCellMouseDown = noop,
}: StageProps) {
    return (
        <div className="stage rounded-container">
            {Object.keys(grids).map((gridName) => (
                <Grid
                    className="user-canvas"
                    matrix={grids[gridName]}
                    onCellClick={onCellClick}
                    onCellMouseOver={onCellMouseOver}
                    onCellMouseDown={onCellMouseDown}
                    onGridClick={onGridClick}
                    onGridUnClick={onGridUnClick}
                    gridLabel={gridName}
                />
            ))}
        </div>
    );
}
