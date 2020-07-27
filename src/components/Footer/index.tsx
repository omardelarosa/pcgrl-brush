import React from "react";
import "./styles.css";

export function Footer() {
    return (
        <div>
            <ul className="footer-links">
                <li>
                    <a href="https://github.com/omardelarosa/pcgrl-brush">
                        Github Source
                    </a>
                </li>
                <li>
                    <a href="https://forms.gle/tiBc86urqQamhsAEA">Feedback</a>
                </li>
                <li>
                    <a href="https://github.com/omardelarosa/pcgrl-brush/blob/master/Instructions.md">
                        Docs
                    </a>
                </li>
                {/* TODO: add more links... */}
            </ul>
            <div>{"©2020"}</div>
        </div>
    );
}
