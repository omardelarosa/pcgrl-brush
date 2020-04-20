// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";
import { Tensor, Tensor2D } from "@tensorflow/tfjs";
import { TILES } from "../../constants/tiles";

// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations

type TSModelType = tf.GraphModel | tf.LayersModel | null;

// d['narrow'][1] -> narrow/model_1

export interface ModelsDictionary {
    narrow?: TSModelType;
    turtle?: TSModelType;
    wide?: TSModelType;
}

export interface IGrid {
    grid: number[][];
    t: Tensor2D;
}

export type RepresentationName = "narrow" | "turtle" | "wide";

export const REPRESENTATION_NAMES: RepresentationName[] = [
    "narrow",
    "turtle",
    "wide",
];

export const REPRESENTATION_NAMES_DICT: Record<RepresentationName, boolean> = {
    narrow: true,
    turtle: true,
    wide: true,
};

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

    public static createGameGrid(size: [number, number]): IGrid {
        const t = tf.fill(size, TILES.SOLID, "int32") as Tensor2D;
        return {
            grid: t.arraySync() as number[][],
            t,
        };
    }

    public static cloneGrid(grid: number[][]): IGrid {
        const t = tf.tensor2d(grid);
        return {
            grid: t.arraySync() as number[][],
            t,
        };
    }

    public createGrameGrid(size: [number, number]): IGrid {
        return TensorFlowService.createGameGrid(size);
    }

    public stringToRepresentationName(
        textName: string
    ): RepresentationName | null {
        switch (textName) {
            case "narrow":
                return REPRESENTATION_NAMES[0];
            case "turtle":
                return REPRESENTATION_NAMES[1];
            case "wide":
                return REPRESENTATION_NAMES[2];
            default:
                return null;
        }
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

    public async transformStateToTensor(
        gridState: number[][],
        gridSize: [number, number],
        representationName: RepresentationName,
        offset = [0, 0]
    ): Promise<Tensor | null> {
        return TensorFlowService.transformStateToTensor(
            gridState,
            gridSize,
            representationName,
            offset
        );
    }

    public static oneHotEncode2DState(t: Tensor, encodingDim = 5): Tensor {
        const tArr = t.arraySync() as number[][]; // TODO: not sync?
        const stateExpanded: Tensor = tf.stack(
            tArr.map((row) => {
                // OneHot encode each row
                return tf.oneHot(tf.tensor1d(row, "int32"), encodingDim);
            })
        );

        return tf.cast(stateExpanded.expandDims(), "int32");
    }

    /**
     * Transforms the state into a 3D Tensor and one-hot encodes each cell.
     *
     * Produces a [1, rows, cols, tiles] 4D tensor.
     *
     * @param gridState
     * @param gridSize
     */
    public static async transformStateToTensor(
        gridState: number[][],
        gridSize: [number, number],
        representationName: RepresentationName,
        offset = [0, 0]
    ): Promise<Tensor | null> {
        // Narrow/turtle
        if (representationName !== "wide") {
            const tState = tf.tensor2d(gridState);
            const [h, w] = tState.shape;
            const [j, i] = offset;
            // Pad with 1s, generate all positions
            return tState.pad(
                [
                    [w - j, j],
                    [h - i, i],
                ],
                TILES.SOLID
            );
            // Wide representation
        } else {
            return tf.tensor2d(gridState);
        }
    }

    public async predictAndDraw(
        gridState: number[][],
        gridSize: [number, number],
        repName: RepresentationName
    ): Promise<number[][]> {
        let model: TSModelType | undefined | null;
        if (!model) {
            console.log("Model unavailable! Fetching...");
            let models: ModelsDictionary | null = await this.onInit();
            if (models) {
                model = models[repName]; // model by default for now
            }
        }

        const results = [];

        // 1. Create 2D tensor from raw state
        const stateAs2DTensor = await TensorFlowService.transformStateToTensor(
            gridState,
            gridSize,
            repName
        );

        // 2. Process tensor
        if (stateAs2DTensor) {
            // 3. Create a OneHotEncoded Grid
            const stateOneHotEncoded = await TensorFlowService.oneHotEncode2DState(
                stateAs2DTensor
            );
            if (model) {
                const state = stateOneHotEncoded;
                console.log("Input: ");
                stateAs2DTensor.print();
                // 4. Send state through TF model for given representation
                try {
                    let preResp: any = model.predict(state.cast("float32"));
                    // 5. Flatten oneHotEncoded array, use argMax to convert to int
                    const intResult = tf
                        .cast(preResp, "int32")
                        .flatten()
                        .argMax();
                    const arr = await intResult.array();
                    console.log("Output: ", arr);

                    // TODO: for narrow/turtle, a chain of changes needs to be made here.

                    // TODO: apply changes and return new state.
                    results.push(arr);
                } catch (err) {
                    console.warn("Unable to parse state");
                    console.error(err);
                }
            }
            // 2a. warning message
        } else {
            console.warn("Unable to initialize TensorFlow model.");
        }

        // NOTE: For now, this just echos the input
        return results;
    }
}
