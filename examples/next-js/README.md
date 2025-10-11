# News App — Kilpi Next.js RSC Demo

This is an example project on how to use Kilpi in a Next.js full-stack application.

## Setup

Run the project using `bun run bootstrap` and visit `http://localhost:3000`. Requires [Bun](https://bun.sh/docs/docs/installation).

```bash
bun run bootstrap
```

This will initialize `.env`, migrate and seed the local SQLite database at `demo-db.sqlite`, install all dependencies, then build and start the Next.js application.

## Description & features

This project is a simple news application to demo basic authorization concepts and patterns with Kilpi.

- You can sign up & sign in with email and password.
- All users can read published articles.
- All authenticated users can post articles.
- Admins and article authors can delete articles.
- Article authors can publish or unpublish their articles.
- For demo purposes, authenticated users can change their role on the fly.

## Stack

This example uses the following technologies.

| Purpose        | Technology                                                                     |
| -------------- | ------------------------------------------------------------------------------ |
| Framework      | Next.js, React & RSC                                                           |
| Authentication | [Better Auth](https://www.better-auth.com/)                                    |
| Authorization  | [Kilpi](https://kilpi.vercel.app)                                              |
| Database       | [Bun SQLite](https://bun.sh/docs/api/sqlite)                                   |
| Server Actions | [next-safe-action](https://next-safe-action.dev/)                              |
| UI             | [Shadcn/UI](https://ui.shadcn.com/) & [Tailwind CSS](https://tailwindcss.com/) |
| Forms          | [React Hook Form](https://react-hook-form.com/)                                |
| Validation     | [Zod](https://zod.dev)                                                         |
