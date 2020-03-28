import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";

export interface ToolbarProps {
    buttons: ButtonProps[];
}

export function Toolbar({ buttons }: ToolbarProps) {
    return (
        <div className="toolbar">
            {buttons.map((props: ButtonProps) => (
                <Button {...props} />
            ))}
        </div>
    );
}

export default Toolbar;
