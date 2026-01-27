/**
 * dataHelpers - Standardized utility functions for complex data manipulation.
 */

/**
 * Safely retrieves a value from a deeply nested object using a dot-notation path.
 * Effectively handles null/undefined at any level of the tree.
 * 
 * @example
 * getNestedValue({ user: { name: "John" } }, "user.name") // returns "John"
 * 
 * @param {Object} obj - Source object to traverse.
 * @param {string} path - Dot-notation string path (e.g., "address.city").
 * @returns {any} - The value at the path, or null if traversal fails.
 */
export const getNestedValue = (obj, path) => {
  if (!obj || typeof path !== "string") return null;

  return path.split(".").reduce((current, key) => {
    return (current !== null && current !== undefined && current[key] !== undefined) 
      ? current[key] 
      : null;
  }, obj);
};

/**
 * Normalizes a value for stable comparison (Sorting/Searching).
 * 
 * @param {any} value - The input value to normalize.
 * @returns {string} - Lowarcased string for comparison.
 */
export const normalizeValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase().trim();
};
