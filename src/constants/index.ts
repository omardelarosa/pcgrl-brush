import { SuggestedGrids } from "../services/AppState";

export const NUMBER_OF_SUGGESTIONS_IN_WIDE = 25;

export const GHOST_LAYER_DEBOUNCE_AMOUNT_MS = 500;

export const SUPPORTED_TILESETS = ["dungeon", "classic"];

export const BOARD_SIZE_PX = 512;

export const EMPTY_SUGGESTED_GRIDS: SuggestedGrids = {
    turtle: null,
    wide: null,
    narrow: null,
    majority: null,
};
