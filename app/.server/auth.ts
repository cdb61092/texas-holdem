import { Authenticator } from "remix-auth";
import { getSession, sessionStorage } from "./session";
import { User } from ".prisma/client";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";
import { prisma } from "./prisma/prisma";
import bcrypt from "bcryptjs";
import { ActionFunctionArgs } from "@remix-run/node";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<User>(sessionStorage);

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const register = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    throw new Error("User already exists");
  }
  const passwordHash = await hashPassword(password);

  return prisma.user.create({ data: { email, password: passwordHash } });
};
export const logout = async ({ request }: ActionFunctionArgs) => {
  await authenticator.logout(request, {
    redirectTo: "/",
  });
};

export const requireUser = async (request: Request) => {
  const user = await authenticator.authenticate("form", request);
  invariant(user, "user should exist");
  return user;
};

export const requireUserId = async (request: Request): Promise<string> => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("user").id;
  invariant(userId, "No user id in session");
  return userId;
};

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(email.length > 0, "email must not be empty");

    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");

    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    // // Get the users avatar from the cloudflare worker
    // if (user.avatar) {
    //     const avatarKey = user.avatar
    //
    //     user.avatar = `${process.env.CLOUDFLARE_WORKER_URL}${avatarKey}`
    // }

    return user;
  }),
);
