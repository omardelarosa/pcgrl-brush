import React from "react";
import "./styles.css";
import { ButtonProps, Button } from "../Button";

export interface SidebarProps {
    buttons: ButtonProps[];
}

export function Sidebar({ buttons }: SidebarProps) {
    return (
        <div className="sidebar rounder-container">
            {buttons.map((props: ButtonProps, idx: number) => (
                <Button key={`${props.iconName}-${idx}`} {...props} />
            ))}
        </div>
    );
}
