import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";

export interface SidebarProps {
    buttons: ButtonProps[];
}

function Sidebar({ buttons }: SidebarProps) {
    return (
        <div className="sidebar rounder-container">
            {buttons.map((props: ButtonProps) => (
                <Button {...props} />
            ))}
        </div>
    );
}

export default Sidebar;
