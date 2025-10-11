import {
  createKilpiPlugin,
  type AnyKilpiCore,
  type KilpiOnUnauthorizedAssertHandler,
} from "@kilpi/core";
import { create_Authorize } from "../components/Authorize";
import { createRscCache } from "../utils/createRscCache";

/**
 * React server component plugin for automatically providing a Kilpi scope
 * in React Server Components and for creating the React Server Component bindings
 * to work with Kilpi.
 */
export function ReactServerPlugin<TCore extends AnyKilpiCore>(
  options: {
    disableSubjectCaching?: boolean;
  } = {},
) {
  return createKilpiPlugin((Kilpi: TCore) => {
    // =============================================================================================
    // AUTOMATIC SUBJECT CACHING (unless disabled)
    // =============================================================================================

    if (!options.disableSubjectCaching) {
      // Create React.cache which holds the current subject
      const subjectCache = createRscCache(null as null | { subject: TCore["$$infer"]["subject"] });

      // Inject the subject from cache if available
      Kilpi.$hooks.onSubjectRequestFromCache(() => {
        const cached = subjectCache().value;
        if (cached) return cached;
        else return null;
      });

      // Update the cache when the subject is resolved
      Kilpi.$hooks.onSubjectResolved((event) => {
        subjectCache().value = { subject: event.subject };
      });
    }

    // =============================================================================================
    // PAGE-SPECIFIC ON_UNAUTHORIZED_ASSERT HANDLER
    // =============================================================================================

    const onUnauthorizedAssertCache = createRscCache(
      null as null | KilpiOnUnauthorizedAssertHandler,
    );
    Kilpi.$hooks.onUnauthorizedAssert(async (event) => {
      await onUnauthorizedAssertCache().value?.(event.decision);
    });

    /**
     * Return public API which allows access to components.
     */
    return {
      extendCore() {
        return {
          /**
           * Sets a custom onUnauthorizedAssert handler in the current React Server Component
           * context. Primary usage is to allow custom handling of unauthorized access
           * for each page.
           *
           * ## Example usage (Next.js)
           *
           * ```tsx
           * export default async function CreatePostPage() {
           *   // For this page only, all unauthorized access will redirect to /posts
           *   Kilpi.$onUnauthorizedRscAssert(() => {
           *     redirect("/posts");
           *   })
           *
           *   // Assert that the user can create posts -- else the above handler is called
           *   await Kilpi.posts.create().authorize().assert();
           *
           *   return <CreatePostForm />
           * }
           */
          $onUnauthorizedRscAssert(onUnauthorizedAssert: KilpiOnUnauthorizedAssertHandler) {
            onUnauthorizedAssertCache().value = onUnauthorizedAssert;
          },

          /**
           * Create React Server Component bindings for Kilpi.
           *
           * ## Example usage
           *
           * ```tsx
           * const { Authorize } = Kilpi.$createReactServerComponents();
           *
           * return (
           *   <Authorize decision={Kilpi.posts.read({ postId: "1" }).authorize()}>
           *     <Post postId="1" />
           *   </Authorize>
           * )
           * ```
           */
          $createReactServerComponents() {
            const Authorize = create_Authorize(Kilpi);
            return { Authorize };
          },
        };
      },
    };
  });
}
