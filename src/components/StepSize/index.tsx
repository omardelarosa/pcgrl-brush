import React, { useState } from "react";
import "./styles.css";
import cursor1 from "../../assets/images/cursor1.png";
import cursor8 from "../../assets/images/cursor8.png";
import cursor25 from "../../assets/images/cursor25.png";

export function StepSize() {
    const [step, setStep] = useState(1);
    const [selected, setSelected] = useState(0);
    const updateSize = (event: any) => {
        setStep(event.target.value);
    }
    return (
        <div className="container">
            <div>
                Step Size
                <input type="range" min="1" max="25" className="slider" value={step} onInput={updateSize}></input>
                {step}
            </div>
            <div className="cell">
                <button className={`cursorButton${selected===0 ? " selected" : ""}`} onClick={() => setSelected(0)}>
                    <img src={cursor1} alt="cursor 1" height="15px" />
                </button>
                <button className={`cursorButton${selected===1 ? " selected" : ""}`} onClick={() => setSelected(1)}>
                    <img src={cursor8} alt="cursor 8" height="25px" />
                </button>
                <button className={`cursorButton${selected===2 ? " selected" : ""}`} onClick={() => setSelected(2)}>
                    <img src={cursor25} alt="cursor 25" height="30px" />
                </button>
            </div>
        </div>
    )
}