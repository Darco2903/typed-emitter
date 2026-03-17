# Typed Emitter

## Description

Typed Emitter is a TypeScript library that provides a strongly-typed event emitter. It allows to define event types and their corresponding listener signatures, ensuring type safety when emitting events and registering listeners.

## Features

- Strongly-typed event definitions and listeners
- TypedEmitterProtected class for protected access to the emitter instance
- `onceAsync` method for awaiting a single occurrence of an event
- `waitFor` method for waiting for an event with optional timeout and condition
- Integration with `neverthrow` for robust error handling in asynchronous event waiting
- Optional integration with `@darco2903/secondthought` for typed timespans

> **Note**: `waitFor` method uses [**neverthrow**](https://www.npmjs.com/package/neverthrow) to provide a robust way to handle asynchronous event waiting with proper error handling.
> It also supports integration with [**@darco2903/secondthought**](https://www.npmjs.com/package/@darco2903/secondthought), allowing you to use typed timespans for timeouts when waiting for events. This integration is optional but recommended for enhanced type safety and convenience.

## Installation

```bash
npm install @darco2903/typed-emitter
```

## TypedEmitterProtected

The `TypedEmitterProtected` class is a base class that provides protected access to the emitter instance. It can be extended by other classes to create their own typed emitters while keeping the emitter instance protected. It allows you to define your own methods that can emit events using the protected `_emit` method, while preventing external code from directly emitting events.

```ts
import { TypedEmitterProtected } from "@darco2903/typed-emitter";

interface MyEvents {
    event: [{ id: number; name: string }];
}

class MyEmitter extends TypedEmitterProtected<MyEvents> {
    constructor() {
        super();
    }

    public triggerEvent(id: number, name: string) {
        this._emit("event", { id, name }); // protected method that actually emits the event
    }
}

const emitter = new MyEmitter();

emitter.on("event", (data) => {
    console.log("Received event:", data);
});

emitter.triggerEvent(1, "Test"); // This will log: Received event: { id: 1, name: 'Test' }

emitter.emit("event", { id: 2, name: "Another Test" }); // This will not log anything, as the protected method is not called
```

## Example Usage

### Basic Event Emitter

```ts
import { TypedEmitter } from "@darco2903/typed-emitter";

const emitter = new TypedEmitter<{
    message: [message: string];
    userConnected: [userId: number, username: string];
}>();

emitter.on("message", (message) => {
    console.log(`Received message: ${message}`);
});

emitter.emit("message", "Hello, World!");

emitter.on("userConnected", (userId, username) => {
    console.log(`User connected: ${username} (ID: ${userId})`);
});

emitter.emit("userConnected", 1, "Bob");
```

### Using `onceAsync` and `waitFor`

```ts
import { TypedEmitter } from "@darco2903/typed-emitter";

export interface MyEvents {
    event1: [{ id: number; name: string }];
    event2: [boolean];
    event3: [{ a: number; b: string }];
}

const emitter = new TypedEmitter<MyEvents>();

// will wait for "event1" to be emitted and resolve with the event arguments
const [{ id, name }] = await emitter.onceAsync("event1");

// no options, will wait indefinitely until event2 is emitted
await emitter.waitFor("event2");

// will wait for event2 to be emitted, but will resolve with an Err if it takes longer than 1000ms
await emitter.waitFor("event2", { timeout: 1000 });

// will wait for event3 to be emitted, but will only resolve if the condition is met (a > 0 and b === "Hello")
await emitter.waitFor("event3", { condition: ({ a, b }) => a > 0 && b === "Hello" });

// will wait for event2 to be emitted, but will only resolve if the condition is met (v is true) and will resolve with an Err if it takes longer than 1000ms
await emitter.waitFor("event2", { timeout: 1000, condition: (v) => v });

// Full example with both timeout and condition:

await emitter
    .waitFor("event1", {
        timeout: 1000,
        condition: ({ id }) => id > 0,
    })
    .match(
        ([{ id, name }]) => {
            // event was emitted and condition was met
            console.log("Event received:", id, name);
        },
        () => {
            // timeout was reached before event was emitted
            console.error("Failed to wait for event: timeout reached");
        },
    );
```

### SecondThought Integration

```ts
import { TypedEmitter } from "@darco2903/typed-emitter";
import { Second } from "@darco2903/secondthought";

const emitter = new TypedEmitter<{
    event: [number];
}>();

// will wait for "event" to be emitted, but will resolve with an Err if it takes longer than 2 seconds
await emitter.waitFor("event", { timeout: new Second(2) });
```
