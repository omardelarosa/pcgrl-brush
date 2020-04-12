import React from "react";
import "./styles.css"

export interface TilesetButtonProps {
    text?: string,
    selected?: boolean,
    className?: string,
    icon?: string,
    buttonName?: TilesetButtonNames,
    onClick?: (e: React.MouseEvent, p: TilesetButtonProps) => void;
}

export enum TilesetButtonNames {
    WALL = "WALL_BUTTON",
    CRATE = "CRATE_BUTTON",
    PLAYER = "PLAYER_BUTTON",
    GOAL = "GOAL_BUTTON",
    GROUND = "GROUND_BUTTON",
}

export function TilesetButton(props: TilesetButtonProps) {
    const {
        text,
        selected,
        icon,
        onClick,
    } = props;
    return (
        <div className={"tileset-button-container"}>
            <img src={icon} alt={text}></img>
            <button
                className={`tileset-button${selected ? " selected": ""}`}
                onClick={ev => (onClick ? onClick(ev, props) : null)}>
                    {text}
            </button>
        </div>
    )
}