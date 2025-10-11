import { db } from "@/db";
import { Kilpi } from "@/kilpi.server";

export async function POST() {
  // Require user to be authenticated
  const { subject: user } = await Kilpi.authed().authorize().assert();

  // Get target role
  const targetRole = user.role === "admin" ? "user" : "admin";

  await db
    .query("UPDATE user SET role = $role WHERE id = $id")
    .run({ $role: targetRole, $id: user.id });

  // Redirect to "http://localhost:3000"
  return Response.redirect("http://localhost:3000", 302);
}
