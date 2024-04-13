import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

interface CreateUser {
  email: string;
  password: string;
  displayName: string | null;
}

export async function createUser(user: CreateUser, ctx: Context) {
  return ctx.prisma.user.create({
    data: user,
  });
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};
