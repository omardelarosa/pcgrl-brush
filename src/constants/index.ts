import { SuggestedGrids } from "../services/AppState";

export const NUMBER_OF_SUGGESTIONS_IN_WIDE = 25;

export const GHOST_LAYER_DEBOUNCE_AMOUNT_MS = 500;

export const SUPPORTED_TILESETS = ["dungeon", "classic"];

export const BOARD_SIZE_PX = 512;

// Number of steps supported by undo/redo.
export const MAX_GRID_HISTORY_LENGTH = 20;

export const EMPTY_SUGGESTED_GRIDS: SuggestedGrids = {
    turtle: null,
    wide: null,
    narrow: null,
    majority: null,
};

export enum ACTIONS {
    MOVE_UP,
    MOVE_DOWN,
    MOVE_LEFT,
    MOVE_RIGHT,
    RETRY,
}

export const KEY_MAPPINGS = {
    descriptions_by_action_name: {
        [ACTIONS.MOVE_UP]: "Move player upwards.",
        [ACTIONS.MOVE_DOWN]: "Move player downwards.",
        [ACTIONS.MOVE_LEFT]: "Move player left.",
        [ACTIONS.MOVE_RIGHT]: "Move player right.",
        [ACTIONS.RETRY]: "Reset level and try again.",
    },
    codes_to_actions: {
        KeyA: ACTIONS.MOVE_LEFT,
        KeyW: ACTIONS.MOVE_UP,
        KeyS: ACTIONS.MOVE_DOWN,
        KeyD: ACTIONS.MOVE_RIGHT,
        KeyR: ACTIONS.RETRY,
    },
};

export const ACTIONS_TO_SYMBOLS = {
    [ACTIONS.MOVE_UP]: "⬆️",
    [ACTIONS.MOVE_DOWN]: "⬇️",
    [ACTIONS.MOVE_LEFT]: "⬅️",
    [ACTIONS.MOVE_RIGHT]: "➡️",
    [ACTIONS.RETRY]: "⎌",
};

export type ValidKeysType = "KeyA" | "KeyW" | "KeyS" | "KeyD" | "KeyR";
