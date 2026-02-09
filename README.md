# Typed Emitter

## Description

`Typed Emitter` is a TypeScript library that provides a strongly-typed event emitter. It allows to define event types and their corresponding listener signatures, ensuring type safety when emitting events and registering listeners.

## Installation

You can found the package here: [**@darco2903/typed-emitter**](https://github.com/users/Darco2903/packages/npm/package/typed-emitter)

## Example Usage

```ts
import { TypedEmitter } from "typed-emitter";

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
