import { redirect } from "next/navigation";

/**
 * Root page — redirects to the customer catalog by default.
 * The role switcher in the header handles navigation between views.
 */
export default function HomePage() {
  redirect("/customer");
}
