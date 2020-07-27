import React from "react";
import { IconWrapper, IconNames } from "../Icons";
import "./styles.css";

const DEFAULT_BUTTON_TEXT = "Untitled Button";

export enum SidebarButtonNames {
    PENCIL_BUTTON = "PENCIL_BUTTON",
    EYE_DROPPER_BUTTON = "EYE_DROPPER_BUTTON",
    DROPLET_BUTTON = "DROPLET_BUTTON",
    PAINT_FORMAT_BUTTON = "PAINT_FORMAT_BUTTON",
    TRASH = "TRASH",
    ERASE = "ERASE",
    PLAY = "PLAY",
    SAVE = "SAVE",
    FEEDBACK = "FEEDBACK",
}

export interface ButtonProps {
    onClick?: (e: React.MouseEvent, p: ButtonProps) => void;
    iconName?: IconNames;
    selected?: boolean;
    buttonName?: SidebarButtonNames;
    buttonText?: string;
    buttonValue?: string;
    className?: string;
    href?: string;
}

export function Button(props: ButtonProps) {
    const {
        onClick,
        iconName,
        selected = false,
        buttonText = DEFAULT_BUTTON_TEXT,
    } = props;
    if (props.href) {
        return (
            <a href={props.href} target="_blank" rel="noopener noreferrer">
                <button
                    className={`button${
                        props.className ? " " + props.className : ""
                    }`}
                >
                    {iconName ? (
                        <IconWrapper iconName={iconName} />
                    ) : (
                        <span className="button__text">{buttonText} </span>
                    )}
                </button>
            </a>
        );
    }
    return (
        <button
            onClick={(ev) => (onClick ? onClick(ev, props) : null)}
            className={`button${selected ? " selected" : ""}${
                props.className ? " " + props.className : ""
            }`}
        >
            {iconName ? (
                <IconWrapper iconName={iconName} />
            ) : (
                <span className="button__text">{buttonText} </span>
            )}
        </button>
    );
}
