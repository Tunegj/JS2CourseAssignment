import { navigate } from "../router";

export function registerHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Register</h1>
        <p> Placeholder for register form </p>
        <button id="to-login">Go to login</button>
    </section>
`;

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("#/login");
  });
}
