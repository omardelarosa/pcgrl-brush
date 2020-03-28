import React from "react";

// 1. Add an import declaration here for each icon you wish to componentize, then reference it below
import { ReactComponent as IconPencil } from "./006-pencil.svg";
import { ReactComponent as IconEyedropper } from "./011-eyedropper.svg";
import { ReactComponent as IconDroplet } from "./012-droplet.svg";
import { ReactComponent as IconPaintFormat } from "./013-paint-format.svg";

const ICON_HEIGHT = 32;
const ICON_WIDTH = 32;

// 2. add a unique enum value
export enum IconNames {
    PENCIL = "pencil",
    EYE_DROPPER = "eye-dropper",
    DROPLET = "droplet",
    PAINT_FORMAT = "paint-format",
}

interface IconProps {
    height?: number;
    width?: number;
    iconName: IconNames;
}

export function IconWrapper(props: IconProps) {
    const iconProps = {
        height: ICON_HEIGHT,
        width: ICON_WIDTH,
        ...props,
    };
    switch (props.iconName) {
        // 3. Add a case statement for each supported icon
        case IconNames.PENCIL:
            return <IconPencil {...iconProps} />;
        case IconNames.EYE_DROPPER:
            return <IconEyedropper {...iconProps} />;
        case IconNames.DROPLET:
            return <IconDroplet {...iconProps} />;
        case IconNames.PAINT_FORMAT:
            return <IconPaintFormat {...iconProps} />;
        default:
            // This is basically an unsupported icon
            return <div>{`UNSUPPORTED ICON: ${props.iconName}`}</div>;
    }
}
