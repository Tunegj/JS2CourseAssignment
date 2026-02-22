import { navigate, getPreviousHash } from "../router.js";
import { getPostById, deletePost, updatePost } from "../api/posts.js";
import { getUser } from "../utils/storage.js";
import { getHashQueryParam } from "../utils/queryParams.js";
import { escapeHtml } from "../utils/escapeHtml.js";

/**
 * Render the single post view
 * @param {string} postId
 */
export async function singlePostHandler(postId) {
  const app = document.querySelector("#app");

  const openInEditMode = getHashQueryParam("edit") === "true";

  app.innerHTML = `
    <section class="post container">
      <button id="back-to-feed" class="btn btn--icon" type="button">← Back</button>
      <h1 id="post-heading">Post</h1>
      <div id="post-content">Loading post...</div>
    </section>
`;

  document.querySelector("#back-to-feed").addEventListener("click", () => {
    const prev = getPreviousHash();
    if (prev && prev !== window.location.hash) {
      navigate(prev);
    } else {
      navigate("#/feed");
    }
  });

  const postHeading = document.querySelector("#post-heading");
  const postContent = document.querySelector("#post-content");

  let post = null;
  let isOwner = false;
  let isEditing = false;

  /**
   * Render the post content based on the current state (viewing or editing)
   * @returns {void}
   */
  function render() {
    if (!post) return;

    const authorNameRaw = post.author?.name ?? "";
    const authorName = authorNameRaw
      ? escapeHtml(authorNameRaw)
      : "Unknown Author";

    postHeading.textContent = authorNameRaw
      ? `Showing ${authorNameRaw}'s Post`
      : "Post";

    if (isEditing) {
      postContent.innerHTML = `
          <form id="edit-post-form">
          <label>Title:
          <input type="text" id="edit-title" value="${post.title ? escapeHtml(post.title) : ""}" required />
          </label>
          <label>Body:
          <textarea id="edit-body" rows="6">${post.body ? escapeHtml(post.body) : ""}</textarea>
          </label>
          <p id="error-message" class="form-error" role="alert"></p>
          <button type="submit" class="btn btn--primary" id="save-btn">Save</button>
          <button type="button" class="btn btn--danger" id="cancel-btn">Cancel</button>
          </form>
        `;
      return;
    }

    const title = post.title ? escapeHtml(post.title) : "Untitled";
    const body = post.body ? escapeHtml(post.body) : "";
    const created = post.created ? new Date(post.created).toLocaleString() : "";

    postContent.innerHTML = `
    <article class="post" data-id="${post.id}">
        <h3>${title}</h3>
        <p><strong> By:</strong>
        <button type="button" class="post__author" data-profile="${encodeURIComponent(authorNameRaw)}">${authorName}</button>
        </p>
        <small>${escapeHtml(created)}</small>
        ${body ? `<p>${body}</p>` : ""}
        ${
          isOwner
            ? `
          <button class="btn btn--danger" data-action="delete">Delete</button>
          <button class="btn btn--primary" data-action="edit">Edit</button>`
            : ""
        }
    </article>
    `;
  }

  postContent.addEventListener("click", async (e) => {
    const profileBtn = e.target.closest("[data-profile]");
    if (profileBtn) {
      e.stopPropagation();

      const name = decodeURIComponent(profileBtn.dataset.profile);

      if (name) {
        navigate(`#/profile?name=${encodeURIComponent(name)}`);
      }
      return;
    }

    const deleteBtn = e.target.closest(`[data-action="delete"]`);
    const editBtn = e.target.closest(`[data-action="edit"]`);
    const cancelBtn = e.target.closest("#cancel-btn");

    if (editBtn) {
      if (!isOwner) return;
      isEditing = true;
      render();
      return;
    }

    if (cancelBtn) {
      isEditing = false;
      render();
      return;
    }

    if (deleteBtn) {
      const ok = window.confirm("Are you sure you want to delete this post?");
      if (!ok) return;

      try {
        await deletePost(postId);
        navigate("#/feed");
      } catch (error) {
        alert(error.message);
      }
    }
  });

  postContent.addEventListener("submit", async (e) => {
    if (e.target.id !== "edit-post-form") return;
    e.preventDefault();

    const title = document.querySelector("#edit-title").value.trim();
    const body = document.querySelector("#edit-body").value.trim();
    const errorMessage = document.querySelector("#error-message");
    const saveBtn = document.querySelector("#save-btn");

    errorMessage.textContent = "";

    if (!title) {
      errorMessage.textContent = "Title cannot be empty.";
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      const payload = { title, body };
      const updated = await updatePost(postId, payload);

      post = { ...post, ...updated };

      isEditing = false;
      render();
    } catch (error) {
      errorMessage.textContent = error.message;
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  });

  try {
    post = await getPostById(postId);

    const currentUser = getUser();
    isOwner = post.author?.name === currentUser?.name;

    isEditing = Boolean(isOwner && openInEditMode);

    render();
  } catch (error) {
    postContent.innerHTML = `<p class="single-post-error" role="alert">${escapeHtml(`Error loading post: ${error.message}`)}</p>`;
  }
}
