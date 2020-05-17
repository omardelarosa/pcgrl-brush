import "@tensorflow/tfjs-node"; // improves TF performance on node
import * as yargs from "yargs";
import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";
import { GameService, Games, SolverSokoban } from "../services/Game";
import _ from "lodash";
import { GeneratedMapResults } from "../services/Game/index";
import { TensorFlowService } from "../services/TensorFlow";
import { QueryService } from "../services/Query/index";
import { Checkpoint } from "../constants";

/**
 * NOTE:  This file should not be imported or loaded in any client-side code!
 */

const options: Record<string, yargs.Options> = {
    genMap: {
        alias: "g",
        type: "boolean",
        description:
            "Generate a map by choosing random agent suggestions after starting from an empty map.",
    },
    name: {
        alias: "n",
        type: "string",
        description: "A file name for a given output file.",
    },
    outputPath: {
        alias: "o",
        type: "string",
        description: "The output path for the generated result.",
    },
    solve: {
        alias: "solve",
        type: "boolean",
        description: "Solver of map or maps.",
    },
    view: {
        alias: "v",
        type: "boolean",
        description: "View a map from json data.",
    },
    mapJson: {
        alias: "m",
        type: "string",
        description: "Run solver on a mapJson file.",
    },
    iterations: {
        alias: "i",
        type: "number",
        description: "Number of iterations of the function to run.",
        default: 10,
    },
    steps: {
        alias: "s",
        type: "number",
        describe: "Number of steps the model will recurse on each iteration.",
        default: 1,
    },
    radius: {
        alias: "r",
        type: "number",
        describe: "ToolRadius to be used when generating maps.",
        default: 2,
    },
    timeout: {
        alias: "t",
        type: "number",
        describe:
            "The number of milliseconds to wait before timing out an operation.",
        default: 5000,
    },
    inputFiles: {
        alias: "f",
        type: "string",
        describe: "Input files (supports globbing).",
    },
};

interface CLIArgs {
    // Default types from yargs library
    _: string[];
    $0: string;
    [x: string]: unknown;
    // Custom types
    mapJson: string;
    view: boolean;
    solve: boolean;
    genMap: boolean;
    steps: number;
    radius: number;
    iterations: number;
    outputPath: string;
    name: string;
    timeout: number;
    inputFiles: string;
}

// Initialize yargs library, define commans
const argv = yargs.options(options).argv as CLIArgs;

export class CLI {
    constructor(args: CLIArgs) {
        if (args.solve) {
            this.solveMapFromJSON(args);
        } else if (args.genMap) {
            this.generateJSONMap(args);
        } else if (args.view) {
            this.viewMap(args);
        }
    }

    public solveMapFromJSON(args: CLIArgs) {
        const files = [];
        console.log("args", args);
        const mapJsonPath: string = args.mapJson;
        if (args.inputFiles) {
            const globbedFiles = glob.sync(args.inputFiles);
            globbedFiles.forEach((f) => files.push(f));
        }

        if (mapJsonPath) {
            files.push(mapJsonPath);
        }

        const results: Record<string, any> = {};

        const solver = new SolverSokoban(5, 5);

        files.forEach((f) => {
            console.log("solving: ", f);
            const jsonString: Buffer = fs.readFileSync(f);
            let mapResults = JSON.parse(jsonString.toString());
            let maps = [];
            // Case 1. results file, multiple maps
            if (/results\.json$/.test(f)) {
                maps = mapResults.grids;
                // Case 2. single map
            } else {
                maps = [mapResults];
            }
            results[f] = [];
            maps.forEach((map: number[][], i: number) => {
                let result = null;
                try {
                    result = solver.runGame(map);
                } catch (e) {
                    console.warn(`error encounted solving: ${f}${i}`);
                }
                if (result) {
                    results[f].push(result);
                } else {
                    results[f].push(null);
                }
            });
        });

        // Write file or log.
        if (args.outputPath) {
            let outFileName = args.name || "solutions";
            let outFilePath = args.outputPath;

            const resultsJson = JSON.stringify(results);

            // Write results to file
            fs.writeFileSync(
                path.join(outFilePath, `${outFileName}.solutions.json`),
                resultsJson
            );
        } else {
            console.log("results: ", results);
        }
    }

    public generateJSONMap(args: CLIArgs) {
        const gs = new GameService(Games.SOKOBAN);
        gs.generateRandomMap(
            args.iterations,
            args.steps,
            args.radius,
            args.timeout
        ).then((results: GeneratedMapResults) => {
            if (args.outputPath) {
                let outFileName = args.name || "untiled_map";
                let outFilePath = args.outputPath;

                const resultsJson = JSON.stringify(results);
                const lastMapJson = JSON.stringify(_.last(results.grids));

                // Write map to file
                fs.writeFileSync(
                    path.join(outFilePath, `${outFileName}.map.json`),
                    lastMapJson
                );

                // Write results to file
                fs.writeFileSync(
                    path.join(outFilePath, `${outFileName}.map.results.json`),
                    resultsJson
                );
            } else {
                console.log("results: ", results);
            }
        });
    }

    public viewMap(args: CLIArgs) {
        if (args.mapJson) {
            const f = args.mapJson;
            const jsonString: Buffer = fs.readFileSync(f);
            let map = JSON.parse(jsonString.toString());
            const size = [map.length, map[0].length];
            const checkpoint: Checkpoint = {
                gridText: TensorFlowService.gridToText(map),
                gridSize: size,
                radius: 1,
                steps: 1,
            };
            const h = QueryService.encode(checkpoint);
            console.log(`\n\nmap_url: http://localhost:3000/#${h}`);
        } else {
            console.warn("no map provided via --mapJson flag.");
        }
    }
}

new CLI(argv);
