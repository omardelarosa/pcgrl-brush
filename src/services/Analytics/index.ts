import { ACTIONS, SUPPORTED_TILESETS } from "../../constants";
import { SidebarButtonNames } from "../../components/Button";
import { TILES } from "../../constants/tiles";
import { RepresentationName } from "../TensorFlow";

interface GoogleAnalytics {
    (
        command: string,
        hitType: string,
        category?: string,
        action?: string,
        label?: string,
        value?: number
    ): void;
}

export interface EventParams {
    category?: string;
    action?: string;
    label?: string;
    value?: number;
}

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCwP_UINSPpxaO9XBFdcmjuZ_uqY1m5j64",
    authDomain: "rlbrush-app.firebaseapp.com",
    databaseURL: "https://rlbrush-app.firebaseio.com",
    projectId: "rlbrush-app",
    storageBucket: "rlbrush-app.appspot.com",
    messagingSenderId: "86638473548",
    appId: "1:86638473548:web:7f084cb74887c4b29b1fe9",
    measurementId: "G-0KXQX3SNJR",
};

const GA_EVENT_CATEGORIES = {
    GAME: "GAME",
    EDITOR: "EDITOR",
    SHARE: "SHARE",
    BOARD: "BOARD",
};

const ACTION_MOVE = "MOVE";
const ACTION_GAME_STATUS = "GAME_STATUS";
const ACTION_BUTTON_PRESS = "BUTTON_PRESS";
const ACTION_TEXT_SELECT = "TEXT_SELECT";
const ACTION_ACCEPT_GHOST_SUGGESTION = "ACCEPT_GHOST_SUGGESTION";
const ACTION_CHECKPOINT = "CHECKPOINT";

const GA_EVENT_LABELS = {
    [ACTION_MOVE]: {
        UP: "UP",
        LEFT: "LEFT",
        RIGHT: "RIGHT",
        DOWN: "DOWN",
    },
    [ACTION_GAME_STATUS]: {
        RETRY: "RETRY",
        WIN: "WIN",
    },
    [ACTION_BUTTON_PRESS]: {
        UNDO: "UNDO",
        REDO: "REDO",
        STEP_SIZE: "STEP_SIZE",
        BRUSH_SIZE: "BRUSH_SIZE",
        PENCIL: "PENCIL",
        ERASER: "ERASER",
        TRASH: "TRASH",
        PLAY: "PLAY",
        SHARE: "SHARE",
        SUGGESTION_ACCEPT: "SUGGESTION_ACCEPT",
        TILESET_CHANGE: "TILESET_CHANGE",
        TILE_CHANGE: "TILE_CHANGE",
        GRID_TILE_CLICK: "GRID_TILE_CLICK",
    },
    [ACTION_TEXT_SELECT]: {
        SHARE_URL: "SHARE_URL",
        LEVEL_AS_TEXT: "LEVEL_AS_TEXT",
    },
    [ACTION_ACCEPT_GHOST_SUGGESTION]: {
        turtle: "turtle",
        wide: "wide",
        narrow: "narrow",
        majority: "majority",
    },
    [ACTION_CHECKPOINT]: {
        CREATED: "CREATED",
    },
};

export class AnalyticsService {
    private ga?: GoogleAnalytics;
    private firebase?: any;
    private USE_FIREBASE = true;
    private USE_GA = true;
    public debug_mode = false;
    constructor() {
        this.getGoogleAnalyticsWrapper();
    }

    private getFirebase() {
        if (this.firebase) {
            return this.firebase;
        } else {
            // Initialize Firebase
            this.firebase = (window as any).firebase;
            this.firebase.initializeApp(firebaseConfig);
            this.firebase.analytics();
            return this.firebase;
        }
    }
    private getGoogleAnalyticsWrapper(): GoogleAnalytics | undefined {
        if (this.ga) {
            return this.ga;
        } else {
            if ((window as any).ga) {
                this.ga = (window as any).ga as GoogleAnalytics;
            }
            return this.ga;
        }
    }

    public sendEvent(params: EventParams): void {
        if (this.debug_mode) {
            console.log("sending_analytics_event: ", params);
        }
        const _ga = this.getGoogleAnalyticsWrapper();
        const _fb = this.getFirebase();
        if (this.USE_GA) {
            if (_ga) {
                _ga(
                    "send",
                    "event",
                    params.category,
                    params.action,
                    params.label,
                    params.value
                );
            } else {
                console.warn("failed_to_send_ga_event: ", params);
            }
        }

        if (this.USE_FIREBASE) {
            if (_fb) {
                _fb.analytics().logEvent(
                    `${params.category}:${params.action}`,
                    params
                );
            } else {
                console.warn("failed_to_send_firebase_event: ", params);
            }
        }
    }

