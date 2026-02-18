import { getAllPosts, deletePost } from "../api/posts";
import { navigate } from "../router.js";
import { getUser } from "../utils/storage.js";

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

  const feedContent = document.querySelector("#feed-content");
  const createPostBtn = document.getElementById("create-post-btn");

  createPostBtn.addEventListener("click", () => {
    navigate("#/create");
  });

  feedContent.addEventListener("click", async (e) => {
    const card = e.target.closest(".post");
    if (!card) return;

    const id = card.dataset.id;

    const deleteBtn = e.target.closest(`[data-action="delete"]`);
    if (deleteBtn) {
      e.stopPropagation();

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

    const editBtn = e.target.closest(`[data-action="edit"]`);
    if (editBtn) {
      e.stopPropagation();
      navigate(`#/post?id=${id}&edit=true`);
      return;
    }

    navigate(`#/post?id=${id}`);
  });

  try {
    const posts = await getAllPosts();

    if (!posts.length) {
      feedContent.innerHTML = "<p>No posts available.</p>";
      return;
    }

    const currentUser = getUser();

    // If the current user is the author of a post, add a delete button

    feedContent.innerHTML = posts
      .map((post) => {
        const isAuthor = post.author?.name === currentUser?.name;

        return `
        <article class="post" data-id="${post.id}" style="cursor: pointer;">
        <h3>${post.title ?? "Untitled"}</h3>
        <p>${post.author?.name ?? "Unknown Author"}</p>
        <p>${post.body ?? ""}</p>
        <small>${post.created ? new Date(post.created).toLocaleString() : ""}</small>
        ${isAuthor ? `<button class="delete-post-btn" data-action="delete">Delete</button>` : ""}
        ${isAuthor ? `<button class="edit-post-btn" data-action="edit">Edit</button>` : ""}
        </article>
    `;
      })
      .join("");
  } catch (error) {
    feedContent.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}</p>`;
  }
}
