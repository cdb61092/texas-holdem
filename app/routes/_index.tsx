import type { MetaFunction } from "@remix-run/node";
import { prisma } from "~/.server/prisma/prisma";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const tables = await prisma.table.findMany();

  return json(tables);
}

export default function Index() {
  const tables = useLoaderData<typeof loader>();
  console.log("tables");
  console.log(tables);

  return (
    <div className="max-w-[800px] mx-auto">
      <h1> Index route</h1>
    </div>
  );
}
