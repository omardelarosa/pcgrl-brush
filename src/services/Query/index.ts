import { Checkpoint } from "../../constants";

function ubtoa(str: string): string {
    try {
        return btoa(str);
    } catch (err) {
        return Buffer.from(str).toString("base64");
    }
}

function uatob(b64Encoded: string): string {
    try {
        return atob(b64Encoded);
    } catch (err) {
        return Buffer.from(b64Encoded, "base64").toString();
    }
}

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
        const h = ubtoa(JSON.stringify(c));
        return h;
    }

    public static decode(s: string): Checkpoint | null {
        try {
            const jsonString = uatob(s);
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
