import { getAllPosts, deletePost } from "../api/posts";
import { navigate } from "../router.js";
import { getUser } from "../utils/storage.js";
import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * Render the feed view with all posts
 * @returns
 */
export async function feedHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section class="container py-4">
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <header class="mb-4 text-center"> 
            <h1 aria-label="Feed" class="h2 fw-semibold mb-2" >Feed</h1>
            <p class="text-muted mb-0"> Browse posts from the community</p>
          </header>

          <div class ="card shadow-sm border-0 mb-4">
            <div class="card-body p-3 p-md-4">
              <div class="row g-3 align-items-end">
                <div class="col-12">
                  <label for="feed-search-input" class="form-label fw-medium">Search</label>
                  <input 
                  id="feed-search-input" 
                  class="form-control" 
                  type="search" placeholder="Search posts by title or author..." 
                  autoComplete="off"/>
                </div>

                <div class="col-12">
                  <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-secondary" id="my-profile-btn" type="button">
                      My Profile
                    </button>
                    <button class="btn btn-primary" id="create-post-btn" type="button">
                      + Create New Post
                    </button>
                    <button class="btn btn-outline-secondary btn-outline-secondary-dark-text" id="logout-btn" type="button">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
        <div id="feed-content" class="mt-4" aria-live="polite">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5 text-center text-muted">
              Loading posts...
            </div>
          </div>  
        </div>
      </div>
    </div>
  </section>
`;
  const feedContent = document.querySelector("#feed-content");
  const searchInput = document.querySelector("#feed-search-input");
  // const searchClearBtn = document.querySelector("#feed-search-clear");

  document.getElementById("my-profile-btn").addEventListener("click", () => {
    navigate("#/profile");
  });

  document.getElementById("create-post-btn").addEventListener("click", () => {
    navigate("#/create");
  });

  document.getElementById("logout-btn").addEventListener("click", () => {
    navigate("#/logout");
  });

  let allPosts = [];

  /**
   * Normalize a string for case-insensitive search
   * @param {string} str The string to normalize
   * @returns {string} The normalized string
   */
  function normalizeString(str) {
    return String(str || "")
      .toLowerCase()
      .trim();
  }

  /**
   * Check if a post matches the search query
   * @param {Object} post The post object
   * @param {string} query The search query
   * @returns {boolean} True if the post matches the query, false otherwise
   */
  function matchesSearch(post, query) {
    if (!query) return true;

    const title = normalizeString(post.title);
    const author = normalizeString(post.author?.name);
    const body = normalizeString(post.body);

    return (
      title.includes(query) || author.includes(query) || body.includes(query)
    );
  }

  /**
   * Render the posts in the feed
   * @param {Array} posts The array of post objects
   * @returns {void}
   */
  function renderPosts(posts, queryText = "") {
    if (!Array.isArray(posts) || posts.length === 0) {
      if (queryText) {
        feedContent.innerHTML = `<div class="alert alert-warning" role="alert">No posts found matching "<strong>${escapeHtml(
          queryText,
        )}</strong>".</div>`;
      } else {
        feedContent.innerHTML =
          '<div class="alert alert-warning" role="alert">No posts found.</div>';
      }
      return;
    }

    const currentUser = getUser();

    feedContent.innerHTML = posts
      .map((post) => {
        const isAuthor = post.author?.name === currentUser?.name;

        const title = post.title ? escapeHtml(post.title) : "Untitled";
        const authorRaw = post.author?.name ?? "";
        const authorName = authorRaw ? escapeHtml(authorRaw) : "Unknown Author";
        const body = post.body ? escapeHtml(post.body) : "";
        const created = post.created
          ? new Date(post.created).toLocaleString()
          : "";

        return `
        <article class="card shadow-sm mb-4 border-0 feed-post" data-id="${post.id}" tabindex="0" role="link" aria-label="Open post: ${title} by ${authorName}">
          <div class="card-body p-4 p-md-5">
            <h3 class="h4 card-title mb-0">${title}</h3>

            <div class="d-flex flex-wrap align-items-center gap-2 text-muted small mb-2">
              <button 
                type="button" 
                class="btn btn-link p-0 text-start text-decoration-none feed-post__author" 
                data-profile="${authorRaw}"
                aria-label="View profile: ${authorName}"
                role="link"
                >
                ${authorName}
              </button>
              <span>•</span>
              <span>${escapeHtml(created)}</span>
            </div>

            ${body ? `<p class="card-text mb-3">${body}</p>` : ""}

            ${
              isAuthor
                ? `
              <div class="d-flex gap-2">
                <button class="btn btn-outline-danger btn-sm" data-action="delete" type="button">
                  Delete
                </button>
                <button class="btn btn-secondary btn-sm" data-action="edit" type="button">
                  Edit
                </button>
              </div>
            `
                : ""
            }
          </div>
      </article>
    `;
      })
      .join("");
  }

  /**
   * Apply the search filter to the posts and re-render the feed
   * @returns {void}
   */
  function applySearch() {
    const rawQuery = searchInput.value.trim();
    const query = normalizeString(rawQuery);
    const filteredPosts = allPosts.filter((post) => matchesSearch(post, query));
    renderPosts(filteredPosts, rawQuery);
  }

  feedContent.addEventListener("click", async (e) => {
    // Profile click
    const profileBtn = e.target.closest(`[data-profile]`);
    if (profileBtn) {
      e.stopPropagation();
      const name = profileBtn.dataset.profile;
      if (name) {
        navigate(`#/profile?name=${encodeURIComponent(name)}`);
      }
      return;
    }

    // Delete button click
    const deleteBtn = e.target.closest(`[data-action="delete"]`);
    if (deleteBtn) {
      e.stopPropagation();

      const card = e.target.closest("[data-id]");
      const id = card?.dataset.id;
      if (!id) return;

      const ok = window.confirm("Are you sure you want to delete this post?");
      if (!ok) return;

      try {
        await deletePost(id);
        feedHandler();
      } catch (error) {
        alert(error.message);
      }
      return;
    }

    // Edit button click
    const editBtn = e.target.closest(`[data-action="edit"]`);
    if (editBtn) {
      e.stopPropagation();

      const card = e.target.closest("[data-id]");
      const id = card?.dataset.id;
      if (!id) return;

      navigate(`#/post?id=${id}&edit=true`);
      return;
    }

    // Post card click
    const card = e.target.closest("[data-id]");
    if (!card) return;

    navigate(`#/post?id=${card.dataset.id}`);
  });

  feedContent.addEventListener("keydown", (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;

    if (e.target !== card) return;

    if (e.key === "Enter") {
      navigate(`#/post?id=${card.dataset.id}`);
    }
  });

  searchInput.addEventListener("input", applySearch);

  // searchClearBtn.addEventListener("click", () => {
  //   searchInput.value = "";
  //   renderPosts(allPosts, "");
  //   searchInput.focus();
  // });

  try {
    const posts = await getAllPosts();
    allPosts = Array.isArray(posts) ? posts : [];
    renderPosts(allPosts);
  } catch (error) {
    feedContent.innerHTML = `
      <div class="card shadow-sm border-0">
        <div class="card-body p-4 p-md-5">
          <div class="alert alert-danger" mb-0 role="alert">
            Error loading posts: ${escapeHtml(error.message ?? "Unknown error")}
          </div>
        </div>
      </div>
    `;
  }
}
