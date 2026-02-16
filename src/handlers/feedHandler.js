import { navigate } from "../router";

export function feedHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Feed</h1>
        <p> Placeholder for feed </p>
        <button id="to-login">Go to login</button>
    </section>
`;

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("#/login");
  });
}
