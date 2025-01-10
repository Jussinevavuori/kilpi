# Todo

---

## React client components

---

## Automatic filtering of arrays with `.safe()`

```ts
const result = await myListQuery() // [UNALLOWED_1, ALLOWED_1, ALLOWED_2, UNALLOWED_2];
const safeResult = await myListQuery.safe() // Now `null`, should be [ALLOWED_1, ALLOWED_2];
```

---

## Smarter client query system with react-query like cache and deduping on permission fetches

- Smart query cache
- Smart deduping

---

## In-place rules

```ts
// In-place rules API for one-off rules
await Kilpi.protect(
	(Rule) => (
		Rule
			.subject(subject => subject ? subject : false) // Ensure subject exists
			.create<Booking>((subject, booking) => {
				return subject.user.id === booking.userId
			})
	),
	myBooking
)

// Instead of (for one-offs)
await Kilpi.protect("Bookings:read", myBooking) 
```

---

## Reduced boilerplate with advanced plugin system

Non-priority, API yet to be designed

---

## Open sourcing

- Contributing guide
- Documentation (See below -- use docusaurus)
- CI/CD for releasing to npm via `main` branch

---

## Documentation

- Usage
	- Install
	- Server
		- Setup subject
		- Setup rules (basic examples)
		- Setup client
		- Protect pages with `Kilpi.protect`
	- Client
		- Setup environment variables
		- Setup endpoint on server
		- Import type
		- Setup client
	- Next.js
		- Setup server components
		- Protect components with `<Access />`

- Protecting queries
	- `Kilpi.createProtectedQuery`
	- Protect at data source, call via `.protect()` (or `.safe()`), no need to keep track at page-level which queries are accessed and which permissions do they need

- Protecting mutations
		- `Kilpi.protect`
		- Philosophy: Protect at mutation-level in mutation-body
	- Protecting pages
		- `Kilpi.protect`
		- Separate page access rules should be defined and applied at page and at links to page

- Protecting react components
	- `<Access />` on server for variable UI
	- `<HasPermission />`, `<WithPermission />` on client for variable UI
	- `Kilpi.getPermission()`, `Kilpi.hasPermission()` on server for states
	- `usePermission()` on client for states

- Philosophy
	- Centralized rules
		- Easy to find, easy to change
		- Ensures no rules defined multiple times and forgotten to be updated
	- Server-first
		- More secure
		- Enables more features (fetching data in rule)
		- Client-side authorization forced to be second-class citizen
		- Smaller client bundle
		- Simpler programming model due to restrictions
	- Different protection strategies via unified authorization framework
		- Queries
		- Mutations
		- Pages
		- Components

- Best practices
	- Keep subject light weight
	- Keep rules in one place
	- Page protection via page rules
	- Server first, client second

- Writing rules
	- Basic API
	- Subject narrowing
	- Two patterns
		- Provide full resource to rule.
		- Provide resource ID to rule and fetch during check.
	- Examples
		- Authed vs Public
		- Freemium vs Premium
		- Organization RBAC
		- Complex organization ABAC document access

- API
	- Server
		- `createKilpiServerClient`
			- `getSubject`
			- `rules`
			- `onDeny`
		- `Kilpi.getSubject()`
		- `Kilpi.protect()`
		- `Kilpi.getPermission()`
		- `Kilpi.hasPermission()`
		- `Kilpi.createPostEndpoint()`
		- `Kilpi.onDeny()`
		- `Kilpi.createQuery()`
		- `Kilpi.$$types()`
	- Client
		- `createClientServerClient`
			- `<typeof Kilpi>`
			- `endpoint`
			- `secret`
		- `ClientKilpi.getSubject`
		- `ClientKilpi.getPermission`
		- `ClientKilpi.invalidate`
		- `ClientKilpi.onInvalidate`
	- React
		- `createKilpiReactServerComponents`
		- `createKilpiReactClientComponents`

- React / Next.js usage
	- Setup
		- Caching `getSubject`
		- Creating `onDenyStorage`
	- Server-side usages
		- Page
		- Component
			- Hide component / Show alt state
		- Query
		- Mutation
	- Client-side usages
		- Hide component / Show alt state
