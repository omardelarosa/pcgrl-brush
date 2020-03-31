import React from "react";

// 1. Add an import declaration here for each icon you wish to componentize, then reference it below
import { ReactComponent as IconPencil } from "../../assets/icons/006-pencil.svg";
import { ReactComponent as IconEyedropper } from "../../assets/icons/011-eyedropper.svg";
import { ReactComponent as IconDroplet } from "../../assets/icons/012-droplet.svg";
import { ReactComponent as IconPaintFormat } from "../../assets/icons/013-paint-format.svg";
import { ReactComponent as IconBin } from "../../assets/icons/173-bin.svg";

const ICON_HEIGHT = 32;
const ICON_WIDTH = 32;

// 2. add a unique enum value
export enum IconNames {
    PENCIL = "pencil",
    EYE_DROPPER = "eye-dropper",
    DROPLET = "droplet",
    PAINT_FORMAT = "paint-format",
    BIN = "bin",
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
        case IconNames.BIN:
            return <IconBin {...iconProps} />;
        default:
            // This is basically an unsupported icon
            return <div>{`UNSUPPORTED ICON: ${props.iconName}`}</div>;
    }
}
