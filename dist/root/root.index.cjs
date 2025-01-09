var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/root/root.index.ts
var exports_root_index = {};
__export(exports_root_index, {
  KilpiError: () => KilpiError
});
module.exports = __toCommonJS(exports_root_index);

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
