import _ from "lodash";
import { TILES } from "../../constants/tiles";

export interface IDiffTile {
    a: TILES;
    b: TILES;
    pos: [number, number];
}

export function isEmpty(o: any) {
    if (!o) {
        return true;
    }

    if (o.length && o.length === 0) {
        return true;
    }

    if (Object.keys(o).length === 0) {
        return true;
    }
}

export function argSort(arr: number[], reverse?: boolean): number[] {
    const objs = arr.map((val: number, idx: number) => ({ key: idx, val }));
    if (reverse) {
        return _.sortBy(objs, ["val"])
            .map(({ key }) => Number(key))
            .reverse();
    } else {
        return _.sortBy(objs, ["val"]).map(({ key }) => Number(key));
    }
}

export function diffGrids(
    a: number[][],
    b: number[][],
    size: [number, number]
): IDiffTile[] {
    const diffs: IDiffTile[] = [];
    for (let i = 0; i < size[0]; i++) {
        for (let j = 0; j < size[1]; j++) {
            if (a[i][j] !== b[i][j]) {
                const diff: IDiffTile = {
                    pos: [i, j],
                    a: a[i][j],
                    b: b[i][j],
                };
                diffs.push(diff);
            }
        }
    }
    return diffs;
}
