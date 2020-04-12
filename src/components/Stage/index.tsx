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
    onCellMouseDown?: CellHandler;
}

export function Stage({
    matrix,
    onCellClick = noop,
    onCellMouseOver = noop,
    onGridUnClick = noop,
    onGridClick = noop,
    onCellMouseDown = noop,
}: StageProps) {
    return (
        <div className="stage rounded-container">
            <Grid
                matrix={matrix}
                onCellClick={onCellClick}
                onCellMouseOver={onCellMouseOver}
                onCellMouseDown={onCellMouseDown}
                onGridClick={onGridClick}
                onGridUnClick={onGridUnClick}
            />

            <Grid
                matrix={matrix}
                onCellClick={noop}
                onCellMouseOver={noop}
                onCellMouseDown={noop}
                onGridClick={noop}
                onGridUnClick={noop}
            />
        </div>
    );
}
