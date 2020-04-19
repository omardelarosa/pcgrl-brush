// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";
import { Numeric } from "../Numeric";
import { Tensor, Rank } from "@tensorflow/tfjs";

// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations

type TSModelType = tf.GraphModel | tf.LayersModel | null;

// d['narrow'][1] -> narrow/model_1

export interface ModelsDictionary {
    narrow?: TSModelType;
    turtle?: TSModelType;
    wide?: TSModelType;
}

export type RepresentationName = "narrow" | "turtle" | "wide";

export const REPRESENTATION_NAMES: RepresentationName[] = [
    "narrow",
    "turtle",
    "wide",
];

const MODEL_URLS: Record<RepresentationName, string> = {
    narrow: "/models-tfjs/sokoban/narrow/model_1/model.json",
    turtle: "/models-tfjs/sokoban/turtle/model_1/model.json",
    wide: "/models-tfjs/sokoban/wide/model_1/model.json",
};
export class TensorFlowService {
    private model: TSModelType = null;

    // TODO:
    private models: ModelsDictionary = {
        narrow: null,
        turtle: null,
        wide: null,
    };

    constructor() {
        // Does TF setup stuff
        this.onInit();
    }

    public async onInit(): Promise<ModelsDictionary | null> {
        // Model loading, setup goes here.

        // Fetch model on init
        return this.fetchModels()
            .then((fetchedModels: ModelsDictionary) => {
                this.models = fetchedModels;
                return fetchedModels;
            })
            .catch((err) => {
                console.error("Error Fetching Model from: ", MODEL_URLS);
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

    async fetchModels(): Promise<ModelsDictionary> {
        const fetchedModels: ModelsDictionary = {};
        for (let key in MODEL_URLS) {
            const url =
                window.location.href.split("src")[0] +
                MODEL_URLS[key as RepresentationName];
            console.log("url: ", key, url);
            let model = await tf.loadGraphModel(url);
            console.log("Loaded model: ", model);
            fetchedModels[key as RepresentationName] = model;
        }
        return fetchedModels;
    }

    public transformStateToTensor(
        gridState: number[][],
        gridSize: [number, number],
        representationName: RepresentationName
    ): Tensor {
        return TensorFlowService.transformStateToTensor(
            gridState,
            gridSize,
            representationName
        );
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
        gridSize: [number, number],
        representationName: RepresentationName
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

        stateExpanded = stateExpanded.expandDims();

        return tf.cast(stateExpanded, "float32");
    }

    public async predictAndDraw(
        stateAsTensor: Tensor,
        rawState: number[][]
    ): Promise<number[][]> {
        let model: TSModelType | undefined | null;
        if (!model) {
            console.log("Model unavailable! Fetching...");
            let models: ModelsDictionary | null = await this.onInit();
            if (models) {
                model = models["wide"]; // model by default for now
            }
        }
        // prepare state input
        // let a = tf.tensor4d(stateAsTensor, [1, 10, 10, 5], "float32");
        // calls predict on the model

        if (model) {
            console.log("Input: ");
            stateAsTensor.print();
            try {
                let preResp: any = model.predict(stateAsTensor);
                // console.log("Model Respose", preResp);
                // console.log("Model Respose", preResp.print());
                console.log("Output: ");
                // const intResult = tf.cast(preResp, "int32");
                const intResult = preResp;
                // intResult.print();
                const arr = await intResult.array();
                console.log(arr);
            } catch (err) {
                console.warn("Unable to parse state");
                console.error(err);
            }
        } else {
            console.warn("Unable to initialize TensorFlow model.");
        }

        // NOTE: For now, this just echos the input
        return rawState;
    }
}
