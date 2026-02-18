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
  return email.endsWith("@stud.noroff.no");
}

/**
 *  Validate a password, ensuring it's at least 8 characters long
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  return password.length >= 8;
}

/**
 *  Validate a bio, ensuring it's not too long
 * @param {string} bio
 * @returns {boolean}
 */
export function isValidBio(bio) {
  return bio.length <= 160;
}

// /**
//  *  Validate a URL, ensuring it's a valid http/https URL
//  * @param {*} url
//  * @returns
//  */
// export function isValidUrl(url) {
//   try {
//     const u = new URL(url);
//     return u.protocol === "http:" || u.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// /**
//  *  Validate alt text for an image, ensuring it's not too long
//  * @param {*} alt
//  * @param {*} max
//  * @returns
//  */
// export function isValidAltText(alt, max = 120) {
//   return alt.length < max;
// }

// /**
//  *  Validate a media pair (URL and alt text) for either an avatar or a post image
//  * @param {*} param0
//  * @param {*} label
//  * @returns
//  */
// export function validateMediaPair({ url, alt }, label = "avatar") {
//   const errors = {};

//   const trimmedUrl = url.trim();
//   const trimmedAlt = alt.trim();

//   if (trimmedUrl && !isValidUrl(trimmedUrl)) {
//     errors[`${label}Url`] = "Must be a valid http/https URL.";
//   }

//   if (trimmedAlt && !trimmedUrl) {
//     errors[`${label}Alt`] = "Alt text requires a URL.";
//   }

//   if (trimmedAlt && !isValidAltText(trimmedAlt, 120)) {
//     errors[`${label}Alt`] = "Alt text must be 120 characters or less.";
//   }

//   return errors;
// }
