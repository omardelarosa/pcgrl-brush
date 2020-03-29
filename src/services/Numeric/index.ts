export class Numeric {
    public static createMatrix(
        numRows: number,
        numCols: number,
        defaultValue = 0
    ) {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            const row = [];
            for (let j = 0; j < numCols; j++) {
                row.push(defaultValue);
            }
            rows.push(row);
        }
        return rows;
    }
}
