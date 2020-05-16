import "@tensorflow/tfjs-node"; // improves TF performance on node
import * as yargs from "yargs";
import * as fs from "fs";
import * as path from "path";
import { GameService, Games, SolverSokoban } from "../services/Game";
import _ from "lodash";
import { GeneratedMapResults } from "../services/Game/index";

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
};

interface CLIArgs {
    // Default types from yargs library
    _: string[];
    $0: string;
    [x: string]: unknown;
    // Custom types
    mapJson: string;
    genMap: boolean;
    steps: number;
    radius: number;
    iterations: number;
    outputPath: string;
    name: string;
    timeout: number;
}

// Initialize yargs library, define commans
const argv = yargs.options(options).argv as CLIArgs;

export class CLI {
    constructor(args: CLIArgs) {
        if (args.mapJson) {
            this.solveMapFromJSON(args.mapJson);
        } else if (args.genMap) {
            this.generateJSONMap(args);
        }
    }

    public solveMapFromJSON(mapJsonPath: string) {
        const jsonString: Buffer = fs.readFileSync(mapJsonPath);
        let map = JSON.parse(jsonString.toString());
        const solver = new SolverSokoban(5, 5);
        solver.runGame(map);
        console.log("solver:", solver);
    }

    public generateJSONMap(args: CLIArgs) {
        console.log("Random Map!");
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
}

new CLI(argv);
