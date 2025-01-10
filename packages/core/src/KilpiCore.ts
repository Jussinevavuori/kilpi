import { KilpiError } from "./error";
import { SubjectGuard } from "./guard";
import { createKilpiConstructor, KilpiConstructor } from "./kilpiCoreConstructor";
import { Permission } from "./permission";
import {
  GetRuleByKey,
  getRuleByKey,
  InferRuleGuardedSubject,
  InferRuleResource,
  Rule,
  Ruleset,
  RulesetKeys,
} from "./rule";
import { endpointRequestSchema } from "./schemas";
import { createCallStackSizeProtector } from "./utils/callStackSizeProtector";

/**
 * Call stack size protector to provide helpful error messages to user if they accidentally call
 * protect() (or a protected query) within a protect() call, which causes an infinite loop. This
 * may happen e.g. due to calling protect() or a protected query within the `getSubject` function
 * or a rule evaulator function.
 */
const callStackSizeProtector = createCallStackSizeProtector({
  maxStackSize: 50,
  errorMessage: `
		Kilpi.protect() called too many times recursively -- potential infinite loop
		detected. This is usually caused by calling protect() or a protected query
		with query.protect() or query.safe() in getSubject() or a rule. These cause
		an infinite loop. Ensure all rules and the getSubject function do not call
		protect() or protected queries with .protect() or .safe().
	`.replace(/\s+/g, " "), // Normalize whitespace
});

/**
 * Handler when `protect()` denies access. Either a sync or async function that runs a side effect
 * on denial (e.g. a log) or throws an error or other throwable, e.g. a redirect.
 */
export type OnDenyHandler = (options: {
  message?: string;
  rule: Rule<any, any, any>;
  subject: unknown;
}) => void | never | Promise<void> | Promise<never>;

/**
 * Kilpi core class to encapsulate ruleset, guards, subjects and more.
 */
export class KilpiCore<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>,
  TGuards extends Record<string, SubjectGuard<TSubject, object | null | undefined>>
