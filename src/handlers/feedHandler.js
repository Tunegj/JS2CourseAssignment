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
      </header>
      <div id ="feed-content">Loading posts...</div>
    </section>
`;

  document.getElementById("my-profile-btn").addEventListener("click", () => {
    navigate("#/profile");
  });

  document.getElementById("create-post-btn").addEventListener("click", () => {
    navigate("#/create");
  });

  const feedContent = document.querySelector("#feed-content");

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

  try {
    const posts = await getAllPosts();

    if (!Array.isArray(posts) || posts.length === 0) {
      feedContent.innerHTML = "<p>No posts found.</p>";
      return;
    }

    const currentUser = getUser();

    // If the current user is the author of a post, add a delete button

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
        <article class="post" data-id="${post.id}" style="cursor: pointer;">
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
  } catch (error) {
    feedContent.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}</p>`;
  }
}
