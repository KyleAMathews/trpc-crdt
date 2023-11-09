# trpc-yjs

## 0.1.0

### Minor Changes

- First minor! Reverted experiment with letting trpc resolvers write directly to the response"

## 0.0.11

### Patch Changes

- Pass in doc to adapter in context

## 0.0.10

### Patch Changes

- Add prepublish scripts

## 0.0.9

### Patch Changes

- Breaking change: instead of returning the response, write directly to a response Map in the transaction

## 0.0.8

### Patch Changes

- e9ec738: Fix Typescript

## 0.0.7

### Patch Changes

- 5dd31d9: Allow passing in the callId so you can subscribe to in-progress updates to the response object from the backend

## 0.0.6

### Patch Changes

- Fix build

## 0.0.5

### Patch Changes

- Fix type of uuidv4 function and actually build

## 0.0.4

### Patch Changes

- The uuid package pulls in a bunch of extra stuff. crypto.getRandomValues is good enough

## 0.0.3

### Patch Changes

- Don't have yjs/trpc as dependencies — that's responsibility of implementor

## 0.0.2

### Patch Changes

- 14120dd: Initial setup of repo and release of trpc-yjs
- c72585d: Fixes and API cleanups
