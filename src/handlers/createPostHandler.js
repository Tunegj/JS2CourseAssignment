import { navigate } from "../router.js";
import { createPost } from "../api/posts.js";
import { setFieldError, clearFieldErrors } from "../utils/formErrors.js";

/**
 * Renders the Create Post form and handles its submission.
 * Validates the title field and displays errors if necessary.
 * On successful creation, navigates back to the feed.
 * @param {Event} event - The form submission event.
 * @returns {void}
 * @throws {Error} If the API call fails, an error message is displayed to the user.
 *
 */
export function createPostHandler() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <section class="create-post container">
      <h2>Create New Post</h2>

      <form id="create-post-form" novalidate>
      <label for="post-title">Title</label>
        <input type="text" id="post-title" placeholder="Title"/>
       <p id="post-title-error" class= "field-error"></p>

       <label for="post-body">Content</label>
        <textarea id="post-body" rows="5" placeholder="What's on your mind?"></textarea>
        <p id="post-body-error" class="field-error"></p>

        <p id="api-error" class="api-error" role="alert"></p>

        <button type="submit" class="btn btn--primary" id="submit-post">Publish</button>
        <button type="button" class="btn btn--danger" id="cancel-post">Cancel</button>
      </form>
    </section>
  `;

  const form = document.getElementById("create-post-form");
  const titleInput = document.getElementById("post-title");
  const bodyInput = document.getElementById("post-body");
  const apiError = document.getElementById("api-error");
  const submitBtn = document.getElementById("submit-post");

  document.querySelector("#cancel-post").addEventListener("click", () => {
    navigate("#/feed");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldErrors(["post-title"]);
    apiError.textContent = "";

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    let hasError = false;

    if (!title) {
      setFieldError("post-title", "Title cannot be empty.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing...";

    try {
      const payload = { title };
      if (body) payload.body = body;

      await createPost(payload);
      navigate("#/feed");
    } catch (error) {
      apiError.textContent =
        error.message ?? "Failed to create post. Please try again.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Publish";
    }
  });
}
