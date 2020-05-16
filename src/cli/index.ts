import * as yargs from "yargs";
import * as fs from "fs";
import { GameService, Games, SolverSokoban } from "../services/Game";

/**
 * NOTE:  This file should not be imported or loaded in any client-side code!
 */

interface CLIArgs extends yargs.Argv {
    [x: string]: unknown;
    _: string[];
    $0: string;
    mapJson: string;
}

export class CLI {
    constructor(args: CLIArgs) {
        if (args.mapJson) {
            this.solveMapFromJSON(args.mapJson);
        }
    }

    public solveMapFromJSON(mapJsonPath: string) {
        const jsonString: Buffer = fs.readFileSync(mapJsonPath);
        let map = JSON.parse(jsonString.toString());
        const solver = new SolverSokoban(5, 5);
        solver.runGame(map);
        console.log("solver:", solver);
    }
}

// Initialize
const argv = yargs.argv as CLIArgs;

new CLI(argv);
