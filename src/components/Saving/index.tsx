import React from "react";
import "./styles.css";
import { QueryService } from "../../services/Query/index";
import { Checkpoint } from "../../constants";

export function Saving({
    checkpoints,
    checkpointIndex,
}: {
    checkpoints: Checkpoint[] | null;
    checkpointIndex: number;
}) {
    let checkpoint = null;
    let shareURL = null;
    if (
        checkpoints &&
        checkpointIndex >= 0 &&
        checkpointIndex < checkpoints.length
    ) {
        checkpoint = checkpoints[checkpointIndex];
        shareURL = QueryService.getShareURL(checkpoint);
    }
    console.log("checkpoint: ", checkpoint);
    return (
        <div className="saving-container">
            <div className="instructions">
                Copy paste these to share your creation:{" "}
            </div>
            <h3 className="heading">Share URL</h3>
            <textarea className="text-grid" readOnly>
                {shareURL}
            </textarea>
            <h3 className="heading">Text Format:</h3>
            <textarea className="text-grid" readOnly>
                {checkpoint?.gridText}
            </textarea>
            {/* <input className="text-grid" type="text" value={checkpoint?.gridText}></input> */}
        </div>
    );
}
