import { describe, it, expect } from "vitest";
import { TypedEmitter } from "../../src";

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
