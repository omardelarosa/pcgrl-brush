import React from "react";
import "./styles.css";
import { Grid, noop } from "../Grid";
import { CellHandler } from "../Grid/index";
import { SuggestedGrids } from "../../services/AppState";
import { RepresentationName } from "../../services/TensorFlow";

interface StageProps {
    grids: SuggestedGrids;
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
            {Object.keys(grids).map(
                (gridName) =>
                    grids[gridName as RepresentationName] && (
                        <Grid
                            className={
                                gridName === "user"
                                    ? "user-canvas"
                                    : "ghost-canvas"
                            }
                            matrix={
                                grids[gridName as RepresentationName] || null
                            }
                            onCellClick={onCellClick}
                            onCellMouseOver={onCellMouseOver}
                            onCellMouseDown={onCellMouseDown}
                            onGridClick={onGridClick}
                            onGridUnClick={onGridUnClick}
                            gridLabel={gridName}
                        />
                    )
            )}
        </div>
    );
}
