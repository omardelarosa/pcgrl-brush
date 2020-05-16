import { ISuggestion, RepresentationName } from "../services/TensorFlow";

export type SuggestedGrids = Partial<
    Record<RepresentationName, number[][] | null>
>;
export type SuggestionsByType = Partial<
    Record<RepresentationName, ISuggestion[] | null>
>;

export interface IModelResult {
    grid: number[][] | null;
    repName: any;
    pendingSuggestions: ISuggestion[];
}

export const NUMBER_OF_SUGGESTIONS_IN_WIDE = 25;

export const GHOST_LAYER_DEBOUNCE_AMOUNT_MS = 500;

export const SUPPORTED_TILESETS = ["dungeon", "classic"];

export const DEFAULT_STAGE_GRID_SIZE: [number, number] = [5, 5];
export const DEFAULT_PLAYER_POS: [number, number] = [2, 2];
export const DEFAULT_TOOL_RADIUS = 2;
export const DEFAULT_NUM_STEPS = 1;

export const BOARD_SIZE_PX = 512;

export const MODEL_SUGGESTION_TIMEOUT_MS = 10000;

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
    WIN,
}

export const KEY_MAPPINGS = {
    descriptions_by_action_name: {
        [ACTIONS.MOVE_UP]: "Move player upwards.",
        [ACTIONS.MOVE_DOWN]: "Move player downwards.",
        [ACTIONS.MOVE_LEFT]: "Move player left.",
        [ACTIONS.MOVE_RIGHT]: "Move player right.",
        [ACTIONS.RETRY]: "Reset level and try again.",
        [ACTIONS.WIN]: "Move all the crates to the blinking targets.",
    },
    codes_to_actions: {
        KeyA: ACTIONS.MOVE_LEFT,
        KeyW: ACTIONS.MOVE_UP,
        KeyS: ACTIONS.MOVE_DOWN,
        KeyD: ACTIONS.MOVE_RIGHT,
        KeyR: ACTIONS.RETRY,
        None: ACTIONS.WIN,
    },
    actions_to_codes: {
        [ACTIONS.MOVE_LEFT]: "A",
        [ACTIONS.MOVE_UP]: "W",
        [ACTIONS.MOVE_DOWN]: "S",
        [ACTIONS.MOVE_RIGHT]: "D",
        [ACTIONS.RETRY]: "R",
        [ACTIONS.WIN]: "🏆",
    },
};

export const ACTIONS_TO_SYMBOLS = {
    [ACTIONS.MOVE_UP]: "⬆️",
    [ACTIONS.MOVE_DOWN]: "⬇️",
    [ACTIONS.MOVE_LEFT]: "⬅️",
    [ACTIONS.MOVE_RIGHT]: "➡️",
    [ACTIONS.RETRY]: "⎌",
    [ACTIONS.WIN]: "🏆",
};

export type ValidKeysType = "KeyA" | "KeyW" | "KeyS" | "KeyD" | "KeyR" | "None";
