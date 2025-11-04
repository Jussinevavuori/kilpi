/**
 * Removes the given postfix from the string if it exists.
 *
 * @param str - The string to modify.
 * @param postfix - The postfix to remove if it exists.
 * @returns The modified string.
 */
export function removeStringSuffix(str: string, postfix: string): string {
  if (str.endsWith(postfix)) return str.slice(0, -postfix.length);
  return str;
}
