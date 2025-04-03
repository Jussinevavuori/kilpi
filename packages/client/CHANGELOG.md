# @kilpi/client

## 0.13.1

### Patch Changes

- 4f3c484: add "exports" field to package.json for vite
- 29d6148: fix package.json exports

## 0.13.0

### Minor Changes

- 16e9b1d: release audit plugin as stable, improve flushing strategies, add enabling and disabling, add batching strategy, add support for waitUntil

### Patch Changes

- f334fa2: fix typing of createKilpi and createKilpiClient with multiple plugins

## 0.12.0

### Minor Changes

- 99b47bb: change KilpiClient.fetchSubject and KilpiClient.fetchIsAuthorized function signatures to support query options, add support for signals in batching and KilpiClient utilities

## 0.11.0

### Minor Changes

- 638ccc2: - Introduce client plugins
  - Update `createKilpiClient` to use new inferring pattern (`{ infer: {} as typeof Kilpi }` instaed of `<typeof Kilpi>`).

## 0.10.0

### Minor Changes

- df8d374: introduce @kilpi/client, update plugins to only return public interface
