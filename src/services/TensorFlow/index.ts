// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";
// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations

let model: tf.GraphModel | null | undefined = null;
const MODEL_HTTP_URL = '/models-tfjs/sokoban/narrow/model_1/model.json';
async function fetchModel() {
    try {
        console.log('url: ', window.location.href.split('src')[0] + MODEL_HTTP_URL)
        let model = await tf.loadGraphModel(window.location.href.split('src')[0] + MODEL_HTTP_URL);
        console.log(model);
        predictAndDraw(model);
        return model;
    } catch (error) {
        console.error(error);
    }
}

async function predictAndDraw(model: tf.GraphModel) {
    //let state = getState()
    let state =[[
    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,0,0,0,1],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,0,1,0,0],
    [0,0,0,1,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,0,0,1,0],
    [1,0,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],

    [[0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]],
    ]]
    // prepare state input
    let a = tf.tensor4d(state, [1, 10, 10, 5], "float32");
    // calls predict on the model
    let preResp = model.predict(a);
    console.log(preResp);
    // let actionIndex = preResp[0].indexOf(Math.max(...preResp[0]))
    /*
    let indexes = preResp[0].map((val: any, ind: any) => {return {ind, val}})
           .sort((a: { val: number; }, b: { val: number; }) => {return a.val > b.val ? 1 : a.val == b.val ? 0 : -1 })
           .map((obj: { ind: any; }) => obj.ind);
    let actionIndex = indexes[indexes.length-1];
    console.log(actionIndex);*/
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
