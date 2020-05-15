import * as React from "react";
import "./styles.css";
import { GameService, GameAction } from "../../services/Game";
import { ACTIONS_TO_SYMBOLS } from "../../constants";

export function ActionSymbol({ gameAction }: { gameAction: GameAction }) {
    return (
        <span className="game-action-symbol">
            {ACTIONS_TO_SYMBOLS[gameAction.action]}
        </span>
    );
}

export function GameActionViewer({
    gameService,
}: {
    gameService: GameService;
}) {
    return (
        <div className="game-actions">
            {gameService.actions.map((gameAction) => (
                <ActionSymbol gameAction={gameAction} />
            ))}
        </div>
    );
}
