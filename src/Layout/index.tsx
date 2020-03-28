import React from "react";
import "./styles.css";

function Layout() {
    return (
        <div className="layout-container">
            <div className="toolbar-container">[TOOLBAR]</div>
            <div className="central-container">
                <div className="sidebar-container">[SIDEBAR]</div>
                <div className="stage-container">[STAGE]</div>
            </div>
        </div>
    );
}

export default Layout;
