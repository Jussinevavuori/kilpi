# @kilpi/core

## 0.16.0

### Minor Changes

- 505d922: remove deprecated rbac utility (will be replaced by improved api)

## 0.15.0

### Minor Changes

- 9d88502: added subject context API for passing data into getSubject

## 0.14.0

### Minor Changes

- 32ebbc9: introduced type to denied authorizations, added with deny({ message: "...", type: "..." })

## 0.13.0

### Minor Changes

- e9e55d2: merge KilpiCore.defaults into KilpiCore.settings, rename KilpiCore.defaults.onUnauthorized to KilpiCore.settings.defaultOnUnauthorized

### Patch Changes

- ad3f6e6: remove exports of internal properties

## 0.12.1

### Patch Changes

- 4f3c484: add "exports" field to package.json for vite
- 29d6148: fix package.json exports

## 0.12.0

### Minor Changes

- 5821dc7: introduce Kilpi.scoped for wrapping functions with Kilpi.runInScope with improved API

## 0.11.0

### Minor Changes

- 16e9b1d: release audit plugin as stable, improve flushing strategies, add enabling and disabling, add batching strategy, add support for waitUntil

### Patch Changes

- f334fa2: fix typing of createKilpi and createKilpiClient with multiple plugins
- 3beb86f: enabling and disabling audit plugin

## 0.10.2

### Patch Changes

- 3016769: update unstable audit plugin api

## 0.10.1

### Patch Changes

- 7741f05: introduce audit plugin in beta

## 0.10.0

### Minor Changes

- df8d374: introduce @kilpi/client, update plugins to only return public interface

## 0.9.1

### Patch Changes

- a55d4ab: allow sync policy definitions

## 0.9.0

### Minor Changes

- c1f990e: change policy and authorization apis for defining policies

## 0.8.2

### Patch Changes

- ea30d78: fix type support for 4+ plugins

## 0.8.1

### Patch Changes

- b2b77ad: introduce Kilpi.extend() as syntatic sugar for Object.assign(Kilpi, {...})

## 0.8.0

### Minor Changes

- 8082814: new plugin api, new "hooks" api for implementing plugins (and other custom behaviour)

### Patch Changes

- f9cd1b2: pass resolveScope() to plugin factories as second argument

## 0.7.1

### Patch Changes

- 4c6eec1: improved documentation

## 0.7.0

### Minor Changes

- 89c2162: introduced new plugin API, removed adapter API, introduced subject caching, renamed request context to 'scope'
- 2831373: plugins can now extend the "scope" type internally with ExtendedKilpiScope

## 0.6.3

### Patch Changes

- 03e75da: fix export of Policy

## 0.6.2

### Patch Changes

- 30a123f: fix adapter initialization, add tests

## 0.6.1

### Patch Changes

- e64791d: Fix `.npmignore` files for each package, as it was omitting required files.

## 0.6.0

### Minor Changes

- 155ac6a: Renaming APIs:

## 0.5.2

### Patch Changes

- d131414: export createKilpi

## 0.5.1

### Patch Changes

- c6fb2f9: test fixed releasing

## 0.5.0

### Minor Changes

- 7de4ff2: Setting up automated releasing

## 0.4.0

### Minor Changes

- 60168e1: setup package

## 0.1.1

### Patch Changes

- 18d7ea7: Testing changeset for releasing
