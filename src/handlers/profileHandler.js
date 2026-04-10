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
    container.innerHTML = '<div class="alert alert-info">No posts yet.</div>';
    return;
  }

  container.innerHTML = posts
    .map((p) => {
      const title = p?.title ? safeText(p.title) : "Untitled";
      const body = p?.body ? safeText(p.body) : "";
      const created = p?.created ? new Date(p.created).toLocaleString() : "";

      return `
            <article class="card shadow-sm mb-3" data-id="${p.id}" >
              <div class="card-body">
                <h3 class="h5 card-title mb-2">${title}</h3>
                ${body ? `<p class="card-text">${body}</p>` : ""}
                <small class="text-muted d-block">${escapeHtml(created)}</small>
              </div>
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
    <section class="container py-4">
    <header class="d-flex justify-content-between align-items-center gap-3 mb-4 flex-wrap">
        <button id="back-to-feed" class="btn btn-outline-secondary" type="button">← Back</button>

        <h1 class="h2 mb-0">${safeText(pageTitle)}</h1>

    <button class="btn btn-danger" id="logout-btn">Logout</button>
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
      <div class="card shadow-sm border-0 mb-4">
        <div class="card-body p-4">

          ${
            bannerUrl
              ? `<div class="mb-4 profile__banner">
            <img src="${bannerUrl}" alt="" class="img-fluid rounded w-100" />
            </div>`
              : ""
          }

        <div class="d-flex flex-column flex-md-row align-items-md-center gap-3 mb-4">
          <div class="profile__avatar">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="" class="rounded-circle" style="width: 84px; height: 84px; object-fit: cover;" />`
                : `<div class="rounded-circle bg-secondary-subtle" style="width: 84px; height: 84px;" aria-hidden="true"></div>`
            }
          </div>

          <div class="flex-grow-1">
            <h2 class="h4 mb-1">${safeText(profile?.name, "Unnamed User")}</h2>
            ${
              isMe && profile?.email
                ? `<p class="text-muted mb-0">${safeText(profile.email, "")}</p>`
                : ""
            }
          </div>

          <div class="d-flex gap-2 flex-wrap">
            ${
              isMe
                ? `<button id="edit-profile-btn" class="btn btn-secondary" type="button">
                  Edit Profile
                </button>`
                : ""
            }
        ${
          showFollowButton
            ? `<button id="follow-btn" class="btn btn-primary" type="button"></button>`
            : ""
        }
          </div>
        </div>

        ${
          profile?.bio
            ? `<p class="mb-4">${safeText(profile.bio, "")}</p>`
            : `<p class="text-muted mb-4">No bio yet.</p>`
        }

        <div class="d-flex gap-4 flex-wrap" aria-label="Profile stats">
          <div>
            <div class="fw-semibold">Posts</div>
            <div id="stat-posts">${posts}</div>
          </div>
          <div>
            <div class="fw-semibold">Followers</div>
            <div id="stat-followers">${followers}</div>
          </div>
          <div>
            <div class="fw-semibold">Following</div>
            <div id="stat-following">${following}</div>
          </div>
        </div>

      </div>

      <section>
        <div class="d-flex justify-content-between align-items-center gap-3 mb-3 flex-wrap">
          <h3 class="h4 mb-0">${isMe ? "My Posts" : "Posts"}</h3>
        ${
          isMe
            ? `<button class="btn btn-primary" id="create-post-btn" type="button">
          + Create New Post
          </button>`
            : ""
        }
        </div>

        <div id="profile-posts" class="profile-posts__list" aria-live="polite">
          Loading posts...
        </div>
      </section>
    `;

    const postsContainer = document.querySelector("#profile-posts");

    postsContainer.addEventListener("click", (e) => {
      const card = e.target.closest("[data-id]");
      if (!card) return;
      navigate(`#/post?id=${encodeURIComponent(card.dataset.id)}`);
    });

    loadPosts(profile.name)
      .then((posts) => renderPosts(postsContainer, posts))
      .catch((error) => {
        postsContainer.innerHTML = `<div class="alert alert-danger role="alert">
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
    <div class="card shadow-sm border-0">
      <div class="card-body p-4">
        <h2 class="h3 mb-4">Edit Profile</h2>

        <form id="profile-edit-form" novalidate>
          <div class="mb-3">
            <label for="edit-bio" class="form-label">Bio</label>
            <textarea 
            id="edit-bio" 
            name="bio" 
            class="form-control" 
            rows="4" 
            maxlength="160" 
            placeholder="Write a short bio (max 160 characters)..."
            >${bioValue}</textarea>
          </div>
      
          <div class="mb-3">
            <label for="edit-banner-url" class="form-label">Banner URL</label>
            <input 
              id="edit-banner-url" 
              type="url"
              class="form-control" 
              value="${bannerUrlValue}" 
              placeholder="https://..." 
              />
          </div>
          
          <div class="mb-3">
            <label for="edit-avatar-url" class="form-label">Avatar URL</label>
            <input 
            id="edit-avatar-url" 
            type="url" 
            class="form-control"
            value="${avatarUrlValue}" 
            placeholder="https://..." 
            />
          </div>

          <div 
          id="profile-edit-error" 
          class="alert alert-danger d-none" 
          role="alert"
          ></div>

          <div class="d-flex gap-2 flex-wrap">
            <button id="profile-save-btn" class="btn btn-primary" type="submit">Save</button>
            <button id="profile-cancel-btn" class="btn btn-outline-secondary" type="button">Cancel</button>
          </div>
        </form>
      </div>
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
      errorEl.classList.add("d-none");

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
        errorEl.classList.remove("d-none");
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
    profileContent.innerHTML = `<div class="alert alert-danger" role="alert">
        ${safeText(error?.message ?? "Failed to load profile. Please try again.")}
        </div>`;
  }
}
