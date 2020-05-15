import * as React from "react";
import "./styles.css";
import { GameService, GameAction } from "../../services/Game";
import { ACTIONS_TO_SYMBOLS, ACTIONS } from "../../constants";
import { useState, useEffect } from "react";

export function ActionSymbol({ gameAction }: { gameAction: GameAction }) {
    return (
        <span className="game-action-symbol">
            {ACTIONS_TO_SYMBOLS[gameAction.action]}
        </span>
    );
}

export function Score({
    gameActions,
    wins,
}: {
    gameActions: GameAction[];
    wins: number;
}) {
    return (
        <div className={"game-action-score"}>
            {wins ? <span className="heavy-text"> You won! {"🏆"}</span> : null}
            <span className="heavy-text">{gameActions.length} moves.</span>
        </div>
    );
}

export function GameActionViewer({
    gameService,
}: {
    gameService: GameService;
}) {
    const [collapsed, setCollapsed] = useState(true);
    useEffect(() => {
        console.log("effect!", collapsed);
    });
    const wins = gameService.actions.filter((a) => a.action === ACTIONS.WIN)
        .length;
    return (
        <div
            className={["game-actions", wins ? "did-win" : ""].join(" ")}
            onClick={() => setCollapsed(!collapsed)}
        >
            {collapsed ? (
                <Score gameActions={gameService.actions} wins={wins} />
            ) : (
                gameService.actions.map((gameAction) => (
                    <ActionSymbol gameAction={gameAction} />
                ))
            )}
        </div>
    );
}
