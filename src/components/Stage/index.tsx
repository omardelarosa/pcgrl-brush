import React from "react";
import "./styles.css";
import { Grid } from "../Grid";

interface StageProps {
    matrix: number[][];
    onCellClick: (r: number, c: number, d: number) => void;
}

export function Stage({ matrix, onCellClick }: StageProps) {
    return (
        <div className="stage rounded-container">
            <Grid matrix={matrix} onCellClick={onCellClick} />
        </div>
    );
}
