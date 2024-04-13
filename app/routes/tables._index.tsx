import { prisma } from "~/.server/prisma/prisma";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";

export async function loader() {
  const tables = await prisma.table.findMany({
    include: {
      players: true,
    },
  });

  return json(tables);
}

export default function Tables() {
  const tables = useLoaderData<typeof loader>();
  console.log("tables");
  console.log(tables);

  return (
    <div className="max-w-[800px] mx-auto">
      <Table>
        <TableCaption>Holdem Tables</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Small Blind</TableHead>
            <TableHead>Big Blind</TableHead>
            <TableHead>Players</TableHead>
            <TableHead className="text-right">Join Table</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((table) => {
            return (
              <TableRow key={table.id}>
                <TableCell>{table.name}</TableCell>
                <TableCell>{table.smallBlind}</TableCell>
                <TableCell>{table.bigBlind}</TableCell>
                <TableCell>
                  {table.players.length} / {table.maxPlayers}
                </TableCell>
                <TableCell className="text-right">
                  <a href={`/tables/${table.id}`}>Join Table</a>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
