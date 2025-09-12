import SignInForm from "@/components/SignInForm";

export default async function SignInPage() {
  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Sign in to Kilpi News</h1>

      <SignInForm />
    </main>
  );
}
