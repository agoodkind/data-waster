/**
 * Converts a string to camelCase
 */
const toCamelCase = (str: string): string => {
  return str.replace(/[-_]([a-z])/g, (_, char) => char.toUpperCase());
};

/**
 * Type guard to check if value is a plain object
 */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

/**
 * Recursively converts all keys in an object to camelCase
 * @param obj The object to convert
 * @returns A new object with all keys in camelCase
 */
export function deepCamelCaseKeys<T>(obj: unknown): T {
  if (obj === null || typeof obj !== "object") {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepCamelCaseKeys(item)) as unknown as T;
  }

  if (isPlainObject(obj)) {
    return Object.entries(obj).reduce(
      (result, [key, value]) => {
        const camelKey = toCamelCase(key);
        return {
          ...result,
          [camelKey]: deepCamelCaseKeys(value),
        };
      },
      {} as Record<string, unknown>,
    ) as T;
  }

  return obj as T;
}
