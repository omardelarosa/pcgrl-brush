// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";
// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations

let model = null;
const MODEL_HTTP_URL = '/models-tfjs/sokoban/narrow/model_1/model.json';
async function fetchModel() {
    try {
        console.log('url: ', window.location.href.split('src')[0] + MODEL_HTTP_URL)
        let model = await tf.loadGraphModel(window.location.href.split('src')[0] + MODEL_HTTP_URL);
        console.log(model);
        return model;
    } catch (error) {
        console.error(error);
    }
}

export class TensorFlowService {
    public static tensorFlowHelloWorld() {
        // Initiailize a demo tensor
        const a = tf.tensor([
            [1, 2],
            [3, 4],
        ]);
        console.log("a shape:", a.shape);
        a.print();
        // Test model
        fetchModel().then(async modelResp => {
            model = modelResp;
            //predictAndDraw();
            //game = setInterval(predictAndDraw, 50);
        })
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
