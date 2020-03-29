import React from "react";
import "./styles.css";
import { Grid, noop } from "../Grid";
import { CellHandler } from "../Grid/index";

interface StageProps {
    matrix: number[][];
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
}

export function Stage({
    matrix,
    onCellClick = noop,
    onCellMouseOver = noop,
    onGridUnClick = noop,
    onGridClick = noop,
}: StageProps) {
    return (
        <div className="stage rounded-container">
            <Grid
                matrix={matrix}
                onCellClick={onCellClick}
                onCellMouseOver={onCellMouseOver}
                onGridClick={onGridClick}
                onGridUnClick={onGridUnClick}
            />
        </div>
    );
}
