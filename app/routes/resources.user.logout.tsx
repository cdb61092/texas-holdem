import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticator } from "~/.server/auth";

export const action = async ({ request }: ActionFunctionArgs) => {
  return await authenticator.logout(request, {
    redirectTo: "/",
  });
};
