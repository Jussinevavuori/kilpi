**WARNING: THIS LIBRARY IS IN ALPHA -- A WORK IN PROGRESS -- USAGE AT YOUR OWN RISK**

Until version 1.0.0, the API is subject to breaking changes without a major version bump. This is not meant for production use by external users yet. Rather it is an internal project that is being developed in the open.

---

# Fine-grained authorization

## Why do you need fine-grained authorization?

Does your application have organizations which consist of multiple members with different roles optionally across different teams that access multiple projects that may be shared between organizations or external teams or singular members where who can read a document in a project depends on whether it is published or a draft but still application admins should be able access them?

Or do you just have to limit some content to authenticated users only?

Either way, use this as your solid fine-grained authorization framework.

Rolling your own authorization will most likely always end up in a mess of spaghetti, once you realize how complex it is to create a scalable, maintainable, developer-friendly authentication framework that also provides a good user experience. Or even worse, you have complex authorization checks littered across your components, server endpoints, pages, and CSS.

---

## Features

✅ Framework-agnostic _(Can be made to work with any stack with plugins)_

✅ Authentication-agnostic _(Bring your own authentication solution)_

✅ Server-first authorization rules _(All rules are evaluated on the server as they should be)_

✅ Client-only usable 

✅ Asynchronous authorization rules _(Fetch data while evaluating rule)_

✅ Client-side utilities _(Queries permission from server with batching and caching)_

✅ Protecting queries

✅ Role-based access control (RBAC) support

✅ Attribute-based access control (ABAC) support

✅ Subject narrowing

---

## Opinions

### Server-first

All authorization checks are done server first. This is done for several reasons:

- Security -- you can not trust the client to do authorization checks.
- Allows for asynchronous rules that fetch data if required.
- Simpler programming model due to restrictions.
- Smaller client-bundle as your entire authorization logic stays on the server.

There is nothing stopping you from using this in a client-only application -- but what are you protecting if you don't have a server? Alternatively, to alter the UI client-side you can use the `kilpi/client` package to query the server for permission to show pieces of UI.

### Queries vs Mutations

The project considers different strategies for protecting queries and mutations:

#### Mutations

For mutations, the project keeps it simple. Whether you are writing HTTP endpoints, tRPC procedures or GraphQL mutations, you can always just call `await Kilpi.protect(...)` to protect your mutation.

#### Queries

For queries, we provide the `const myQuery = Kilpi.createQuery(queryFn, protectorFn)` wrapper function. It ensures that no matter where you access your data, you can always be confident that no data ever leaks. This is due to it exposing three functions:

- `myQuery()` for accessing the `queryFn()` directly as-is, when you need the data but it won't be exposed to the user (e.g. in a mutation).
- `myQuery.safe()` for accessing the data or returning null for unauthorized.
- `myQuery.protect()` for accessing the data or throwing for unauthorized. You can throw a redirect, unauthorized / forbidden error, or a plain error - define your own behaviour with e.g. `Kilpi.onProtect(() => redirect(...))` on a per-page level.

This way, when creating a page, you don't have to remember every piece of data the page will access and attempt to protect each query separately.

```ts
// Before
function DashboardPage(params) {
  await protect("user:read", params.userId)
	const user = await getUser();
	let documents = await getUserDocuments();
	try {
		await Promise.all(documents.map(doc => protect("document:read", doc)))
	} catch {
		// Unauhtorized to read some document
		documents = [];
	}
}

// After
function DashboardPage(params) {
	const user = await getUser.protect();
	const documents = await getUserDocuments.safe() ?? [];
}
```

### Rules-as-code

Defining the rules have been left as an exercise to the reader. Whether you check the user's permissions, membership, subscription, role, authentication status or date of birth, rules allow to compose any custom logic to permit operations.

---

## Supported scenarios

✅ Authenticated vs. non-authenticated users

✅ Freemium vs. Premium users

✅ Role-based access control in organizations

✅ And much more complicated scenarios...

---

## Supported frameworks

✅ React

✅ Next.js


---

## Install

1. Clone repo.
1. Install dependencies with `bun install`.
1. Run tests with `bun test`.
1. Build with `bun run build` (or `bun run watch:build`).

---

## License

MIT
