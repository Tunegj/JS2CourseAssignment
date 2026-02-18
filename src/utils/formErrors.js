export function setFieldError(fieldId, message) {
  const el = document.querySelector(`#${fieldId}-error`);
  if (el) el.textContent = message ?? "";
}

export function clearFieldErrors(fieldIds) {
  fieldIds.forEach((id) => setFieldError(id, ""));
}
