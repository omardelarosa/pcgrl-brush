import { Checkpoint } from "../AppState";

export class QueryService {
    public static initState(): Checkpoint | null {
        const hashedCheckpoint = window.location.hash.slice(1);
        const checkpoint = QueryService.decode(hashedCheckpoint);

        if (checkpoint) {
            console.log("loading previous checkpoint state: ", checkpoint);
        } else {
            console.warn("unable to reload hashed state: ", hashedCheckpoint);
        }

        window.location.hash = ""; // hash rewrite?
        return checkpoint;
    }

    public static encode(c: Checkpoint): string {
        const h = btoa(JSON.stringify(c));
        return h;
    }

    public static decode(s: string): Checkpoint | null {
        try {
            const jsonString = atob(s);
            const c = JSON.parse(jsonString) as Checkpoint;
            return c;
        } catch (e) {
            console.warn("Invalid checkpoint hash: ", s);
            return null;
        }
    }

    public static getShareURL(c: Checkpoint): string {
        const h = QueryService.encode(c);
        const url = `${window.location.protocol}//${window.location.host}/#${h}`;
        return url;
    }
}
