import { createPostEndpoint, CreatePostEndpointOptions, Ruleset } from "@kilpi/core";
import { CreateKilpiServerClientOptions } from "./createServerClient";

/**
 * Wrap the createPostEndpoint with an improved API to be called via the client.
 */
export function wrapCreatePostEndpoint<
  TSubject extends object | null | undefined,
  TRuleset extends Ruleset<TSubject>
>({
  getSubject,
  ruleset,
}: CreateKilpiServerClientOptions<TSubject, TRuleset> & {
  ruleset: TRuleset;
}) {
  return function wrappedCreatePostEndpoint(
    options: Omit<CreatePostEndpointOptions<TSubject, TRuleset>, "ruleset" | "subject">
  ) {
    return createPostEndpoint({
      subject: getSubject,
      ruleset,
      ...options,
    });
  };
}
