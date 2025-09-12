import { db } from "@/db";
import { Kilpi } from "@/kilpi";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function ChangeRoleButton({
  children,
  ...ButtonProps
}: React.ComponentProps<"button">) {
  // Require user to be authenticated
  const user = await Kilpi.getSubject();
  if (!user) return null;

  // Get target role
  const targetRole = user.role === "admin" ? "user" : "admin";

  return (
    <form
      action={async () => {
        "use server";
        // Update user role and revalidate layout. No authorization as this is made to demo
        // authorization capabilities.
        await db
          .query("UPDATE user SET role = $role WHERE id = $id")
          .run({ $role: targetRole, $id: user.id });
        await revalidatePath("/", "layout");
        await redirect("/");
      }}
    >
      <button type="submit" {...ButtonProps}>
        {children || "Change role"}
      </button>
    </form>
  );
}
