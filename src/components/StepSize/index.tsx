import React, { useState } from "react";
import "./styles.css";

export function StepSize() {
    const [step, setStep] = useState(1);
    const updateSize = (event: any) => {
        setStep(event.target.value);
    }
    return (
        <div>
            Step Size
            <input type="range" min="1" max="25" className="slider" value={step} onInput={updateSize}></input>
            {step}
        </div>
    )
}