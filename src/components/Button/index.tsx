import React from "react";
import { IconWrapper, IconNames } from "../Icons";
import "./styles.css";

export enum SidebarButtonNames {
    PENCIL_BUTTON = "PENCIL_BUTTON",
    EYE_DROPPER_BUTTON = "EYE_DROPPER_BUTTON",
    DROPLET_BUTTON = "DROPLET_BUTTON",
    PAINT_FORMAT_BUTTON = "PAINT_FORMAT_BUTTON",
}

export interface ButtonProps {
    onClick?: (e: React.MouseEvent, p: ButtonProps) => void;
    iconName: IconNames;
    selected?: boolean;
    buttonName?: SidebarButtonNames;
    className?: string;
}

export function Button(props: ButtonProps) {
    const { onClick, iconName, selected = false } = props;
    return (
        <button
            onClick={ev => (onClick ? onClick(ev, props) : null)}
            className={`button${selected ? " selected" : ""}${
                props.className ? " " + props.className : ""
            }`}
        >
            <IconWrapper iconName={iconName} />
        </button>
    );
}
