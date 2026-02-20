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
    <section>
      <header class="feed-header"> 
         <h1>Feed</h1>
      <div class="feed-actions">
        <button id="my-profile-btn">My Profile</button>
        <button id="create-post-btn">+ Create New Post</button>
      </div>
      <div class ="feed-search">
        <label class="feed-search__label" for="feed-search-input">Search:</label>
        <input id="feed-search-input" class="feed-search__input" type="search" placeholder="Search posts by title or author..." autoComplete="off"/>
        <button id="feed-search-clear" class="feed-search__clear" type="button">Clear</button>
      </div>
      </header>
      <div id ="feed-content" aria-live="polite">Loading posts...</div>
    </section>
`;
  const feedContent = document.querySelector("#feed-content");
  const searchInput = document.querySelector("#feed-search-input");
  const searchClearBtn = document.querySelector("#feed-search-clear");

  document.getElementById("my-profile-btn").addEventListener("click", () => {
    navigate("#/profile");
  });

  document.getElementById("create-post-btn").addEventListener("click", () => {
    navigate("#/create");
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
        feedContent.innerHTML = `<p>No posts found matching "<strong>${escapeHtml(
          queryText,
        )}</strong>".</p>`;
      } else {
        feedContent.innerHTML = "<p>No posts found.</p>";
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
        <article class="post" data-id="${post.id}">
        <h3>${title}</h3>
        
        <button type="button" class="post__author" data-profile="${authorRaw}">${authorName}</button>
       ${body ? `<p>${body}</p>` : ""}
        <small>${escapeHtml(created)}</small>
        ${isAuthor ? `<button data-action="delete">Delete</button>` : ""}
        ${isAuthor ? `<button data-action="edit">Edit</button>` : ""}
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

      const card = e.target.closest(".post");
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

      const card = e.target.closest(".post");
      const id = card?.dataset.id;
      if (!id) return;

      navigate(`#/post?id=${id}&edit=true`);
      return;
    }

    // Post card click
    const card = e.target.closest(".post");
    if (!card) return;

    navigate(`#/post?id=${card.dataset.id}`);
  });

  searchInput.addEventListener("input", applySearch);

  searchClearBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderPosts(allPosts, "");
    searchInput.focus();
  });

  try {
    const posts = await getAllPosts();
    allPosts = Array.isArray(posts) ? posts : [];
    renderPosts(allPosts);
  } catch (error) {
    feedContent.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}</p>`;
  }
}
