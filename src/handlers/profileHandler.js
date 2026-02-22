import { navigate, getPreviousHash } from "../router.js";
import {
  getMyProfile,
  getProfileByName,
  getProfilePosts,
  followProfile,
  unfollowProfile,
  updateProfile,
} from "../api/profiles.js";
import { isValidUrl } from "../utils/validators.js";
import { getUser } from "../utils/storage.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { getHashQueryParam } from "../utils/queryParams.js";

/**
 *  Safely escape text for HTML output, with an optional fallback for empty values
 * @param {*} value The value to escape
 * @param {*} fallback The fallback value to use if the input is empty
 * @returns {string} The escaped text or the fallback
 */
function safeText(value, fallback = "") {
  if (value === null || value === undefined || value === "") return fallback;
  return escapeHtml(String(value));
}

/**
 * Safely validate an image URL, returning an empty string if the URL is not valid
 * @param {string} url The image URL to validate
 * @returns {string} The original URL if valid, or an empty string if invalid
 */
function safeImg(url) {
  const cleanUrl = String(url || "").trim();
  return isValidUrl(cleanUrl) ? cleanUrl : "";
}

/**
 * Get the counts of posts, followers, and following for a profile
 * @param {Object} profile The profile object
 * @returns {Object} An object containing the counts of posts, followers, and following
 */
function getCounts(profile) {
  const posts =
    profile?._count?.posts ??
    (Array.isArray(profile?.posts) ? profile.posts.length : 0);

  const followers =
    profile?._count?.followers ??
    (Array.isArray(profile?.followers) ? profile.followers.length : 0);

  const following =
    profile?._count?.following ??
    (Array.isArray(profile?.following) ? profile.following.length : 0);

  return { posts, followers, following };
}

/**
 * Check if the viewer is following the profile
 * @param {Object} profile The profile object
 * @param {string} viewerName The name of the viewer
 * @returns {boolean} True if the viewer is following the profile, false otherwise
 */
function isFollowing(profile, viewerName) {
  if (!viewerName) return false;
  if (!Array.isArray(profile?.followers)) return false;
  return profile.followers.some((f) => f?.name === viewerName);
}

/**
 * Render the posts for a profile
 * @param {HTMLElement} container The container element to render the posts into
 * @param {Array} posts The array of posts to render
 * @returns {void}
 */
function renderPosts(container, posts) {
  if (!Array.isArray(posts) || posts.length === 0) {
    container.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  container.innerHTML = posts
    .map((p) => {
      const title = p?.title ? safeText(p.title) : "Untitled";
      const body = p?.body ? safeText(p.body) : "";
      const created = p?.created ? new Date(p.created).toLocaleString() : "";

      return `
            <article class="post" data-id="${p.id}" >
                <h3>${title}</h3>
                ${body ? `<p>${body}</p>` : ""}
                <small>${escapeHtml(created)}</small>
            </article>
        `;
    })
    .join("");
}

/**
 * Optional helper to build media objects, ensuring URLs are valid
 * @param {string} url
 * @returns {{url:string, alt:string}|undefined} A media object or undefined if the URL is invalid
 */
function buildMedia(url) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return undefined;
  if (!isValidUrl(cleanUrl)) return undefined;
  return { url: cleanUrl, alt: "" };
}

/**
 * Renders the user's profile page, including their name, email, bio, and posts.
 * Fetches the profile data from the API and handles any errors that may occur.
 * @returns {Promise<void>} - A promise that resolves when the profile is rendered.
 */
