import { redirect } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  
  // If login() didn't redirect to OAuth, it means the shop was missing or invalid.
  // Instead of showing the manual login form, we redirect back to the landing page.
  if (errors) {
    return redirect("/");
  }

  return null;
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  
  if (errors) {
    return redirect("/");
  }

  return null;
};

// We still export a default component just in case React Router expects one for the route,
// but it will never render because the loader ALWAYS throws a redirect.
export default function Auth() {
  return null;
}
