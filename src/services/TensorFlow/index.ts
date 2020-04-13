// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";
import { Numeric } from "../Numeric";
import { Tensor, Rank } from "@tensorflow/tfjs";

// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations

type TSModelType = tf.GraphModel | tf.LayersModel | null;

const MODEL_HTTP_URL = "/models-tfjs/sokoban/narrow/model_1/model.json";

export class TensorFlowService {
    private model: TSModelType = null;
    constructor() {
        // Does TF setup stuff
        this.onInit();
    }

    public async onInit(): Promise<TSModelType> {
        // Fetch model on init
        return this.fetchModel()
            .then((fetchedModel) => {
                // TODO: handle fetch error
                this.model = fetchedModel;
                return fetchedModel;
            })
            .catch((err) => {
                console.error("Error Fetching Model from: ", MODEL_HTTP_URL);
                console.error(err);
                return null;
            });
    }

    public static tensorFlowHelloWorld() {
        // // Initiailize a demo tensor
        // const a = tf.tensor([
        //     [1, 2],
        //     [3, 4],
        // ]);
        // console.log("a shape:", a.shape);
        // a.print();
        // // Test model
        // fetchModel().then(async (modelResp) => {
        //     model = modelResp;
        //     // game = setInterval(predictAndDraw, 50);
        // });
    }

    async fetchModel(): Promise<TSModelType> {
        const url = window.location.href.split("src")[0] + MODEL_HTTP_URL;
        console.log("url: ", url);
        let model = await tf.loadGraphModel(MODEL_HTTP_URL);
        console.log("Loaded model: ", model);
        return model;
    }

    public transformStateToTensor(
        gridState: number[][],
        gridSize: [number, number]
    ): Tensor {
        return TensorFlowService.transformStateToTensor(gridState, gridSize);
    }

    /**
     * Transforms the state into a 3D Tensor and one-hot encodes each cell.
     *
     * Produces a [1, rows, cols, tiles] 4D tensor.
     *
     * @param gridState
     * @param gridSize
     */
    public static transformStateToTensor(
        gridState: number[][],
        gridSize: [number, number]
    ): Tensor {
        const encodingDim = 5; // the dimension of the OneHot encoding
        const stateCopy: number[][] = Numeric.cloneMatrix(gridState);

        // Stack onehot encoded rows
        let stateExpanded: Tensor = tf.stack(
            stateCopy.map((row) => {
                // OneHot encode each row
                return tf.oneHot(tf.tensor1d(row, "int32"), encodingDim);
            })
        );

        // expand dimensions by 1:
        stateExpanded = stateExpanded.expandDims();

        console.log("State Expanded: ", stateExpanded);

        return tf.cast(stateExpanded, "float32");
    }

    public async predictAndDraw(stateAsTensor: Tensor) {
        let model = this.model;
        if (!model) {
            console.log("Model unavailable! Fetching...");
            model = await this.onInit();
        }
        // prepare state input
        // let a = tf.tensor4d(stateAsTensor, [1, 10, 10, 5], "float32");
        // calls predict on the model

        if (model) {
            let preResp: any = model.predict(stateAsTensor);
            console.log("Model Respose", preResp);
            console.log("Model Respose", preResp.print());
            // preResp.print();
        } else {
            console.warn("Unable to initialize TensorFlow model.");
        }

        // let actionIndex = preResp[0].indexOf(Math.max(...preResp[0]))
        /*
      let indexes = preResp[0].map((val: any, ind: any) => {return {ind, val}})
             .sort((a: { val: number; }, b: { val: number; }) => {return a.val >
      b.val ? 1 : a.val == b.val ? 0 : -1 }) .map((obj: { ind: any; }) => obj.ind);
      let actionIndex = indexes[indexes.length-1];
      console.log(actionIndex);*/
    }
}