export async function profileHandler() {
  const app = document.querySelector("#app");

  const nameParam = getHashQueryParam("name");
  const profileName = nameParam ? decodeURIComponent(nameParam) : null;
  const viewer = getUser();

  const pageTitle = profileName ? `${profileName}'s Profile` : "My Profile";

  app.innerHTML = `
    <section class="profile container">
    <header class="profile-page__header">
        <button id="back-to-feed" class="btn btn--icon" type="button">← Back</button>
        <h1>${safeText(pageTitle)}</h1>
    <button class="btn btn--danger" id="logout-btn">Logout</button>
    </header>
        <div id="profile-content">Loading profile...</div>
    </section>
`;

  document.querySelector("#back-to-feed").addEventListener("click", () => {
    const prev = getPreviousHash();
    if (prev && prev !== window.location.hash) {
      navigate(prev);
    } else {
      navigate("#/feed");
    }
  });

  document.querySelector("#logout-btn").addEventListener("click", () => {
    navigate("#/logout");
  });

  const profileContent = document.querySelector("#profile-content");

  let currentProfile = null;

  async function loadProfile() {
    currentProfile = profileName
      ? await getProfileByName(profileName)
      : await getMyProfile();
    return currentProfile;
  }

  async function loadPosts(profileName) {
    return getProfilePosts(profileName, { limit: 20, page: 1 });
  }

  function renderView(profile) {
    const isMe =
      !!viewer?.name &&
      profile?.name.toLowerCase() === viewer.name.toLowerCase();
    const showFollowButton = !!nameParam && !isMe;

    const avatarUrl = safeImg(profile?.avatar?.url);
    const bannerUrl = safeImg(profile?.banner?.url);

    const { posts, followers, following } = getCounts(profile);

    profileContent.innerHTML = `
      <header class="profile">
        ${bannerUrl ? `<div class="profile__banner"><img src="${bannerUrl}" alt="" /></div>` : ""}

        <div class="profile__top">
          <div class="profile__avatar">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="" />`
                : `<div class="profile__avatar-fallback" aria-hidden="true"></div>`
            }
          </div>

          <div class="profile__meta">
            <h2 class="profile__name">${safeText(profile?.name, "Unnamed User")}</h2>
            ${isMe && profile?.email ? `<p class="profile__email">${safeText(profile.email, "")}</p>` : ""}
          </div>

          <div class="profile__actions">
        ${isMe ? `<button id="edit-profile-btn" class="btn btn--secondary" type="button">Edit Profile</button>` : ""}
        ${showFollowButton ? `<button id="follow-btn" class="btn profile__follow-btn" type="button"></button>` : ""}
          </div>
        </div>
        ${
          profile?.bio
            ? `<p class="profile__bio">${safeText(profile.bio, "")}</p>`
            : `<p class="profile__bio profile__bio--empty">No bio yet.</p>`
        }

        <dl class="profile__stats" aria-label="Profile stats">
          <div class="profile__stat">
            <dt>Posts</dt><dd id="stat-posts">${posts}</dd>
          </div>
          <div class="profile__stat">
            <dt>Followers</dt><dd id="stat-followers">${followers}</dd>
          </div>
          <div class="profile__stat">
            <dt>Following</dt><dd id="stat-following">${following}</dd>
          </div>
        </dl>
      </header>

      <section class="profile-posts container">
        <h3 class="profile-posts__title">${isMe ? "My Posts" : "Posts"}</h3>
        ${isMe ? `<button class="btn btn--primary" id="create-post-btn" type="button">+ Create New Post</button>` : ""}
        <div id="profile-posts" class="profile-posts__list" aria-live="polite">
          Loading posts...
        </div>
      </section>
    `;

    const postsContainer = document.querySelector("#profile-posts");

    postsContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".post");
      if (!card) return;
      navigate(`#/post?id=${encodeURIComponent(card.dataset.id)}`);
    });

    loadPosts(profile.name)
      .then((posts) => renderPosts(postsContainer, posts))
      .catch((error) => {
        postsContainer.innerHTML = `<p class="profile-posts__error" role="alert">
            ${safeText(error?.message ?? "Failed to load posts. Please try again.")}
            </p>`;
      });

    const newPostBtn = document.querySelector("#create-post-btn");
    if (newPostBtn) {
      newPostBtn.addEventListener("click", () => {
        navigate("#/create");
      });
    }

    if (isMe) {
      const editBtn = document.querySelector("#edit-profile-btn");
      editBtn.addEventListener("click", () => renderEdit(currentProfile));
    }

    if (showFollowButton) {
      const btn = document.querySelector("#follow-btn");
      let followingState = isFollowing(profile, viewer?.name);

      function setBtn(state, disabled = false, label = null) {
        btn.textContent = label ?? (state ? "Unfollow" : "Follow");
        btn.disabled = disabled;
        btn.dataset.following = state ? "true" : "false";
      }

      setBtn(followingState);

      btn.addEventListener("click", async () => {
        const currentlyFollowing = btn.dataset.following === "true";
        setBtn(
          currentlyFollowing,
          true,
          currentlyFollowing ? "Unfollowing..." : "Following...",
        );

        try {
          if (currentlyFollowing) {
            await unfollowProfile(profile.name);
            followingState = false;
          } else {
            await followProfile(profile.name);
            followingState = true;
          }

          const refreshed = await getProfileByName(profile.name);
          currentProfile = refreshed;

          const updated = getCounts(refreshed);
          const postsEl = document.querySelector("#stat-posts");
          const followersEl = document.querySelector("#stat-followers");
          const followingEl = document.querySelector("#stat-following");

          if (postsEl) postsEl.textContent = String(updated.posts);
          if (followersEl) followersEl.textContent = String(updated.followers);
          if (followingEl) followingEl.textContent = String(updated.following);

          followingState =
            isFollowing(refreshed, viewer?.name) || followingState;
          setBtn(followingState, false);
        } catch (error) {
          setBtn(currentlyFollowing, false);
          alert(
            error?.message ||
              "Failed to update follow status. Please try again.",
          );
        }
      });
    }
  }

  function renderEdit(profile) {
    const isMe = !!viewer?.name && profile?.name === viewer.name;
    if (!isMe) return renderView(profile);

    function safeValue(value, fallback = "") {
      if (value === null || value === undefined) return fallback;
      return String(value);
    }

    const bioValue = safeValue(profile?.bio, "");
    const avatarUrlValue = safeValue(profile?.avatar?.url, "");
    const bannerUrlValue = safeValue(profile?.banner?.url, "");

    profileContent.innerHTML = `
    <div class="profile-edit">
      <h2 class="profile-edit__title">Edit Profile</h2>

      <form id="profile-edit-form" class="form">
      <label>Bio<textarea id="edit-bio" name="bio" rows="4" maxlength="160" placeholder="Write a short bio (max 160 characters)...">${bioValue}</textarea></label>
 
      
          <fieldset class="profile-edit__fieldset">
            <legend>Banner</legend>
            <label>
              Banner URL
              <input id="edit-banner-url" type="url" value="${bannerUrlValue}" placeholder="https://..." />
            </label>
          </fieldset>
          <fieldset class="profile-edit__fieldset">
            <legend>Avatar</legend>
            <label>
              Avatar URL
              <input id="edit-avatar-url" type="url" value="${avatarUrlValue}" placeholder="https://..." />
            </label>
          </fieldset>

          <p id="profile-edit-error" class="api-error" role="alert"></p>

          <div class="profile-edit__actions">
            <button id="profile-save-btn" class="btn btn--primary" type="submit">Save</button>
            <button id="profile-cancel-btn" class="btn btn--danger" type="button">Cancel</button>
          </div>
        </form>
      </div>
    `;

    const form = document.querySelector("#profile-edit-form");
    const cancelBtn = document.querySelector("#profile-cancel-btn");
    const saveBtn = document.querySelector("#profile-save-btn");
    const errorEl = document.querySelector("#profile-edit-error");

    cancelBtn.addEventListener("click", () => {
      renderView(currentProfile);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.textContent = "";

      const bio = document.querySelector("#edit-bio").value.trim();
      const bannerUrl = document.querySelector("#edit-banner-url").value.trim();
      const avatarUrl = document.querySelector("#edit-avatar-url").value.trim();

      const payload = {
        bio: bio || "",
      };

      const avatar = buildMedia(avatarUrl);
      const banner = buildMedia(bannerUrl);

      if (avatar) payload.avatar = avatar;
      if (banner) payload.banner = banner;

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";

      try {
        await updateProfile(profile.name, payload);
        currentProfile = await loadProfile();
        renderView(currentProfile);
      } catch (error) {
        errorEl.textContent =
          error?.message || "Failed to update profile. Please try again.";
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
      }
    });
  }

  try {
    await loadProfile(); // Refresh profile to get latest data and version
    renderView(currentProfile);
  } catch (error) {
    profileContent.innerHTML = `<p class="profile-error" role="alert">
        ${safeText(error?.message ?? "Failed to load profile. Please try again.")}
        </p>`;
  }
}
