import React from "react";
import "./styles.css";
import IconUndo from "../../assets/icons/102-undo.svg";
import IconRedo from "../../assets/icons/103-redo.svg";

export function History() {
    return (
        <div>
            <button className="historyButton">
                <img src={IconUndo} alt="cursor 1" height="20 px" className="svgIcon" />
            </button>
            <button className="historyButton">
                <img src={IconRedo} alt="cursor 1" height="20 px" className="svgIcon" />
            </button>
        </div>
    );
}