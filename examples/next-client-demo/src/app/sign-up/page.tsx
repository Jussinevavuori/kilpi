import SignUpForm from "@/components/SignUpForm";

export default async function SignUpPage() {
  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Create new account</h1>

      <SignUpForm />
    </main>
  );
}
