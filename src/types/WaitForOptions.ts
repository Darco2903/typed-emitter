import type { Time } from "@darco2903/secondthought";

export type WaitForOptions<T extends any[]> = {
    /** The timeout duration, in milliseconds or as a Time object. */
    timeout?: number | Time;
    /** An optional condition function that must return true for the waitFor to resolve. If provided, the waitFor will only resolve when the event is emitted and the condition returns true. */
    condition?: (...eventArg: T) => boolean;
};
