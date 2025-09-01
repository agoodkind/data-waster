/**
 * Generates a random alphanumeric string of specified length
 * @param n - The length of the string to generate
 * @returns A random alphanumeric string
 */
export const rand = (n: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const array = new Uint32Array(n);
  crypto.getRandomValues(array);
  return Array.from(array, (x) => chars[x % chars.length]).join("");
};
