import { navigate } from "../router.js";
import { getMyProfile } from "../api/profiles.js";

export async function profileHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <button id="back-to-feed">← Back</button>
        <h1>My Profile</h1>
        <div id="profile-content">Loading profile...</div>
    </section>
`;

  document.querySelector("#back-to-feed").addEventListener("click", () => {
    navigate("#/feed");
  });

  const profileContent = document.querySelector("#profile-content");

  try {
    const profile = await getMyProfile();

    const avatarUrl = profile.avatar?.url;
    const avatarAlt = profile.avatar?.alt ?? "";

    profileContent.innerHTML = `
   
        <div>
            <h2 style="margin: 0;">${profile.name ?? "Unnamed User"}</h2>
            <p style="margin: 0; color: #666;">${profile.email ?? ""}</p>
        </div>
    </div>

    ${profile.bio ? `<p style="margin-top: 1rem;">${profile.bio}</p>` : ""}

    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
        <span><strong>Posts:</strong> ${profile._count?.posts ?? profile.posts?.length ?? 0}</span>
        <span><strong>Followers:</strong> ${profile._count?.followers ?? profile.followers?.length ?? 0}</span>
        <span><strong>Following:</strong> ${profile._count?.following ?? profile.following?.length ?? 0}</span>
    </div>

    ${
      Array.isArray(profile.posts)
        ? `
        <h3 style="margin-top: 1.5rem;">My Posts</h3>
        <div>
        ${
          profile.posts.length
            ? profile.posts
                .map(
                  (p) => `
            <article class="post" data-id="${p.id}" style="cursor: pointer;">
                <h3>${p.title ?? "Untitled"}</h3>
                <p>${p.body ?? ""}</p>
                <small>${p.created ? new Date(p.created).toLocaleString() : ""}</small>
            </article>
        `,
                )
                .join("")
            : "<p>No posts yet.</p>"
        }
        </div>
    `
        : ""
    }
    `;

    profileContent.addEventListener("click", (e) => {
      const card = e.target.closest(".post");
      if (!card) return;
      navigate(`#/post?id=${card.dataset.id}`);
    });
  } catch (error) {
    profileContent.innerHTML = `<p style="color: red;">${error.message ?? "Failed to load profile. Please try again."}</p>`;
  }
}
