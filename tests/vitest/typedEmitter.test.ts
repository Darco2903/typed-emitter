import { describe, it, expect } from "vitest";
import { TypedEmitter } from "../../src";
import { Second } from "@darco2903/secondthought";

//////////////////////////
// create TypedEmitter tests

describe("TypedEmitter", () => {
    it("should create a TypedEmitter instance", () => {
        interface Events {
            greet: [string];
            farewell: [string];
        }

        const emitter = new TypedEmitter<Events>();

        emitter.emit("greet", "Hello");
        emitter.emit("farewell", "Goodbye");
    });

    it("should handle events correctly", () => {
        interface Events {
            data: [number];
        }

        const emitter = new TypedEmitter<Events>();
        let receivedData = 0;

        emitter.on("data", (num) => {
            receivedData = num;
        });

        emitter.emit("data", 42);
        expect(receivedData).toBe(42);
    });

    it("should handle multiple events correctly", () => {
        interface Events {
            data1: [string];
            data2: [number];
        }

        const emitter = new TypedEmitter<Events>();
        let receivedData1 = "";
        let receivedData2 = 0;

        emitter.on("data1", (str) => {
            receivedData1 = str;
        });

        emitter.on("data2", (num) => {
            receivedData2 = num;
        });

        emitter.emit("data1", "Test");
        emitter.emit("data2", 42);
        emitter.emit("data2", 99);

        expect(receivedData1).toBe("Test");
        expect(receivedData2).toBe(99);
    });

    it("should support once listeners", () => {
        interface Events {
            ping: [];
        }

        const emitter = new TypedEmitter<Events>();
        let callCount = 0;

        emitter.once("ping", () => {
            callCount++;
        });

        emitter.emit("ping");
        emitter.emit("ping");

        expect(callCount).toBe(1);
    });

    it("should remove listeners correctly", () => {
        interface Events {
            update: [string];
        }

        const emitter = new TypedEmitter<Events>();
        let message = "";

        const handler = (msg: string) => {
            message = msg;
        };

        emitter.on("update", handler);
        emitter.emit("update", "First");
        emitter.off("update", handler);
        emitter.emit("update", "Second");

        expect(message).toBe("First");
    });

    it("should count listeners correctly", () => {
        interface Events {
            event: [];
        }

        const emitter = new TypedEmitter<Events>();
        const handler = () => {};
        emitter.on("event", handler);
        emitter.on("event", handler);
        expect(emitter.listenerCount("event")).toBe(2);
    });

    it("should retrieve event names", () => {
        interface Events {
            a: [];
            b: [];
        }

        const emitter = new TypedEmitter<Events>();
        emitter.on("a", () => {});
        emitter.on("b", () => {});
        expect(emitter.eventNames()).toEqual(["a", "b"]);
    });
});

describe("TypedEmitter onceAsync", () => {
    it("should resolve with event arguments", async () => {
        interface Events {
            data: [number, string];
            other: [boolean];
        }

        let resolved = false;

        const emitter = new TypedEmitter<Events>();
        const promise = emitter.onceAsync("data");
        promise.then(() => {
            resolved = true;
        });

        emitter.emit("other", true); // Emit other event to ensure it doesn't interfere
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait a bit to ensure the event is processed
        expect(resolved).toBeFalsy();

        emitter.emit("data", 42, "Hello");
        const result = await promise;
        expect(resolved).toBeTruthy();
        expect(result).toEqual([42, "Hello"]);
    });
});

describe("TypedEmitter waitFor", () => {
    it("should resolve when event is emitted (no timeout)", async () => {
        interface Events {
            data: [number, string];
        }

        const emitter = new TypedEmitter<Events>();
        const promise = emitter.waitFor("data");
        emitter.emit("data", 42, "Hello");
        const result = await promise;
        expect(result.isOk()).toBeTruthy();
        expect(result._unsafeUnwrap()).toEqual([42, "Hello"]);
    });

    it("should resolve when event is emitted (timeout as ms)", async () => {
        interface Events {
            data: [number, string];
        }

        const emitter = new TypedEmitter<Events>();
        const promise = emitter.waitFor("data", { timeout: 1000 });
        emitter.emit("data", 42, "Hello");
        const result = await promise;
        expect(result.isOk()).toBeTruthy();
        expect(result._unsafeUnwrap()).toEqual([42, "Hello"]);
    });

    it("should resolve when event is emitted (timeout as Time)", async () => {
        interface Events {
            data: [number, string];
        }

        const emitter = new TypedEmitter<Events>();
        const promise = emitter.waitFor("data", { timeout: new Second(1) });
        emitter.emit("data", 42, "Hello");
        const result = await promise;
        expect(result.isOk()).toBeTruthy();
        expect(result._unsafeUnwrap()).toEqual([42, "Hello"]);
    });

    it("should resolve when condition is met", async () => {
        interface Events {
            data: [number];
        }

        let resolved = false;

        const emitter = new TypedEmitter<Events>();
        const promise = emitter.waitFor("data", { condition: (args) => args > 10 });

        promise.then((res) => {
            resolved = true;
            return res;
        });

        emitter.emit("data", 5);
        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait a bit to ensure the event is processed
        expect(resolved).toBeFalsy();

        emitter.emit("data", 15);
        const result = await promise;
        expect(resolved).toBeTruthy();
        expect(result.isOk()).toBeTruthy();
        expect(result._unsafeUnwrap()).toEqual([15]);
    });

    it("should reject when timeout is reached (timeout as ms)", async () => {
        interface Events {
            data: [number, string];
        }

        const emitter = new TypedEmitter<Events>();
        const start = Date.now();
        const promise = emitter.waitFor("data", { timeout: 100 });
        const result = await promise;
        expect(result.isErr()).toBeTruthy();
        expect(result._unsafeUnwrapErr()).toBeUndefined();
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(100);
    });

    it("should reject when timeout is reached (timeout as Time)", async () => {
        interface Events {
            data: [number, string];
        }

        const emitter = new TypedEmitter<Events>();
        const start = Date.now();
        const promise = emitter.waitFor("data", { timeout: new Second(0.2) });
        const result = await promise;
        expect(result.isErr()).toBeTruthy();
        expect(result._unsafeUnwrapErr()).toBeUndefined();
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(200);
    });

    it("should reject when timeout is reached even if condition is not met", async () => {
        interface Events {
            data: [number];
        }

        const emitter = new TypedEmitter<Events>();
        const start = Date.now();
        const promise = emitter.waitFor("data", { timeout: 100, condition: (args) => args > 10 });

        emitter.emit("data", 5);

        const result = await promise;
        expect(result.isErr()).toBeTruthy();
        expect(result._unsafeUnwrapErr()).toBeUndefined();
        const duration = Date.now() - start;
        expect(duration).toBeGreaterThanOrEqual(100);
    });
});
