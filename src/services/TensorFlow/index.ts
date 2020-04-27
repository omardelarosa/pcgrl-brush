// Loading tensorflow ideally only at the app level
import * as tf from "@tensorflow/tfjs";
import { Tensor, Tensor2D, Rank } from "@tensorflow/tfjs";
import { TILES } from "../../constants/tiles";
import { isEmpty } from "../Utils/index";

// Testing basic functionality of tensorflow using code from:
// https://www.tensorflow.org/js/guide/tensors_operations

type TSModelType = tf.GraphModel | tf.LayersModel | null;

// d['narrow'][1] -> narrow/model_1

export interface ModelsDictionary {
    narrow?: TSModelType;
    turtle?: TSModelType;
    wide?: TSModelType;
}

export interface IParsedModelOutput {
    direction?: number;
    pos?: [number, number];
    tile?: number;
}

export interface IGrid {
    grid: number[][];
    t: Tensor2D;
}

export type RepresentationName = "narrow" | "turtle" | "wide";

export interface ISuggestion {
    pos: [number, number];
    tile: number;
}
export interface IPredictionResult {
    suggestedGrid: number[][];
    suggestions: ISuggestion[] | null;
}

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
        const t = tf.fill(size, TILES.EMPTY, "int32") as Tensor2D;
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

    async fetchModels(): Promise<ModelsDictionary> {
        const fetchedModels: ModelsDictionary = {};
        for (let key in MODEL_URLS) {
            let model: TSModelType | null | undefined = this.models[
                key as RepresentationName
            ];
            if (!model) {
                const url =
                    window.location.href.split("src")[0] +
                    MODEL_URLS[key as RepresentationName];
                console.log("url: ", key, url);
                model = await tf.loadGraphModel(url);
                console.log("Loaded model: ", model);
            }
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

    public static oneHotEncode2DState(
        t: Tensor,
        encodingDim = 5
    ): Tensor | null {
        if (!t) {
            return null;
        }

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
        // 0. Unsupported size
        let shouldSlice = false;
        if (gridSize[0] > 5 || gridSize[1] > 5) {
            shouldSlice = true;
        }

        let tState = tf.tensor2d(gridState);
        if (shouldSlice) {
            // Slice into a supported grid size.
            // TODO: use offset to find slice.
            tState = tState.slice([0, 0], [5, 5]);
        }
        // Narrow/turtle
        if (representationName !== "wide") {
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
            return tState;
        }
    }

    public parseModelOutput(
        output: number, // AKA actionIndex
        repName: RepresentationName
    ): IParsedModelOutput {
        const result: IParsedModelOutput = {};
        // 1. Narrow
        if (repName === "narrow") {
            if (output !== 0) {
                result.tile = output - 1;
            }
        }
        // 2. Turtle
        else if (repName === "turtle") {
            console.log(repName);
            if (output <= 3) {
                result.direction = output;
            } else {
                result.tile = output - 4;
            }
        }
        // 3. Wide
        else if (repName === "wide") {
            // Convert to base 5 back to tuple, quick way to do 5x5x5 3D tensor indexing
            const tuple: number[] = Number(output)
                .toString(5)
                .split("")
                .map(Number);
            if (tuple.length > 2) {
                result.pos = [tuple[0], tuple[1]];
                result.tile = tuple[2];
            }
        }
        return result;
    }

    /**
     *
     * Returns an array of 8 neighbors N -> NW clockwise as flat array.  Out of bounds neighbors are replaced with nulls
     *
     * @param pos
     * @param gridSize
     *
     * @return neighbors - number[8]
     */
    public getNeighbors(
        pos: [number, number],
        gridSize: [number, number],
        userRadius = 2
    ): Array<[number, number] | null> {
        const radius = userRadius - 1;
        const neighbors: Array<[number, number] | null> = [];

        // 4-neighbors, radius 0, userRadius 1
        if (radius === 0) {
            const offsets = [
                [-1, 0],
                [0, 1],
                [1, 0],
                [0, -1],
            ];
            offsets.forEach((offset) => {
                const [i, j] = offset;
                const row = pos[0] + i;
                const col = pos[1] + j;
                if (
                    row >= 0 &&
                    row < gridSize[0] &&
                    col >= 0 &&
                    row < gridSize[1]
                ) {
                    neighbors.push([row, col]);
                } else {
                    neighbors.push(null);
                }
            });
            return neighbors;
        }

        // 8 or more
        for (let i = -1; i <= radius; i++) {
            for (let j = -1; j <= radius; j++) {
                const row = pos[0] + i;
                const col = pos[1] + j;
                if (
                    row >= 0 &&
                    row < gridSize[0] &&
                    col >= 0 &&
                    row < gridSize[1]
                ) {
                    neighbors.push([row, col]);
                } else {
                    neighbors.push(null);
                }
            }
        }

        return neighbors;
    }

    /**
     *
     * @param gridState - current 2D matrix of grid
     * @param gridSize - tuple of grid shape
     * @param repName - name of the current problem representation
     * @param clickedTileCoords - the last clicked grid coords
     * @param radius - the radius for narrow/turtle
     */
    public async predictAndDraw(
        gridState: number[][],
        gridSize: [number, number],
        repName: RepresentationName,
        clickedTileCoords?: [number, number],
        radius?: number
    ): Promise<IPredictionResult> {
        // Log the clicked tile coordinates
        if (clickedTileCoords) {
            console.log("clicked tile:", clickedTileCoords);
        }

        console.log("radius", radius);

        let model: TSModelType | undefined | null = this.models[repName];
        if (!model) {
            console.log("Model unavailable! Fetching...");
            let models: ModelsDictionary | null = await this.onInit();
            if (models) {
                model = models[repName]; // model by default for now
            }
        }

        let suggestions: ISuggestion[] | null = null;

        // 0. Ignore grids that are too small.
        if (gridSize[0] < 5 || gridSize[1] < 5) {
            return {
                suggestedGrid: gridState,
                suggestions, // null
            } as IPredictionResult;
        }

        let t2Dstates = [];
        let neighborhood: Array<[number, number] | null> = [];
        if (repName !== "wide" && clickedTileCoords) {
            const centerTile = clickedTileCoords;
            // const centerTile: [number, number] = [2, 2];
            neighborhood = this.getNeighbors(centerTile, gridSize, radius);
            // Create Tensors for each position in neighborhood
            t2Dstates = await Promise.all(
                neighborhood.map((pos: [number, number] | null) => {
                    if (!pos) {
                        return Promise.resolve(null);
                    }
                    return TensorFlowService.transformStateToTensor(
                        gridState,
                        gridSize,
                        repName,
                        pos || [0, 0] // offset
                    );
                })
            );
            console.log("neighborhood", neighborhood);
        } else {
            if (repName !== "wide") {
                throw new Error(
                    "Non-wide agent selected without clickedTileCoords!"
                );
            }
            t2Dstates = [
                await TensorFlowService.transformStateToTensor(
                    gridState,
                    gridSize,
                    repName,
                    clickedTileCoords?.reverse() || [0, 0] // offset
                ),
            ];
        }

        // 1. Create 2D tensor from raw state

        // 1a. Unable to transform state to a tensor
        if (!t2Dstates.length) {
            return {
                suggestedGrid: gridState,
                suggestions, // null
            };
        }

        // 2. Process tensor
        if (t2Dstates.length) {
            console.log("Input: pos: ", clickedTileCoords, "");
            // Prints the center input
            t2Dstates[5]?.print();
            // t2Dstates.forEach((s) => s?.print());
            // 3. Create a OneHotEncoded Grid
            const statesOneHotEncoded: Array<Tensor | null> = await Promise.all(
                t2Dstates.map((s) => TensorFlowService.oneHotEncode2DState(s!))
            );
            if (model) {
                const parsedOutputs = await Promise.all(
                    statesOneHotEncoded.map(
                        async (
                            state: Tensor | null
                        ): Promise<IParsedModelOutput | null> => {
                            if (!state) {
                                return null;
                            }
                            // 4. Send state through TF model for given representation
                            try {
                                let preResp: any = model!.predict(
                                    state.cast("float32")
                                );
                                // 5. Flatten oneHotEncoded array, use argMax to convert to int
                                const intResult = tf
                                    .cast(preResp, "int32")
                                    .flatten()
                                    .argMax();
                                const arr = await intResult.array();
                                // console.log("Output: ", arr);
                                const parsedOutput = this.parseModelOutput(
                                    arr,
                                    repName
                                );
                                return parsedOutput;
                                // TODO: for narrow/turtle, a chain of changes needs to be made here.
                            } catch (err) {
                                console.warn("Unable to parse state");
                                console.error(err);
                                return null;
                            }
                        }
                    )
                );
                // console.log("ParsedOutputs", parsedOutputs);

                // Convert parsedOutputs to suggestions.
                parsedOutputs.forEach(
                    (parsedOutput: IParsedModelOutput | null, idx: number) => {
                        if (isEmpty(parsedOutput)) {
                            return;
                        }

                        // Handle turtle
                        if (parsedOutput) {
                            const { tile, pos: suggestedPos } = parsedOutput;
                            const pos = suggestedPos || neighborhood[idx];
                            if (pos && tile) {
                                // Since this might be null, create it
                                if (!suggestions) {
                                    suggestions = [];
                                }
                                suggestions.push({ pos, tile } as ISuggestion);
                            }
                        }
                    }
                );

                // Returns an array of suggestions.
                return {
                    suggestedGrid: gridState,
                    suggestions,
                };
            } else {
                console.warn("No model available!");
                return {
                    suggestedGrid: gridState,
                    suggestions: null,
                };
            }
            // 2a. warning message
        } else {
            console.warn("Unable to initialize TensorFlow model.");
        }

        // NOTE: For now, this just echos the input
        return {
            suggestedGrid: gridState,
            suggestions,
        };
    }
}
