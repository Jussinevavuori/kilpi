import { db } from "@/db";
import { Kilpi } from "@/kilpi";
import { forceRevalidateCurrentPage } from "@/utils/forceRevalidateCurrentPage";
import { Button, ButtonProps } from "./ui/button";

export type ChangeRoleButtonProps = ButtonProps;

export async function ChangeRoleButton({ ...ButtonProps }: ChangeRoleButtonProps) {
  // Require user to be authenticated
  const user = await Kilpi.getSubject();
  if (!user) return null;

  // Get target role
  const targetRole = user.role === "admin" ? "user" : "admin";

  return (
    <form
      onSubmit={async () => {
        "use server";

        // No authorizatin here: This is to demo authorization

        const sql = `
					UPDATE user
					SET role = $role
					WHERE id = $id;
				`;

        await db.query(sql).run({
          $role: targetRole,
          $id: user.id,
        });

        await forceRevalidateCurrentPage();
      }}
    >
      <Button type="submit" {...ButtonProps}>
        <span>Change role</span>
      </Button>
    </form>
  );
}
