# 🐢 Kilpi — Authorization made simple

[Read the docs to get started](https://kilpi.vercel.app)

Kilpi is the open-source TypeScript authorization library designed for developers who need flexible, powerful, and intuitive authorization.

Designed and created by [Jussi Nevavuori](https://jussinevavuori.com/) with ❤️ in Brisbane & Helsinki

![NPM Downloads](https://img.shields.io/npm/dw/%40kilpi%2Fcore)
![NPM Version](https://img.shields.io/npm/v/%40kilpi%2Fcore)
![GitHub Repo stars](https://img.shields.io/github/stars/Jussinevavuori/kilpi)

## Features

- Server-first authorization
- Framework agnostic
- Auth provider agnostic
- Policies as code
- Async policies
- Supports any authorization model
- Protected queries
- Plugin API & Library
- Developer friendly API
- 100% Type-safe

## Installation guides

- [React server components](https://kilpi.vercel.app/docs/plugins/react-server-components)
- [Next.js](https://kilpi.vercel.app/docs/installation/next-js)
- [Hono](https://kilpi.vercel.app/docs/installation/hono)
- [Express](https://kilpi.vercel.app/docs/installation/express)
- [Koa](https://kilpi.vercel.app/docs/installation/koa)
- [Oak](https://kilpi.vercel.app/docs/installation/oak)
- [Nestjs](https://kilpi.vercel.app/docs/installation/nest-js)

...or any other framework - Kilpi is easy to integrate into any TypeScript application.

## Examples

Define policies declaratively and authorize actions with one line

```ts
// Kilpi.ts
export const Kilpi = createKilpi({
  // (1) Connect your authentication provider with subject adapter
  async getSubject() {
    return myAuthProvider.getCurrentUser();
  },
  // (2) Define all policies
  policies: {
    documents: {
      update(user, doc: Document) {
        if (!user) return deny({ message: "Unauthenticated" });
        return user.id === doc.ownerId ? grant(user) : deny();
      },
    },
  },
});

// (3) Protect with one-liners

// Option 1: Succeed or throw
const user = await Kilpi.authorize("documents:update", document);
// Option 2: Authorization as boolean
const isAuthorized = await Kilpi.isAuthorized("posts:comment", post);
// Option 3: Full authorization decision object with all metadata
const decision = await Kilpi.getAuthorizationDecision("comments:delete", comment);
```

Continue learning about

- Plugins
- Protecting queries, actions, UI, pages, routes, ...
- Components

And much more.

[Read the docs to get started](https://kilpi.vercel.app)
