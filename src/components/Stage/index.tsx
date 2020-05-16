import React from "react";
import "./styles.css";
import { Grid, noop } from "../Grid";
import { CellHandler } from "../Grid/index";
import { SuggestedGrids, SuggestionsByType } from "../../constants";
import { RepresentationName } from "../../services/TensorFlow";
import { LoadingIndicator } from "../LoadingIndicator";

interface StageProps {
    grids: SuggestedGrids;
    classSuffix?: string;
    pendingSuggestions?: SuggestionsByType | null;
    onCellClick?: CellHandler;
    onCellMouseOver?: CellHandler;
    onGridClick?: CellHandler;
    onGridUnClick?: CellHandler;
    onCellMouseDown?: CellHandler;
    onGhostGridClick?: CellHandler;
    vertical?: boolean;
    playMode?: boolean;
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
    classSuffix = "",
    playMode,
}: StageProps) {
    return (
        <div
            className={[
                "stage",
                "rounded-container",
                vertical ? "vertical-arrangement" : "",
                classSuffix,
            ].join(" ")}
        >
            {!grids ? <LoadingIndicator key="loading-indicator-stage" /> : null}
            {Object.keys(grids).map(
                (gridName: RepresentationName | string, idx) => (
                    <div key={`grid-${gridName}-idx`}>
                        {grids[gridName as RepresentationName] ? (
                            <Grid
                                key={"grid_element_" + idx}
                                className={
                                    gridName === "user"
                                        ? "user-canvas"
                                        : "ghost-canvas"
                                }
                                matrix={
                                    grids[gridName as RepresentationName] ||
                                    null
                                }
                                onCellClick={
                                    gridName === "user"
                                        ? onCellClick
                                        : undefined
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
                                    gridName === "user"
                                        ? onGridUnClick
                                        : undefined
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
                        ) : (
                            <LoadingIndicator />
                        )}
                        {playMode ? null : (
                            <div className="grid-label">{gridName}</div>
                        )}
                    </div>
                )
            )}
        </div>
    );
}
