var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// src/lib/error.ts
class KilpiInternalError extends Error {
  constructor(message, options = {}) {
    super(message, options);
    this.name = "KilpiInternalError";
  }
}

class KilpiPermissionDeniedError extends Error {
  constructor(message) {
    super(message);
    this.name = "KilpiPermissionDeniedError";
  }
}

class KilpiInvalidSetupError extends Error {
  constructor(message) {
    super(message);
    this.name = "KilpiInvalidSetupError";
  }
}

class KilpiFetchPermissionFailedError extends Error {
  constructor(message) {
    super(message);
    this.name = "KilpiFetchPermissionFailedError";
  }
}

class KilpiFetchSubjectFailedError extends Error {
  constructor(message) {
    super(message);
    this.name = "KilpiFetchSubjectFailedError";
  }
}
var KilpiError = {
  Internal: KilpiInternalError,
  InvalidSetup: KilpiInvalidSetupError,
  PermissionDenied: KilpiPermissionDeniedError,
  FetchSubjectFailed: KilpiFetchSubjectFailedError,
  FetchPermissionFailed: KilpiFetchPermissionFailedError
};
export {
  KilpiError
};
