import React from "react";
import "./styles.css";

interface LayoutComponent {
    footer?: Array<JSX.Element | null>;
    header?: Array<JSX.Element | null>;
    center?: Array<JSX.Element | null>;
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
