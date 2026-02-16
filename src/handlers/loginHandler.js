import { navigate } from "../router";

/**
 * Render the login view
 */
export function loginHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Login</h1>
        <p> Placeholder for login form </p>
        <button id="to-register">Go to register</button>
    </section>
`;

  document.querySelector("#to-register").addEventListener("click", () => {
    navigate("#/register");
  });
}
