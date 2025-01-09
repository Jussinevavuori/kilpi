// Generated by dts-bundle-generator v9.5.1

declare class KilpiInternalError extends Error {
	constructor(message: string, options?: {
		cause?: unknown;
	});
}
declare class KilpiPermissionDeniedError extends Error {
	constructor(message: string);
}
declare class KilpiInvalidSetupError extends Error {
	constructor(message: string);
}
declare class KilpiFetchPermissionFailedError extends Error {
	constructor(message: string);
}
declare class KilpiFetchSubjectFailedError extends Error {
	constructor(message: string);
}
/**
 * All Kilpi errors.
 */
export declare const KilpiError: {
	Internal: typeof KilpiInternalError;
	InvalidSetup: typeof KilpiInvalidSetupError;
	PermissionDenied: typeof KilpiPermissionDeniedError;
	FetchSubjectFailed: typeof KilpiFetchSubjectFailedError;
	FetchPermissionFailed: typeof KilpiFetchPermissionFailedError;
};

export {};
