import React from "react";
import "./styles.css";
import { TILES } from "../../constants/tiles";

export interface TilesetButtonProps {
    text?: string;
    selected?: boolean;
    className?: string;
    icon?: string;
    buttonValue?: TILES;
    onClick?: (e: React.MouseEvent, p: TilesetButtonProps) => void;
}

const ICON_CLASSES: Record<TILES, string> = {
    [TILES.EMPTY]: "t0",
    [TILES.SOLID]: "t1",
    [TILES.PLAYER]: "t2",
    [TILES.CRATE]: "t3",
    [TILES.TARGET]: "t4",
};

export function TilesetButton(props: TilesetButtonProps) {
    const { text, selected, onClick, buttonValue = TILES.EMPTY } = props;
    const iconClass = ICON_CLASSES[buttonValue];
    return (
        <div className={"tileset-button-container"}>
            <div className={`tileset-icon ${iconClass}`}></div>
            <button
                className={`tileset-button${selected ? " selected" : ""}`}
                onClick={(ev) => (onClick ? onClick(ev, props) : null)}
            >
                {text}
            </button>
        </div>
    );
}
