import { TypedEmitter } from "./TypedEmitter.js";

export class TypedEmitterProtected<TEvents extends Record<string, any>> extends TypedEmitter<TEvents> {
    constructor() {
        super();
    }

    /**
     * This method protects against external calls to emit. It does nothing.
     * @deprecated Use protected _emit instead.
     * @returns false
     */
    public emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): boolean {
        return false;
    }

    /**
     * Protected emit method for use in subclasses.
     */
    protected _emit<TEventName extends keyof TEvents & string>(eventName: TEventName, ...eventArg: TEvents[TEventName]): boolean {
        return super.emit(eventName, ...eventArg);
    }

    /**
     * This method protects against external calls to setMaxListeners. It does nothing.
     * @deprecated This method does nothing.
     * @returns
     */
    public setMaxListeners(n: number): this {
        return this;
    }

    protected _setMaxListeners(n: number): this {
        return super.setMaxListeners(n);
    }
}
