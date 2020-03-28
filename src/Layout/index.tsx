import React from "react";
import "./styles.css";
import Sidebar from "../Sidebar";
import Toolbar from "../Toolbar";
import Stage from "../Stage";

interface LayoutComponent {
    logo?: JSX.Element;
    toolbar?: JSX.Element;
    sidebar?: JSX.Element;
    stage?: JSX.Element;
}

function Layout({ sidebar, toolbar, stage, logo }: LayoutComponent) {
    return (
        <div className="layout-container">
            <div className="heading-container">
                <div className="logo-container">{logo}</div>
                <div className="toolbar-container">{toolbar}</div>
            </div>
            <div className="central-container">
                <div className="sidebar-container">{sidebar}</div>
                <div className="stage-container">{stage}</div>
            </div>
        </div>
    );
}

export default Layout;
