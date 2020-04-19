import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";
import { SizeUpdater } from "../SizeUpdater";

export interface ToolbarProps {
    buttons?: ButtonProps[];
    gridSize: [number, number];
    enableResize?: boolean;
    onUpdateGridSize: (newSize: [number, number]) => void;
}

export function Toolbar({
    buttons = [],
    onUpdateGridSize,
    gridSize,
    enableResize,
}: ToolbarProps) {
    return (
        <div className="toolbar rounded-container">
            {buttons.map((props: ButtonProps) => (
                <Button {...props} />
            ))}
            {enableResize && (
                <SizeUpdater
                    onUpdateGridSize={onUpdateGridSize}
                    gridSize={gridSize}
                />
            )}
        </div>
    );
}
