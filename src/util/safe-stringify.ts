// Safe stringify function to handle circular references
const safeStringify = (obj: unknown, indent = 2) => {
  const cache = new Set();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) {
          return "[Circular Reference]";
        }
        cache.add(value);
      }
      return value;
    },
    indent,
  );
};

export default safeStringify;
