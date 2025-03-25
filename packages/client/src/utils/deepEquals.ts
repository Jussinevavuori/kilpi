/**
 * Deep compare two objects.
 */
export function deepEquals(a: unknown, b: unknown): boolean {
  // Equivalent instance
  if (a === b) return true;

  // Both must be defined and objects
  if (!a) return false;
  if (!b) return false;
  if (typeof a !== "object") return false;
  if (typeof b !== "object") return false;

  // Both must have the same amount of keys
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;

  // Compare keys
  for (const key in a) {
    const aValue = a[key as keyof typeof a];
    const bValue = b[key as keyof typeof b];

    // Attempt check strict equality
    if (aValue === bValue) continue;

    // Attempt check deep equality
    if (!deepEquals(aValue, bValue)) return false;
  }

  // All checks passed: Objects are equal
  return true;
}
