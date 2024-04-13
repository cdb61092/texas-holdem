import type { ActionFunctionArgs } from "@remix-run/node";
import { register } from "~/.server/auth";
import invariant from "tiny-invariant";
import { redirect } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

const AuthSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: AuthSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { email, password } = submission.value;

  await register(email, password);

  return redirect("/login");
}
