import EventEmitter from "events";
import { ResultAsync } from "neverthrow";
import type { WaitForOptions } from "./types/WaitForOptions.js";

export class TypedEmitter<TEvents extends Record<string, any>> implements EventEmitter {
    private emitter: EventEmitter;

    public constructor() {
        this.emitter = new EventEmitter();
    }

    public addListener<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void,
    ): this {
        this.emitter.addListener(eventName, handler as any);
        return this;
    }

    public emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): boolean {
        return this.emitter.emit(eventName, ...(eventArg as []));
    }

    public eventNames(): (keyof TEvents & string)[] {
        return this.emitter.eventNames() as (keyof TEvents & string)[];
    }

    public getMaxListeners(): number {
        return this.emitter.getMaxListeners();
    }

    public listenerCount<TEventName extends keyof TEvents & string>(eventName: TEventName): number {
        return this.emitter.listenerCount(eventName);
    }

    public listeners<TEventName extends keyof TEvents & string>(eventName: TEventName): ((...args: TEvents[TEventName]) => void)[] {
        return this.emitter.listeners(eventName);
    }

    public off<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void,
    ): this {
        this.emitter.off(eventName, handler);
        return this;
    }

    public on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this {
        this.emitter.on(eventName, handler);
        return this;
    }

    public once<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void,
    ): this {
        this.emitter.once(eventName, handler);
        return this;
    }

    public async onceAsync<TEventName extends keyof TEvents & string>(eventName: TEventName): Promise<TEvents[TEventName]> {
        return new Promise<TEvents[TEventName]>((resolve) => {
            this.once(eventName, (...args) => {
                resolve(args);
            });
        });
    }

    public prependListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: any[]) => void): this {
        this.emitter.prependListener(eventName, listener);
        return this;
    }

    public prependOnceListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: any[]) => void): this {
        this.emitter.prependOnceListener(eventName, listener);
        return this;
    }

    public rawListeners<TEventName extends keyof TEvents & string>(eventName: TEventName): ((...args: TEvents[TEventName]) => void)[] {
        return this.emitter.rawListeners(eventName);
    }

    public removeAllListeners<TEventName extends keyof TEvents & string>(eventName: TEventName): this {
        this.emitter.removeAllListeners(eventName);
        return this;
    }

    public removeListener<TEventName extends keyof TEvents & string>(eventName: TEventName, listener: (...args: any[]) => void): this {
        this.emitter.removeListener(eventName, listener);
        return this;
    }

    public setMaxListeners(n: number): this {
        this.emitter.setMaxListeners(n);
        return this;
    }

    /**
     * Waits for the specified event to be emitted, with an optional timeout.
     * @param eventName The name of the event to wait for.
     * @param options Optional options for waiting, including a timeout and a condition function.
     * @returns A ResultAsync that resolves to Ok if the event is emitted before the timeout, or Err if the timeout is reached first.
     */
    public waitFor<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        options?: WaitForOptions<TEvents[TEventName]>,
    ): ResultAsync<TEvents[TEventName], void> {
        return ResultAsync.fromPromise(
            new Promise<TEvents[TEventName]>((resolve, reject) => {
                let timeoutId: NodeJS.Timeout | null = null;
                let done = false;

                if (options?.timeout !== undefined) {
                    const t = typeof options.timeout === "number" ? options.timeout : options.timeout.toMillisecond().time;
                    timeoutId = setTimeout(() => {
                        if (done) return;
                        done = true;

                        this.off(eventName, handler);
                        reject();
                    }, t);
                }

                const cond = options?.condition === undefined ? () => true : options.condition;

                const handler: (...args: TEvents[TEventName]) => void = (...args) => {
                    if (!cond(...args)) return;

                    if (done) return;
                    done = true;

                    if (timeoutId !== null) {
                        clearTimeout(timeoutId);
                        timeoutId = null;
                    }

                    this.off(eventName, handler);
                    resolve(args);
                };

                this.on(eventName, handler);
            }),
            () => undefined,
        );
    }
}
