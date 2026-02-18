import { getAllPosts } from "../api/posts";
import { navigate } from "../router.js";

/**
 * Render the feed view with all posts
 * @returns
 */
export async function feedHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Feed</h1>
        <button id="create-post-btn">+ Create New Post</button>
        <div id ="feed-content">Loading posts...</div>
    </section>
`;

  const feedContent = document.querySelector("#feed-content");
  const createPostBtn = document.getElementById("create-post-btn");

  createPostBtn.addEventListener("click", () => {
    navigate("#/create");
  });

  feedContent.addEventListener("click", (e) => {
    const card = e.target.closest(".post");
    if (!card) return;

    const id = card.dataset.id;
    navigate(`#/post?id=${id}`);
  });

  try {
    const posts = await getAllPosts();

    if (!posts.length) {
      feedContent.innerHTML = "<p>No posts available.</p>";
      return;
    }

    feedContent.innerHTML = posts
      .map(
        (post) => `
        <article class="post" data-id="${post.id}" style="cursor: pointer;">
        <h3>${post.title ?? "Untitled"}</h3>
        <p>${post.author?.name ?? "Unknown Author"}</p>
        <p>${post.body ?? ""}</p>
        <small>${post.created ? new Date(post.created).toLocaleString() : ""}</small>
        </article>
    `,
      )
      .join("");
  } catch (error) {
    feedContent.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}</p>`;
  }
}
