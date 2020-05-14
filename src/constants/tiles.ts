export enum TILES {
    EMPTY = 0,
    SOLID = 1,
    PLAYER = 2,
    CRATE = 3,
    TARGET = 4,
}

export const CENTER_TILE_POS = [2, 2];

// This is for building sokoban level text files.
export const TILES_TO_CHAR: Record<TILES, string> = {
    [TILES.EMPTY]: " ",
    [TILES.SOLID]: "#",
    [TILES.PLAYER]: "@",
    [TILES.CRATE]: "$",
    [TILES.TARGET]: ".",
};

export const CHAR_TO_TILE: Record<string, TILES> = {
    " ": TILES.EMPTY,
    "#": TILES.SOLID,
    "@": TILES.PLAYER,
    $: TILES.CRATE,
    ".": TILES.TARGET,
};
