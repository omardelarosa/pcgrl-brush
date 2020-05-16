import "@tensorflow/tfjs-node"; // improves TF performance on node
import * as yargs from "yargs";
import * as fs from "fs";
import { GameService, Games, SolverSokoban } from "../services/Game";

/**
 * NOTE:  This file should not be imported or loaded in any client-side code!
 */

const options: Record<string, yargs.Options> = {
    genMap: {
        alias: "g",
        type: "boolean",
        description: "Run with verbose logging",
    },
    mapJson: {
        alias: "m",
        type: "string",
        description: "Run solver on a mapJson file.",
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
        const newMap = gs.generateRandomMap();
        console.log("new_map: ", newMap);
    }
}

new CLI(argv);
