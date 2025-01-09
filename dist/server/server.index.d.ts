// Generated by dts-bundle-generator v9.5.1

declare function createPlugin<const TPluginName extends string, TInterface>(plugin: {
	/**
	 * Plugin name as const. Used as key for interface if defined.
	 */
	pluginName: TPluginName;
	/**
	 * On protect storage. Required to be defined by a plugin. Intended to be stored per-request,
	 * for example with `React.cache` or similar.
	 */
	onProtect?: {
		set: (onProtect: () => never) => void;
		get: () => undefined | (() => never);
	};
	/**
	 * Wrap protected queries. Must not touch `type`. Intended for e.g. caching queries per-request
	 * (see e.g. React.cache).
	 */
	wrapProtectedQuery?: <TQuery extends (...args: any[]) => any>(query: TQuery) => TQuery;
	/**
	 * Interface to use. Accessibe via `Kilpi.{pluginName}.{methodName}...`.
	 */
	interface: TInterface;
}): {
	/**
	 * Plugin name as const. Used as key for interface if defined.
	 */
	pluginName: TPluginName;
	/**
	 * On protect storage. Required to be defined by a plugin. Intended to be stored per-request,
	 * for example with `React.cache` or similar.
	 */
	onProtect?: {
		set: (onProtect: () => never) => void;
		get: () => undefined | (() => never);
	} | undefined;
	/**
	 * Wrap protected queries. Must not touch `type`. Intended for e.g. caching queries per-request
	 * (see e.g. React.cache).
	 */
	wrapProtectedQuery?: (<TQuery extends (...args: any[]) => any>(query: TQuery) => TQuery) | undefined;
	/**
	 * Interface to use. Accessibe via `Kilpi.{pluginName}.{methodName}...`.
	 */
	interface: TInterface;
};
export type KilpiPlugin = ReturnType<typeof createPlugin>;
/**
 * Permission granted with refined subject included.
 */
export type PermissionGrant<TSubjectOut> = {
	granted: true;
	subject: TSubjectOut;
};
/**
 * Permission denied, no refined subject required.
 */
export type PermissionDeny = {
	granted: false;
	message?: string;
};
/**
 * Permission is either granted (with refined subject) or denied based on the discriminated
 * union by the `granted: boolean` key.
 */
export type Permission<TSubjectOut> = PermissionGrant<TSubjectOut> | PermissionDeny;
declare function Grant<TSubjectOut>(subject: TSubjectOut): PermissionGrant<TSubjectOut>;
declare function Deny(message?: string): PermissionDeny;
declare const Permission: {
	Grant: typeof Grant;
	Deny: typeof Deny;
};
/**
 * Object with string keys to type T with any depth.
 */
export type DeepObject<T> = {
	[key: string]: T | DeepObject<T>;
};
/**
 * Extracts all keys from an object which have a value of type Target.
 */
export type RecursiveKeysTo<Object, Target, Separator extends string = "."> = Object extends object ? {
	[Key in keyof Object]: Key extends string | number ? Object[Key] extends Target ? Key : `${Key}${Separator}${RecursiveKeysTo<Object[Key], Target, Separator>}` : never;
}[keyof Object] : never;
/**
 * Extracts all values from an object which have a key of type Target.
 */
export type RecursiveValueByKey<Object, Key extends string, Separator extends string = "."> = Object extends object ? Key extends `${infer FirstKey}${Separator}${infer Rest}` ? FirstKey extends keyof Object ? RecursiveValueByKey<Object[FirstKey], Rest, Separator> : never : Key extends keyof Object ? Object[Key] : never : never;
/**
 * Value optionally wrapped in a promise.
 */
export type MaybePromise<T> = T | Promise<T>;
/**
 * Rules contain two functions: One to optionally narrow down the subject before checking the
 * subject's permission to the (optional) resource and the second the get the permission for a
 * given subject and resource.
 */
export type Rule<TResource, TSubject, TSubjectNarrowed = TSubject> = {
	/**
	 * Based on subject and resource, return a permission. Runs subject narrowing within.
	 */
	getPermission: (subject: TSubject, resource: TResource) => Promise<Permission<TSubjectNarrowed>>;
	/**
	 * Returning false signals a denied permission. Subject-narrowing does not depend on the resource.
	 */
	getNarrowedSubject: (subject: TSubject) => TSubjectNarrowed | false;
};
declare function initializeRules<TSubject>(): {
	create: <TResource = void>(check: (subject: TSubject, resource: TResource) => MaybePromise<boolean | Permission<TSubject>>) => Rule<TResource | TResource[], TSubject, TSubject>;
	subject: <TSubjectNarrowed>(getNarrowedSubject: (subject: TSubject) => false | TSubjectNarrowed) => {
		create<TResource_1>(check: (subject: TSubjectNarrowed, resource: TResource_1) => MaybePromise<boolean | Permission<TSubjectNarrowed>>): Rule<TResource_1 | TResource_1[], TSubject, TSubjectNarrowed>;
	};
};
/**
 * Rule inferral utilities
 */
