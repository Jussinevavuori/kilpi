export async function ChangeRoleButton({
  children,
  ...ButtonProps
}: React.ComponentProps<"button">) {
  return (
    <form method="POST" action="/api/change-role">
      <button type="submit" {...ButtonProps}>
        {children || "Change role"}
      </button>
    </form>
  );
}
