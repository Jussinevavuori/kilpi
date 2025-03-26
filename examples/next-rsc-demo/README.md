# News App — Kilpi Next.js RSC Demo

This is an example project on how to use Kilpi in a Next.js App Router project using RSC with multiple good practices.

## Description & features

This project is a simple news application to demo basic authorization concepts and patterns with Kilpi.

- You can sign up & sign in with email and password.
- All users can read published articles.
- All authenticated users can post articles.
- Admins and article authors can delete articles.
- Article authors can publish or unpublish their articles.
- For demo purposes, authenticated users can change their role on the fly.

## Setup

This project uses `bun` as the package manager and for the `bun:sqlite` package ([Install Bun](https://bun.sh/docs/installation)).

To run this project, run `bun run bootstrap` in the project directory. The command will install all dependencies, then build and start the Next.js application. You can then open `http://localhost:3000` in your browser and start using the application. Get started by signing up.

The project uses a Bun SQLite database which requires no additional setup. It will create a `demo-db.sqlite` file (.gitignore'd) in your project directory. The database is seeded automatically on startup.

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
