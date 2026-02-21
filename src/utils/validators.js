/**
 *  Validate a name, ensuring it is 3-20 characters and only contains alphanumeric characters and underscores
 * @param {string} name
 * @returns {boolean}
 */
export function isValidName(name) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(name);
}

/**
 *  Validate an email, ensuring it ends with "@stud.noroff.no"
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const value = String(email || "")
    .trim()
    .toLowerCase();
  return /^[^\s@]+@stud\.noroff\.no$/.test(value);
}

/**
 *  Validate a password, ensuring it's at least 8 characters long
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return String(password || "").length >= 8;
}

/**
 *  Validate a bio, ensuring it's not too long
 * @param {string} bio
 * @returns {boolean}
 */
export function isValidBio(bio) {
  return String(bio || "").length <= 160;
}

/**
 *  Validate a URL, ensuring it's a valid http/https URL
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  const value = String(url || "").trim();
  if (!value) return true; // Allow empty URLs
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
