import { navigate } from "../router.js";
import { createPost } from "../api/posts.js";

export function createPostHandler() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <section class="create-post">
      <h2>Create New Post</h2>
      <form id="create-post-form">
        <input type="text" id="post-title" placeholder="Title" required />
        <textarea id="post-body" rows="5" placeholder="What's on your mind?" required></textarea>
        <p id="error-message" style="color: red;"></p>
        <button type="submit" id="submit-post">Publish</button>
        <button type="button" id="cancel-post">Cancel</button>
      </form>
    </section>
  `;

  const form = document.getElementById("create-post-form");
  const titleInput = document.getElementById("post-title");
  const bodyInput = document.getElementById("post-body");
  const errorMessage = document.getElementById("error-message");
  const submitBtn = document.getElementById("submit-post");

  document.querySelector("#cancel-post").addEventListener("click", () => {
    navigate("#/feed");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (title.length < 1) {
      errorMessage.textContent = "Title cannot be empty.";
      return;
    }

    if (body.length < 1) {
      errorMessage.textContent = "Post cannot be empty.";

      return;
    }
    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing...";

    try {
      await createPost({ title, body });
      navigate("#/feed");
    } catch (error) {
      errorMessage.textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish";
    }
  });
}
