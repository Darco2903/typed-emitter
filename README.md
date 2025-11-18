# Typed Emitter

## Description

`Typed Emitter` is a TypeScript library that provides a strongly-typed event emitter. It allows to define event types and their corresponding listener signatures, ensuring type safety when emitting events and registering listeners.

## Installation

```bash
npm install typed-emitter-<version>.tgz
pnpm add typed-emitter-<version>.tgz
```

## Example Usage

### Basic Example

```ts
import { TypedEmitter } from "typed-emitter";

const emitter = new TypedEmitter<{
    message: [string];
    userConnected: [number, string];
}>();

emitter.on("message", (message) => {
    console.log(`Received message: ${message}`);
});

emitter.emit("message", "Alice");

emitter.on("userConnected", (userId, username) => {
    console.log(`User connected: ${username} (ID: ${userId})`);
});

emitter.emit("userConnected", 1, "Bob");
```
