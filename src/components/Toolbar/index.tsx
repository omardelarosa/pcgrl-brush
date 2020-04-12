import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";
import { SizeUpdater } from "../SizeUpdater";

export interface ToolbarProps {
    buttons?: ButtonProps[];
    gridSize: [number, number];
    onUpdateGridSize: (newSize: [number, number]) => void;
}

export function Toolbar({
    buttons = [],
    onUpdateGridSize,
    gridSize,
}: ToolbarProps) {
    return (
        <div className="toolbar rounded-container">
            {buttons.map((props: ButtonProps) => (
                <Button {...props} />
            ))}
            <SizeUpdater
                onUpdateGridSize={onUpdateGridSize}
                gridSize={gridSize}
            />
        </div>
    );
}
