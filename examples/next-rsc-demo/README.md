# News App — Kilpi Next.js RSC Demo

This is an example project on how to use Kilpi in a Next.js App Router project using RSC with multiple good practices.

## Setup

Run this project using

```bash
bun run bootsrap
```

This will install all dependencies, then build and start the Next.js application and automatically migrate and seed the database. View the project at `http://localhost:3000`.

> This project uses `bun` as the package manager and for the `bun:sqlite` package ([Install Bun](https://bun.sh/docs/installation)).

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
