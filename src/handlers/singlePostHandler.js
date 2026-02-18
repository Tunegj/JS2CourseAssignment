import { navigate } from "../router.js";
import { getPostById } from "../api/posts.js";

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

  try {
    const post = await getPostById(postId);

    postContent.innerHTML = `
    <article class="post">
        <h3>${post.author?.name ?? "Unknown Author"}</h3>
        <small>${post.created ? new Date(post.created).toLocaleString() : ""}</small>
        <p>${post.body ?? ""}</p>
    </article>
    `;
  } catch (error) {
    postContent.innerHTML = `<p style="color: red;">Error loading post: ${error.message}</p>`;
  }
}
