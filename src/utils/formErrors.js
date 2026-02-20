/**
 * Set the error message for a specific form field
 * @param {string} fieldId - The ID of the form field
 * @param {string} message - The error message to display
 */
export function setFieldError(fieldId, message) {
  const el = document.querySelector(`#${fieldId}-error`);
  if (el) el.textContent = message ?? "";
}

/**
 * Clear the error messages for multiple form fields
 * @param {string[]} fieldIds - An array of form field IDs
 */
export function clearFieldErrors(fieldIds) {
  fieldIds.forEach((id) => setFieldError(id, ""));
}
