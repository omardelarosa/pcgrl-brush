// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";

// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations
export class TensorFlowService {
    public static tensorFlowHelloWorld() {
        // Initiailize a demo tensor
        const a = tf.tensor([
            [1, 2],
            [3, 4],
        ]);
        console.log("a shape:", a.shape);
        a.print();
    }

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
