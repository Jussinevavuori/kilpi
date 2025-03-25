# 🛡️ Kilpi — Authorization made simple

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

- [React server components](https://kilpi.vercel.app/plugins/react-server-components)
- [Next.js](https://kilpi.vercel.app/installation/next)
- [Hono](https://kilpi.vercel.app/installation/hono)
- [Express](https://kilpi.vercel.app/installation/express)
- [Koa](https://kilpi.vercel.app/installation/koa)
- [Oak](https://kilpi.vercel.app/installation/oak)
- [Nestjs](https://kilpi.vercel.app/installation/nest-js)

...or any other framework - Kilpi is easy to integrate into any TypeScript application.

## Examples

Define policies declaratively

```ts
// Kilpi.ts
export const Kilpi = createKilpi({ 
  getSubject, 
  policies: {
    documents: {
      update(user, doc: Document) {
        if (!user) return deny("Unauthenticated");
        return user.id === doc.ownerId ? grant(user) : deny();
      }
    }
  }
})
```

Authorize actions with one line

```ts
const user = await Kilpi.authorize("documents:update", document);
```

Protect your data right at the source

```ts
const getDocument = Kilpi.query(
  async (id: string) => await db.documents.get(id),
  {
    async protector({ output: doc }) {
      if (doc) await Kilpi.authorize("documents:read", doc);
      return doc;
    }
  }
);

await getDocument.protect("1");
```

And much more.

[Read the docs to get started](https://kilpi.vercel.app)