> {
  /**
   * Subject fetcher
   */
  getSubject: () => TSubject | Promise<TSubject>;

  /**
   * Ruleset from construction
   */
  ruleset: TRuleset;

  /**
   * All subject guard functions from construction
   */
  guards: TGuards;

  /**
   * Inferring utilities. Do not use in runtime.
   */
  public $$infer = null as unknown as {
    subject: TSubject;
    ruleset: TRuleset;
    guards: TGuards;
  };

  /**
   * New instance
   */
  constructor(
    getSubject: () => TSubject | Promise<TSubject>,
    construct: (constructor: KilpiConstructor<TSubject>) => {
      guards: TGuards;
      rules: TRuleset;
    }
  ) {
    // Run construct function with constructor
    const { guards, rules } = construct(createKilpiConstructor<TSubject>());

    // Assign properties to instance
    this.getSubject = getSubject;
    this.ruleset = rules;
    this.guards = guards;
  }

  /**
   * Get permission to a rule inside the ruleset
   */
  async getPermission<TKey extends RulesetKeys<TRuleset>>(
    key: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ): Promise<Permission<InferRuleGuardedSubject<GetRuleByKey<TRuleset, TKey>>>> {
    const subject = await this.getSubject();
    const rule = getRuleByKey(this.ruleset, key);
    const permission = await rule(subject, resource);
    return permission;
  }

  /**
   * Get permission to a rule inside the ruleset (only return boolean)
   */
  async hasPermission<TKey extends RulesetKeys<TRuleset>>(
    key: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>
  ): Promise<boolean> {
    const subject = await this.getSubject();
    const rule = getRuleByKey(this.ruleset, key);
    const permission = await rule(subject, resource);
    return permission.granted;
  }

  /**
   * Throw if no permission, else return guarded subject
   */
  async protect<TKey extends RulesetKeys<TRuleset>>(
    key: TKey,
    resource: InferRuleResource<GetRuleByKey<TRuleset, TKey>>,
    onDeny?: OnDenyHandler
  ): Promise<InferRuleGuardedSubject<GetRuleByKey<TRuleset, TKey>>> {
    // Evaluate rule within infinite loop protection
    const { subject, rule, permission } = await callStackSizeProtector.run(async () => {
      const subject = await this.getSubject();
      const rule = getRuleByKey(this.ruleset, key);
      const permission = await rule(subject, resource);
      return { subject, rule, permission };
    });

    // Granted
    if (permission.granted) return permission.subject;

    // Handle denials -- use provided `onDeny()` function if provided. Defaults to throwing a
    // PermissionDenied error unless `onDeny` throws an error (or other throwable, e.g. a redirect).
    if (onDeny) await onDeny?.({ message: permission.message, rule, subject });
    throw new KilpiError.PermissionDenied(permission.message ?? "Unauthorized");
  }

  /**
   * Expose guards via `guard.[guardKey]` syntax, similar to protect but without requiring a
   * resource. E.g., `await KilpiCore.guard.authed()`.
   */
  get guard(): TGuards {
    return new Proxy(this.guards, {
      get: async (guards, key: string) => {
        // Access guard
        const guard = guards[key as keyof TGuards];
        if (!guard) throw new KilpiError.Internal(`Guard "${key}" not found.`);
        // Get subject
        const subject = await this.getSubject();
        // Run guard and throw if not granted, else return guarded subject
        const guardResult = await guard(subject);
        if (!guardResult) throw new KilpiError.PermissionDenied("Unauthorized");
        return guardResult.subject;
      },
    });
  }

  /**
   * Create protected query
   */
  createProtectedQuery<TQuery extends (...args: any[]) => Promise<any>>(
    query: TQuery,
    protector?: (result: Awaited<ReturnType<TQuery>>, ...args: Parameters<TQuery>) => Promise<any>
  ) {
    return Object.assign(query, {
      /**
       * Return null if the authorization check fails
       */
      async safe(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>> | null> {
        try {
          const result = await query(...args);
          await protector?.(result, ...args);
          return result; // Passed
        } catch (e) {
          if (!(e instanceof KilpiError.PermissionDenied)) {
            console.warn(`createQuery safe() method errored with unexpected error: ${e}`);
          }
          return null;
        }
      },

      /**
       * Throw if authorization check fails
       */
      async protect(...args: Parameters<TQuery>): Promise<Awaited<ReturnType<TQuery>>> {
        try {
          const result = await query(...args);
          await protector?.(result, ...args);
          return result;
        } catch (e) {
          if (!(e instanceof KilpiError.PermissionDenied)) {
            console.warn(`createQuery safe() method errored with unexpected error: ${e}`);
          }
          throw e;
        }
      },
    });
  }

  /**
   * Create endpoint handler
   */
  createPostEndpoint(options: { secret: string }) {
    return async (request: Request) => {
      try {
        // Protection: ensure secret provided to server and by client
        if (!options.secret) return new Response("No secret setup on server", { status: 501 });
        if (request.headers.get("authorization") !== `Bearer ${options.secret}`) {
          return new Response("Unauthorized", { status: 401 });
        }

        // Parse and validate body, get subject
        const body = endpointRequestSchema.parse(await request.json());
        const subject = await this.getSubject();

        // Run correct action based on specified action
        switch (body.action) {
          // Fetch subject: Simply return subject
          case "fetchSubject": {
            return Response.json(subject);
          }

          // Fetch permission: Run all specified rules and return results
          case "fetchPermissions": {
            const permissions = Promise.all(
              body.rules.map(({ key, resource }) => this.getPermission(key as any, resource))
            );
            return Response.json(permissions);
          }
        }
      } catch (error) {
        return new Response(`Invalid request`, { status: 400 });
      }
    };
  }
}
