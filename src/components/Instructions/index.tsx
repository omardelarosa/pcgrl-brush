import * as React from "react";
import { KEY_MAPPINGS, ACTIONS } from "../../constants/index";
import "./styles.css";

export function Instructions() {
    return (
        <div className="instructions-container">
            <div className="instructions">
                {Object.keys(KEY_MAPPINGS.descriptions_by_action_name).map(
                    (action: unknown) => (
                        <div className="instructions-row">
                            <span className="instruction-key">
                                {
                                    KEY_MAPPINGS.actions_to_codes[
                                        action as ACTIONS
                                    ]
                                }
                            </span>
                            <span className="instruction-description">
                                {
                                    KEY_MAPPINGS.descriptions_by_action_name[
                                        action as ACTIONS
                                    ]
                                }
                            </span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
