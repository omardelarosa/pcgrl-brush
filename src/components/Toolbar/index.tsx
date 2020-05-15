import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";
import { SizeUpdater } from "../SizeUpdater";
import { StepSize } from "../StepSize";
import { History } from "../History";
import { Instructions } from "../Instructions";

export interface ToolbarProps {
    playMode?: boolean;
    buttons?: ButtonProps[];
    gridSize: [number, number];
    enableResize?: boolean;
    onUpdateGridSize: (newSize: [number, number]) => void;
    onStepSizeChange?: (step: number, radius: number) => void;
    onHistoryClick?: (direction: number) => void;
    defaultStep: number;
    defaultSelected: number;
}

export function Toolbar({
    buttons = [],
    onUpdateGridSize,
    gridSize,
    enableResize,
    onStepSizeChange,
    playMode,
    onHistoryClick,
    defaultStep,
    defaultSelected,
}: ToolbarProps) {
    if (playMode) {
        return <Instructions />;
    }
    return (
        <div className="toolbar rounded-container">
            <History onHistoryClick={onHistoryClick} />
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
            <StepSize
                onEffect={onStepSizeChange}
                defaultStep={defaultStep}
                defaultSelected={defaultSelected}
            />
        </div>
    );
}