export type InferRule<T> = T extends Rule<infer TResource, infer TSubject, infer TSubjectNarrowed> ? {
	resource: TResource;
	subject: TSubject;
	subjectNarrowed: TSubjectNarrowed;
} : never;
export type InferRuleResource<T> = InferRule<T>["resource"];
export type InferRuleSubjectNarrowed<T> = InferRule<T>["subjectNarrowed"];
/**
 * Rule-set is a deep-object of rules which all share a common base subject type.
 */
export type Ruleset<TSubject> = DeepObject<Rule<any, TSubject, any>>;
/**
 * Ensure a value is a rule
 */
export type EnsureTypeIsRule<T> = T extends Rule<any, any, any> ? T : never;
/**
 * Create ruleset separately. Requires calling as follows due to TypeScript limitations.
 *
 * `createRuleset<MySubject>()(Rule => {
 *   return {
 *     ...
 *   }
 * })`
 */
export declare function createRuleset<TSubject>(): <const TRuleset extends Ruleset<TSubject>>(rules: (Rule: ReturnType<typeof initializeRules<TSubject>>) => TRuleset) => TRuleset;
/**
 * Create a server client.
 */
export declare function createClient<TSubject, const TRuleset extends Ruleset<TSubject>, TPlugin extends ReturnType<typeof createPlugin>>({ getSubject, rules, plugins, defaults, }: {
	getSubject: () => Promise<TSubject>;
	rules: TRuleset | ((Rule: ReturnType<typeof initializeRules<TSubject>>) => TRuleset);
	plugins?: TPlugin[];
	defaults: {
		onProtect?: () => never;
	};
}): {
	createQuery: <TQuery extends (...args: any[]) => any>(originalQuery: TQuery, protector?: ((result: Awaited<ReturnType<TQuery>>, ...args: Parameters<TQuery>) => any) | undefined) => TQuery & {
		safe(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>> | null>;
		protect(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>>;
	};
	getSubject: () => Promise<TSubject>;
	ruleset: TRuleset;
	createEndpoint: ({ secret }: {
		secret: string;
	}) => (request: Request) => Promise<Response>;
	getPermission: <TKey extends RecursiveKeysTo<TRuleset, TRuleset extends Ruleset<infer TSubject_1> ? Rule<any, TSubject_1> : never, ":">>(ruleKey: TKey, resource: InferRuleResource<EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey, ":">>>) => Promise<Permission<any>>;
	hasPermission: <TKey_1 extends RecursiveKeysTo<TRuleset, TRuleset extends Ruleset<infer TSubject_1> ? Rule<any, TSubject_1> : never, ":">>(ruleKey: TKey_1, resource: InferRuleResource<EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey_1, ":">>>) => Promise<boolean>;
	protect: {
		<TKey_2 extends RecursiveKeysTo<TRuleset, TRuleset extends Ruleset<infer TSubject_1> ? Rule<any, TSubject_1> : never, ":">>(ruleKey: TKey_2, resource: InferRuleResource<EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey_2, ":">>>): Promise<InferRuleSubjectNarrowed<EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey_2, ":">>>>;
		<TKey_3 extends RecursiveKeysTo<TRuleset, TRuleset extends Ruleset<infer TSubject_1> ? Rule<any, TSubject_1> : never, ":">>(ruleKey: TKey_3): Promise<InferRuleSubjectNarrowed<EnsureTypeIsRule<RecursiveValueByKey<TRuleset, TKey_3, ":">>>>;
	};
	onProtect: (onProtectFn: () => never) => void;
} & {
	[Key in TPlugin["pluginName"]]: (TPlugin & {
		pluginName: Key;
	})["interface"];
} & {
	$$types: {
		subject: TSubject;
		ruleset: TRuleset;
		plugins: TPlugin;
	};
};
export type KilpiServerInstance<TSubject, TRuleset extends Ruleset<TSubject>, TPlugin extends KilpiPlugin> = ReturnType<typeof createClient<TSubject, TRuleset, TPlugin>>;
export declare const KilpiServer: {
	createClient: typeof createClient;
};

export {};
