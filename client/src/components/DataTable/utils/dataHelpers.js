/**
 * Safely retrieves nested values from an object using a dot-notation path.
 * Example: getNestedValue(user, "profile.firstName")
 *
 * @param {Object} object - The source object
 * @param {string} path - The dot-notation path
 * @returns {any} - The value at the path or null if not found
 */
export const getNestedValue = (object, path) => {
  if (!object || !path) return null;

  return path.split(".").reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : null;
  }, object);
};