    // PRE-WRAPPED EVENTS
    public SEND_GA_ACTION_MOVE(action: ACTIONS): void {
        let label: string = "UNKNOWN_MOVE_ACTION";
        switch (action) {
            case ACTIONS.MOVE_DOWN:
                label = GA_EVENT_LABELS[ACTION_MOVE].DOWN;
                break;
            case ACTIONS.MOVE_UP:
                label = GA_EVENT_LABELS[ACTION_MOVE].UP;
                break;
            case ACTIONS.MOVE_LEFT:
                label = GA_EVENT_LABELS[ACTION_MOVE].LEFT;
                break;
            case ACTIONS.MOVE_RIGHT:
                label = GA_EVENT_LABELS[ACTION_MOVE].RIGHT;
                break;
        }
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.GAME,
            action: ACTION_MOVE,
            label,
        });
    }

    public SEND_GA_ACTION_GAME_RETRY(): void {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.GAME,
            action: ACTION_GAME_STATUS,
            label: GA_EVENT_LABELS[ACTION_GAME_STATUS].RETRY,
        });
    }

    public SEND_GA_ACTION_GAME_WIN(): void {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.GAME,
            action: ACTION_GAME_STATUS,
            label: GA_EVENT_LABELS[ACTION_GAME_STATUS].WIN,
        });
    }

    public SEND_GA_BOARD_CHECKPOINT_CREATED(gridText: string, index: number) {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.BOARD,
            action: ACTION_CHECKPOINT,
            label: gridText,
            value: index,
        });
    }

    public SEND_GA_ACTION_SIDEBAR_CLICK(buttonName?: SidebarButtonNames): void {
        let label: string = "UNKNOWN_SIDEBAR_CLICK_ACTION";
        switch (buttonName) {
            case SidebarButtonNames.ERASE:
                label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].ERASER;
                break;
            case SidebarButtonNames.PENCIL_BUTTON:
                label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].PENCIL;
                break;
            case SidebarButtonNames.TRASH:
                label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].TRASH;
                break;
            case SidebarButtonNames.PLAY:
                label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].PLAY;
                break;
            case SidebarButtonNames.SAVE:
                label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].SHARE;
                break;
        }
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label,
        });
    }

    public SEND_GA_ACTION_TILESET_BUTTON_CLICK(tile?: TILES) {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: GA_EVENT_LABELS[ACTION_BUTTON_PRESS].TILE_CHANGE,
            value: tile, // Unknown tile is negative 1
        });
    }

    public SEND_GA_ACTION_CELL_CLICK(row: number, col: number, size: number[]) {
        const tile = size[0] * row + col; // each tile's index
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: GA_EVENT_LABELS[ACTION_BUTTON_PRESS].GRID_TILE_CLICK,
            value: tile, // Unknown tile is negative 1
        });
    }

    public SEND_GA_ACTION_ACCEPT_GHOST_SUGGESTION(repName: RepresentationName) {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_ACCEPT_GHOST_SUGGESTION,
            label: repName,
            value: 1,
        });

        // Which suggestion position
        let index = -1;

        const REP_NAMES_TO_INDEX = {
            turtle: 0,
            wide: 1,
            narrow: 2,
            majority: 3,
            user: -1,
        };

        if (REP_NAMES_TO_INDEX[repName]) {
            index = REP_NAMES_TO_INDEX[repName];
        }

        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: GA_EVENT_LABELS[ACTION_BUTTON_PRESS].SUGGESTION_ACCEPT,
            value: index,
        });
    }

    public SEND_GA_UPDATE_TOOL_RADIUS(radius: number) {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: GA_EVENT_LABELS[ACTION_BUTTON_PRESS].BRUSH_SIZE,
            value: radius,
        });
    }

    public SEND_GA_UPDATE_NUM_STEPS(steps: number) {
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: GA_EVENT_LABELS[ACTION_BUTTON_PRESS].STEP_SIZE,
            value: steps,
        });
    }

    public SEND_GA_UPDATE_TILE_SET(tileset: string) {
        const tilesetIndex = SUPPORTED_TILESETS.indexOf(tileset);
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: GA_EVENT_LABELS[ACTION_BUTTON_PRESS].TILESET_CHANGE,
            value: tilesetIndex,
        });
    }

    public SEND_GA_UNDO_REDO(direction: number) {
        let label = "UNKNOWN_UNDO_REDO";
        if (direction > 0) {
            label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].REDO;
        } else {
            label = GA_EVENT_LABELS[ACTION_BUTTON_PRESS].UNDO;
        }
        this.sendEvent({
            category: GA_EVENT_CATEGORIES.EDITOR,
            action: ACTION_BUTTON_PRESS,
            label: label,
            value: direction,
        });
    }
}
