import React from "react";
import "./styles.css";

export function LoadingIndicator() {
    return (
        <div className="lds-facebook">
            <div></div>
            <div></div>
            <div></div>
        </div>
    );
}
