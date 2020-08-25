let lastError: string | null = null;
let lastMessage: string | null = null;
let errorCount: number;
let silenceOutput: boolean;

let DEBUG = false;

let getContext = (): ErrorContext => ({});

reset();

export function reset(): void {
    lastError = null
    lastMessage = null;
    errorCount = 0;
    silenceOutput = false;
}

export function setDebug(debug = true): void {
    DEBUG = debug;
}

export function silent(f = true): void {
    silenceOutput = f;
}

export interface ErrorContext {
    line?: number;
    column?: number;
}

export function setContext(fn: () => ErrorContext): void {
    getContext = fn;
}

export function error(s: string): void {
    const err = errorString(s);
    // De-dup identical messages
    if (err === lastMessage) {
        return;
    }
    lastMessage = err;
    lastError = lastMessage;
    if (!silenceOutput) {
        console.error(lastError);
        if (DEBUG) {
            const e = new Error("Stack trace");
            console.error(e.stack);
        }
    }
    errorCount += 1;
}

export function warn(s: string): void {
    const err = errorString(s);
    // De-dup identical messages
    if (err === lastMessage) {
        return;
    }
    lastMessage = err;
    if (!silenceOutput) {
        console.warn(lastMessage);
    }
}

export function getLastMessage(): string | null {
    return lastMessage;
}

function errorString(s: string): string {
    const ctx = getContext();
    if (ctx.line !== undefined && ctx.column !== undefined) {
        return 'firebase:' + ctx.line + ':' + ctx.column + ': ' + s;
    } else {
        return 'firebase: ' + s;
    }
}

export function hasErrors(): boolean {
    return errorCount > 0;
}

export function errorSummary(): string {
    if (errorCount === 1 && lastError) {
        return lastError;
    }

    if (errorCount !== 0) {
        return "Fatal errors: " + errorCount;
    }
    return "";
}