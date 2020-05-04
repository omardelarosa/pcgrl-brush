import React from "react";
import "./styles.css";
import { Grid, noop } from "../Grid";
import { CellHandler } from "../Grid/index";
import { SuggestedGrids, SuggestionsByType } from "../../services/AppState";
import { RepresentationName } from "../../services/TensorFlow";

interface StageProps {
    grids: SuggestedGrids;
    pendingSuggestions?: SuggestionsByType | null;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
    onCellMouseDown?: CellHandler;
    onGhostGridClick?: CellHandler;
    vertical?: boolean;
}

export function Stage({
    grids,
    onCellClick = noop,
    onCellMouseOver = noop,
    onGridUnClick = noop,
    onGridClick = noop,
    onCellMouseDown = noop,
    onGhostGridClick = noop,
    pendingSuggestions = {},
    vertical = false,
}: StageProps) {
    return (
        <div
            className={[
                "stage",
                "rounded-container",
                vertical ? "vertical-arrangement" : "",
            ].join(" ")}
        >
            {Object.keys(grids).map(
                (gridName: RepresentationName | string, idx) =>
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
                            gridLabel={gridName as RepresentationName}
                            pendingSuggestions={
                                pendingSuggestions
                                    ? pendingSuggestions[
                                          gridName as RepresentationName
                                      ] || []
                                    : []
                            }
                        />
                    )
            )}
        </div>
    );
}
