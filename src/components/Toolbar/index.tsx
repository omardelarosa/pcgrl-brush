import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";
import { SizeUpdater } from "../SizeUpdater";
import { StepSize } from "../StepSize";
import { History } from "../History";

export interface ToolbarProps {
    playMode?: boolean;
    buttons?: ButtonProps[];
    gridSize: [number, number];
    enableResize?: boolean;
    onUpdateGridSize: (newSize: [number, number]) => void;
    onStepSizeChange?: (step: number, radius: number) => void;
}

export function Toolbar({
    buttons = [],
    onUpdateGridSize,
    gridSize,
    enableResize,
    onStepSizeChange,
    playMode,
}: ToolbarProps) {
    if (playMode) {
        return null;
    }
    return (
        <div className="toolbar rounded-container">
            <History />
            {buttons.map((props: ButtonProps, idx: number) => (
                <Button {...props} key={"toolbar_button_" + idx} />
            ))}
            {enableResize && (
                <SizeUpdater
                    key="size_updater"
                    onUpdateGridSize={onUpdateGridSize}
                    gridSize={gridSize}
                />
            )}
            <StepSize onEffect={onStepSizeChange} />
        </div>
    );
}
