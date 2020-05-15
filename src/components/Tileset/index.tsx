import React from "react";
import "./styles.css";
import { TilesetButton, TilesetButtonProps } from "../TilesetButton";
import _ from "lodash";

export interface TilesetProps {
    buttons: TilesetButtonProps[];
    onTileSetChange?: (s: string) => void;
    tilesets?: string[];
}

export function Tileset(props: TilesetProps) {
    const { buttons, tilesets = [], onTileSetChange = _.noop } = props;
    return (
        <div className={"tileset"}>
            <div className="tileset-heading">
                <span className="heavy-text">Tileset</span>
                <hr></hr>
                {tilesets.map((t) => (
                    <button
                        className="tileset-toggle"
                        onClick={() => onTileSetChange(t)}
                    >
                        {t}
                    </button>
                ))}
                <hr></hr>
            </div>
            {buttons.map((props: TilesetButtonProps, idx: number) => (
                <TilesetButton key={`tileset_${idx}`} {...props} />
            ))}
        </div>
    );
}
