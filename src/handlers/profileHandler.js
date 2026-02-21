import { navigate } from "../router.js";
import {
  getMyProfile,
  getProfileByName,
  getProfilePosts,
  followProfile,
  unfollowProfile,
} from "../api/profiles.js";
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
  return url && typeof url === "string" ? url : "";
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
                <small>${safeText(created)}</small>
            </article>
        `;
    })
    .join("");
}

/**
 * Renders the user's profile page, including their name, email, bio, and posts.
 * Fetches the profile data from the API and handles any errors that may occur.
 * @returns {Promise<void>} - A promise that resolves when the profile is rendered.
 */
export async function profileHandler() {
  const app = document.querySelector("#app");

  const nameParam = getHashQueryParam("name");
  const viewer = getUser();

  const pageTitle = nameParam ? "Profile" : "My Profile";

  app.innerHTML = `
    <section>
        <button id="back-to-feed" class="btn btn--ghost">← Back</button>
        <h1>${pageTitle}</h1>
        <div id="profile-content">Loading profile...</div>
    </section>
`;

  document.querySelector("#back-to-feed").addEventListener("click", () => {
    navigate("#/feed");
  });

  const profileContent = document.querySelector("#profile-content");

  try {
    const profile = nameParam
      ? await getProfileByName(nameParam)
      : await getMyProfile();

    const isMe = !!viewer?.name && profile?.name === viewer.name;
    const showFollowButton = !!nameParam && !isMe;

    const avatarUrl = safeImg(profile?.avatar?.url);
    const avatarAlt = safeText(
      profile?.avatar?.alt ?? `${profile?.name ?? "User"}'s avatar`,
    );
    const bannerUrl = safeImg(profile?.banner?.url);

    const { posts, followers, following } = getCounts(profile);

    profileContent.innerHTML = `
      <header class="profile">
        ${bannerUrl ? `<div class="profile__banner"><img src="${bannerUrl}" alt="" /></div>` : ""}

        <div class="profile__top">
          <div class="profile__avatar">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="${avatarAlt}" />`
                : `<div class="profile__avatar-fallback" aria-hidden="true"></div>`
            }
          </div>

          <div class="profile__meta">
            <h2 class="profile__name">${safeText(profile?.name, "Unnamed User")}</h2>
            ${isMe && profile?.email ? `<p class="profile__email">${safeText(profile.email, "")}</p>` : ""}
          </div>

          ${
            showFollowButton
              ? `<div class="profile__actions">
                   <button id="follow-btn" class="btn profile__follow-btn" type="button">...</button>
                 </div>`
              : ""
          }
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

      <section class="profile-posts">
        <h3 class="profile-posts__title">${isMe ? "My Posts" : "Posts"}</h3>
        <div id="profile-posts" class="profile-posts__list" aria-live="polite">
          Loading posts...
        </div>
      </section>
    `;

    const postsContainer = document.querySelector("#profile-posts");
    const profilePosts = await getProfilePosts(profile.name, {
      limit: 20,
      page: 1,
    });

    renderPosts(postsContainer, profilePosts);

    postsContainer.addEventListener("click", (e) => {
      const card = e.target.closest(".post");
      if (!card) return;
      navigate(`#/post?id=${encodeURIComponent(card.dataset.id)}`);
    });

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

          setBtn(followingState, false);

          const refreshed = await getProfileByName(profile.name);
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
  } catch (error) {
    profileContent.innerHTML = `<p class="profile-posts__error" role="alert">
      ${safeText(error?.message ?? "Failed to load profile. Please try again.")}
      </p>`;
  }
}
