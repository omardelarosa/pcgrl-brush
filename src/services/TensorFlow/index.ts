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
}
