import { navigate } from "../router.js";
import { getPostById, deletePost } from "../api/posts.js";
import { getUser } from "../utils/storage.js";

/**
 * Render the single post view
 * @param {string} postId
 */
export async function singlePostHandler(postId) {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
    <button id="back-to-feed">← Back</button>
    <h1>Post</h1>
    <div id="post-content">Loading post...</div>
    </section>
`;

  document.querySelector("#back-to-feed").addEventListener("click", () => {
    navigate("#/feed");
  });

  const postContent = document.querySelector("#post-content");

  postContent.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(`[data-action="delete"]`);
    if (!deleteBtn) return;

    const ok = window.confirm("Are you sure you want to delete this post?");
    if (!ok) return;

    try {
      await deletePost(postId);
      navigate("#/feed");
    } catch (error) {
      alert(error.message);
    }
  });

  try {
    const post = await getPostById(postId);
    const currentUser = getUser();
    const isOwner = post.author?.name === currentUser?.name;

    postContent.innerHTML = `
    <article class="post">
        <h3>${post.author?.name ?? "Unknown Author"}</h3>
        <small>${post.created ? new Date(post.created).toLocaleString() : ""}</small>
        <p>${post.body ?? ""}</p>
        ${isOwner ? `<button class="delete-post-btn" data-action="delete">Delete</button>` : ""}
    </article>
    `;
  } catch (error) {
    postContent.innerHTML = `<p style="color: red;">Error loading post: ${error.message}</p>`;
  }
}
