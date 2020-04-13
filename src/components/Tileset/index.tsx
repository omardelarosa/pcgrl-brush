import React from "react";
import "./styles.css";
import { TilesetButton, TilesetButtonProps } from "../TilesetButton";

export interface TilesetProps {
    buttons: TilesetButtonProps[];
}

export function Tileset(props: TilesetProps) {
    const { buttons } = props;
    return (
        <div className="tileset">
            <div>
                TILESET<hr></hr>
            </div>
            {buttons.map((props: TilesetButtonProps, idx: number) => (
                <TilesetButton key={`tileset_${idx}`} {...props} />
            ))}
        </div>
    );
}
