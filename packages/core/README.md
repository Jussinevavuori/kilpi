**Unstable API until 1.0.0 released**

# 🛡️ Kilpi — Authorization made simple

Kilpi is the open-source TypeScript authorization library designed for developers who need flexible, powerful, and intuitive authorization.

[Read the docs to get started](https://kilpi.vercel.app)

[![npm](https://img.shields.io/npm/dm/better-auth)](https://npm.chart.dev/@kilpi/core?primary=neutral&gray=neutral&theme=dark)
[![npm version](https://img.shields.io/npm/v/better-auth.svg)](https://www.npmjs.com/package/@kilpi/core)
[![GitHub stars](https://img.shields.io/github/stars/better-auth/better-auth)](https://github.com/jussinevavuori/kilpi/stargazers)

## Fine-grained authorization

Kilpi is **the** TypeScript authorization framwork.

### Code examples

```ts
await Kilpi.authorize("documents:update", document);
```

```ts
const policies = {
  documents: {
    read: AuthedPolicy((user, doc: Document) => user.id === doc.userId),
    update: AuthedPolicy((user, doc: Document) => user.id === doc.userId)
  }
}
```

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

### Features

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

### Installation guides

- [React server components](https://kilpi.vercel.app/plugins/react-server-components)
- [Next.js](https://kilpi.vercel.app/installation/next)
- [Hono](https://kilpi.vercel.app/installation/hono)
- [Express](https://kilpi.vercel.app/installation/express)
- [Koa](https://kilpi.vercel.app/installation/koa)
- [Oak](https://kilpi.vercel.app/installation/oak)
- [Nestjs](https://kilpi.vercel.app/installation/nest-js)

...or any other framework - Kilpi is easy to integrate into any TypeScript application.