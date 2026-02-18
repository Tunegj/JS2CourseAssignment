import { getAllPosts } from "../api/posts";

export async function feedHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Feed</h1>
        <div id ="feed-content">Loading posts...</div>
    </section>
`;

  const feedContent = document.querySelector("#feed-content");

  try {
    const posts = await getAllPosts();

    if (!posts.length) {
      feedContent.innerHTML = "<p>No posts available.</p>";
      return;
    }

    feedContent.innerHTML = posts
      .map(
        (post) => `
        <article class="post">
        <h3>${post.author.name}</h3>
        <p>${post.body}</p>
        </article>
    `,
      )
      .join("");
  } catch (error) {
    feedContent.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}</p>`;
  }
}
