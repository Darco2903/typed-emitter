import EventEmitter from "events";

export class TypedEmitter<TEvents extends Record<string, any>> extends EventEmitter {
    private emitter = new EventEmitter();

    addListener<TEventName extends keyof TEvents & string>(
        eventName: TEventName,
        handler: (...eventArg: TEvents[TEventName]) => void
    ): this {
        this.emitter.addListener(eventName, handler as any);
        return this;
    }

    emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): boolean {
        return this.emitter.emit(eventName, ...(eventArg as []));
    }

    eventNames(): (keyof TEvents & string)[] {
        return this.emitter.eventNames() as (keyof TEvents & string)[];
    }

    getMaxListeners(): number {
        return this.emitter.getMaxListeners();
    }

    listenerCount<TEventName extends keyof TEvents & string>(eventName: TEventName): number {
        return this.emitter.listenerCount(eventName);
    }

    listeners<K>(eventName: string | symbol): Function[] {
        return this.emitter.listeners(eventName);
    }

    off<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this {
        this.emitter.off(eventName, handler as any);
        return this;
    }

    on<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this {
        this.emitter.on(eventName, handler as any);
        return this;
    }

    once<TEventName extends keyof TEvents & string>(eventName: TEventName, handler: (...eventArg: TEvents[TEventName]) => void): this {
        this.emitter.once(eventName, handler as any);
        return this;
    }

    prependListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.emitter.prependListener(eventName, listener);
        return this;
    }

    prependOnceListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.emitter.prependOnceListener(eventName, listener);
        return this;
    }

    rawListeners<TEventName extends keyof TEvents & string>(eventName: TEventName): Function[] {
        return this.emitter.rawListeners(eventName);
    }

    removeAllListeners<TEventName extends keyof TEvents & string>(eventName: TEventName): this {
        this.emitter.removeAllListeners(eventName);
        return this;
    }

    removeListener<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        this.emitter.removeListener(eventName, listener);
        return this;
    }

    setMaxListeners(n: number): this {
        this.emitter.setMaxListeners(n);
        return this;
    }
}
