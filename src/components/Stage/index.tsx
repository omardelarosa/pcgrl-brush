import React from "react";
import "./styles.css";
import { Grid, noop } from "../Grid";
import { CellHandler } from "../Grid/index";
import { SuggestedGrids } from "../../services/AppState";
import { RepresentationName, ISuggestion } from "../../services/TensorFlow";

interface StageProps {
    grids: SuggestedGrids;
    pendingSuggestions?: ISuggestion[];
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
    onCellMouseDown?: CellHandler;
    onGhostGridClick?: CellHandler;
}

export function Stage({
    grids,
    onCellClick = noop,
    onCellMouseOver = noop,
    onGridUnClick = noop,
    onGridClick = noop,
    onCellMouseDown = noop,
    onGhostGridClick = noop,
    pendingSuggestions = [],
}: StageProps) {
    return (
        <div className="stage rounded-container">
            {Object.keys(grids).map(
                (gridName, idx) =>
                    grids[gridName as RepresentationName] && (
                        <Grid
                            key={"grid_element_" + idx}
                            className={
                                gridName === "user"
                                    ? "user-canvas"
                                    : "ghost-canvas"
                            }
                            matrix={
                                grids[gridName as RepresentationName] || null
                            }
                            onCellClick={
                                gridName === "user" ? onCellClick : undefined
                            }
                            onCellMouseOver={
                                gridName === "user"
                                    ? onCellMouseOver
                                    : undefined
                            }
                            onCellMouseDown={
                                gridName === "user"
                                    ? onCellMouseDown
                                    : undefined
                            }
                            onGridClick={
                                gridName === "user"
                                    ? onGridClick
                                    : onGhostGridClick
                            }
                            onGridUnClick={
                                gridName === "user" ? onGridUnClick : undefined
                            }
                            gridLabel={gridName}
                            pendingSuggestions={pendingSuggestions}
                        />
                    )
            )}
        </div>
    );
}
