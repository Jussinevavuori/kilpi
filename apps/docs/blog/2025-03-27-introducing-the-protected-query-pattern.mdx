---
title: "Introducing the Protected Query Pattern for secure data access"
subtitle: "How to protect your data in full-stack applications"
author: Jussi Nevavuori
authorUrl: https://jussinevavuori.com
authorImage: https://cdn.bsky.app/img/avatar/plain/did:plc:55joowvmvf4vw6n734h7skux/bafkreih2usu2wuuwrytodiqhylcfio77mozhzoqfbxi2sugvwf5g5wvxc4@jpeg
date: 2025-03-27
summary: This article introduces the protected query pattern for authorizing your data queries with a clean and powerful API.
recommended: true
---


Securing modern full-stack applications can be complex. You have to manage authorizations in many different contexts from UI to data mutation functions.

In all of these contexts, you are required to query data and authorize access to it, maybe even conditionally redact and filter parts of it.

This problem seems simple initially, but may quickly grow into a difficult beast to maintain and understand in real production applications with complex and ever changing requirements.

This guide introduces the protected query pattern as a solution to this problem.

Note: This guide views the problem from the perspective of full-stack web applications, such as ones built with Next.js, however this is fully applicable to any application with server-side data fetching.

> This guide will use [Kilpi](https://kilpi.vercel.app) to implement strong authorizations, however the concepts can be transferred to your projects with or without using it.


## Protecting your queries

To start off, **you need a data access layer**. This is non-negotiable for well-structured applications to properly secure your data.

Scattered SQL queries across your codebase will most likely lead to unmaintainable authorization, even data leaks.

### When and where to protect your data?

Commonly, applications write queries and authorize the data when called as shown in the diagram below.

![Unprotected query model](/blog-assets/2025-03-27-unprotected-query.png)

This is simple to implement but starts becoming difficult to maintain as your application grows. Every time you call `getDocument()`, you also have to duplicate the authorization logic, which makes maintenance error prone and developer mistakes more likely.

```ts
export async function DocumentPage({ id }) {

  // All this extra authorization logic shouldn't belong in the component.
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login")
  };
  const document = await getDocument(id);
  if (!document) {
    redirect("/documents")
  };
  if (!(user.isAdmin || document.authorId === user.id)) {
    forbidden();
  }

  // Only now we're able to do what this component is supposed to do
  return <div>{document.title}</div>
}
```

### Authorization directly in the query?

The first alternative would be to implement the authorization logic directly in the query. Let's test this.

```ts
export async function getDocument(id: string, user: User) {
  // Get data
  const document = await db.documents.get(id);
  if (!document) return null;

  // Authenticate
  const user = await getCurrentUser();

  // Authorize
  if (!user) return null;
  if (!(user.isAdmin || document.authorId === user.id)) return null;
  return document;
}
```

When taking a closer look at this pattern, it quickly falls short. Now your queries aren't pure and can't be cached. They also can't be reused in other contexts, for example the `createDocumentPdfs()` cron job, which should be able to skip the authorization.

> You could add a new `skipAuthorization` parameter to the function but we both know that's just a workaround for a bad authorization model.

We need a better solution.

### The protected query pattern

I propose an alternative approach. **The protected query pattern**.

![Protected query model](/blog-assets/2025-03-27-protected-query.png)

The idea of the protected query pattern is to **wrap pure query functions with an authorization layer**, which exposes the query via two methods:

- `query.protect(...args)` for calling and authorizing the query with a `protector` function that is run after the query.
- `query.unsafe(...args)` for calling the wrapped pure query function directly.

**Benefits of this approach include...**

- Explicit API to express developer intent when calling queries.
- Co-location of your queries and data authorization logic:
  - No duplication of authorization logic.
  - Easy to maintain.
  - Less error-prone.
  - Make your components and functions more readable and expressive.
- Pure query functions that can be cached.

Creating a protected query is simple with [Kilpi.query](https://kilpi.vercel.app/docs/concepts/protected-query), but you can also implement a similar pattern on your own.

```ts
const getDocument = Kilpi.query(
  cache(async (id: string) => { // Pure query function can be cached!
    const document = await getDocumentPure(id);
    return document;
  }),
  {
    // Kilpi automatically provides the `subject` (i.e. caller or user)
    async protector({ input, output: document, subject }) {
      if (subject.isAdmin || document.authorId === subject.id) {
        return document;
      }

      // Handle errors by e.g. throwing or returning null
      throw new Error("You are not allowed to view this document");
    }
  }
)
```

With this pattern, your functions become expressive, beautiful, and short. 

(Just imagine removing this much code from hundreds of components and functions.)

```diff lang="ts"
  export async function DocumentPage({ id }) {
  
-   const user = await getCurrentUser();
-   if (!user) {
-     redirect("/login")
-   };
-   
-   const document = await getDocument(id);
-   if (!document) {
-     redirect("/documents")
-   };
-   if (!(user.isAdmin || document.authorId === user.id)) {
-     forbidden();
-   }

+   const document = await getDocument.protect(id);
+   if (!document) redirect("/documents");
  
    return <div>{document.title}</div>
  }
```

## Redacting data

Redacting data is another common problem when it comes to authorizing access to data.

Let's take a `getUserDetails(id)` query, which returns a user's details:

- All users should be able to view everyone's public profile details
- Only the user themselves and admins should be able to view the full details

(This same pattern can also be applied to filtering data, e.g. only show documents that the user has access to in a `listDocuments()` function.)

### How not to redact data

Again, short on time with pressure to complete your work, you might attempt the following patterns.

1. Authorization logic in your query to redact the data.

    ```ts
    // BAD: Unpure function, not cacheable, not reusable in different contexts
    async function getUserDetails(userId: string, user: User) {
      const caller = await getCurrentUser();
      
      const userDetails = await db.userDetails.get(userId);
      if (!userDetails) return null;
      
      if (userDetails.id !== user.id && !user.isAdmin) {
        userDetails.email = null;
        userDetails.phone = null;
      }
        
      return userDetails;
    } 
    ```

2. Redacting your data after calling the query.

    ```ts
    // BAD: Duplicated authorization logic, difficult to type correctly.
    async function UserDetailsComponent({ userId }) {
      const currentUser = await getCurrentUser();
      const userDetails = await getUserDetails(userId);
      if (userDetails && !(currentUser.id === userDetails.id || currentUser.isAdmin)) {
        userDetails.email = null;
        userDetails.phone = null;
      }
      return <div>...</div>
    }
    ```

3.  Having two different functions for redacted and full data.

    ```ts
    // BAD: Duplicated authorization logic, more functions to maintain.
    async function UserDetailsComponent({ userId }) {
      const currentUser = await getCurrentUser();
      const userDetails = currentUser.id === userId || currentUser.isAdmin
        ? await getFullUserDetails(userId)
        : await getOnlyPublicUserDetails(userId);
      return <div>...</div>
    }
    ```

None of these however feel right. All of them feel like workarounds, with each of them having their own problems.

You'll never guess what the proposed solution is.

### Protected queries to the rescue

The protected query pattern solves redacting data in a very elegant manner. The protector function returns the protected output, which can conditionally be redacted or filtered.

```ts
export const getUserDetails = Kilpi.query(
  cache(async (id: string) => {
    const userDetails = await db.userDetails.get(id);
    return userDetails;
  }),
  {
    async protector({ input, output: userDetails, subject }) {
      if (!userDetails) return null;

      // Authorized to full data
      if (userDetails.id === subject.id || subject.isAdmin) return userDetails;

      // Only authorized to public data
      return { id: userDetails.id, name: userDetails.name, /* ... */ }
    }
  }),
)
```

```diff lang="ts"
  async function UserDetailsComponent({ userId }) {
-   const currentUser = await getCurrentUser();
-   const userDetails = currentUser.id === userId || currentUser.isAdmin
-     ? await getFullUserDetails(userId)
-     : await getOnlyPublicUserDetails(userId);
+   const userDetails = await getUserDetails.protect(userId);
    return <div>...</div>
  }
```

Again, you get co-location of authorization logic, great type-safety, a clean and expressive API and no duplication of authorization logic.

That's easy and expressive code, that instantly communicates the intent to anyone reading the codebase.

## Going further with Kilpi

This section is primarily for those who are using [Kilpi](https://kilpi.vercel.app) to show how Kilpi can take the protected query pattern even further. You may skip this section if you're not interested in centralized authorization logic or using Kilpi.

### Centralizing authorization logic

The protected query pattern also goes well together with a centralized authorization layer, like what you get when using [Kilpi](https://kilpi.vercel.app).

This allows you to define your authorization logic in a single place, and then use it across all your queries.

```ts
export const policies = {
  documents: {
    read(user, document) {
      return user.id === document.authorId || user.isAdmin? grant(user) : deny();
    }
  }
} satisfies Policyset<Subject | null>
```

This makes it easy to implement protectors.

```ts {5}
export const getDocument = Kilpi.query(
  cache((id: string) => db.documents.get(id)),
  {
    async protector({ output: document }) {
      if (document) await Kilpi.authorize("documents:read", document);
      return document;
    }
  }
)
```

### Using `Kilpi.filter`

Even better, you can easily filter data with `Kilpi.filter` in your protected queries to only return the data the user is authorized to with a single line of code.

```ts {5}
export const listDocuments = Kilpi.query(
  cache(() => db.documents.getAll()),
  {
    async protector({ output: documents }) {
      return Kilpi.filter("documents:read", documents);
    }
  }
)
```

## Conclusion

A good authorization pattern doesn't just solve problems, it makes them non-problems.

This article is based on real problems and solutions I've encountered in countless industrial production projects over the years.

The protected query pattern has time after time proven itself to be a powerful and clean solution for authorizing access to data.

It cleanly solves all data authorization problems with a single API: Reusability, pure functions, co-location & duplication of authorization logic, maintainability, redactability, and much more.

Get started using protected queries with [Kilpi](https://kilpi.vercel.app).