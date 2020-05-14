import React from "react";
import "./styles.css";

interface LayoutComponent {
    logo?: JSX.Element;
    toolbar?: JSX.Element;
    sidebar?: JSX.Element;
    stages?: JSX.Element[];
    tileset?: JSX.Element;
    footer?: JSX.Element[];
    header?: JSX.Element[];
    center?: JSX.Element[];
}

export function Layout({
    header = [],
    footer = [],
    center = [],
}: LayoutComponent) {
    return (
        <div className="layout-container">
            <div className="heading-container">{header}</div>
            <div className="central-container">{center}</div>
            <div className="footer-container">{footer}</div>
        </div>
    );
}
