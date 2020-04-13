import * as nj from "@aas395/numjs";

export class Numeric {
    public static createMatrix(
        numRows: number,
        numCols: number,
        defaultValue = 0
    ): number[][] {
        const m = nj.zeros([numRows, numCols]);
        return m.tolist();
    }

    public static cloneMatrix(matrix: Array<Array<number>>) {
        const m = nj.array(matrix);
        return m.tolist();
    }
}
