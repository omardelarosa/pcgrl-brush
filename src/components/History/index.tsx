import React from "react";
import "./styles.css";
import IconUndo from "../../assets/icons/102-undo.svg";
import IconRedo from "../../assets/icons/103-redo.svg";

export function History({
    onHistoryClick,
}: {
    onHistoryClick?: (n: number) => void;
}) {
    return (
        <div className="cell">
            <button
                className="historyButton cursorButton"
                onClick={() => onHistoryClick && onHistoryClick(-1)}
            >
                <img
                    src={IconUndo}
                    alt="cursor 1"
                    height="20 px"
                    className="svgIcon"
                />
            </button>
            <button
                className="historyButton cursorButton"
                onClick={() => onHistoryClick && onHistoryClick(1)}
            >
                <img
                    src={IconRedo}
                    alt="cursor 1"
                    height="20 px"
                    className="svgIcon"
                />
            </button>
        </div>
    );
}
