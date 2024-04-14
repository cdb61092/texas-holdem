import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/.server/prisma/prisma";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Button } from "~/components/ui/button";
import { requireUserId } from "~/.server/auth";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import invariant from "tiny-invariant";
import React from "react";
import { wsContext } from "~/ws.context";
import { Chat } from "~/components/Chat";
import { PokerGameState } from "~/lib/poker/functional/pokerGame";

// export async function action({ request, params }: ActionFunctionArgs) {
//   const userId = await requireUserId(request);
//   const user = await prisma.user.findUnique({
//     where: {
//       id: userId,
//     },
//   });
//   invariant(user, "User not found");
//   const tableId = params.id;
//   invariant(tableId, "Table not found");
//
//   const formData = await request.formData();
//   const action = formData.get("action");
//   if (action === "sit") {
//     await seatPlayer(tableId, user.id);
//   } else if (action === "leave") {
//     await leaveSeat(user);
//   }
//
//   return null;
// }

export async function loader({ params, request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  invariant(user, "User not found");
  console.log("userId", userId);
  const tableId = params.id;
  const table = await prisma.table.findUnique({
    where: {
      id: tableId,
    },
    include: {
      players: true,
      seats: {
        include: {
          player: true,
        },
      },
    },
  });

  invariant(table, "Table not found");

  return json({ table, user });
}

export default function Table() {
  const { table, user } = useLoaderData<typeof loader>();
  const [gameState, setGameState] = React.useState<PokerGameState>();
  // const updatedTable = useActionData<typeof action>()
  console.log(table);

  const socket = React.useContext(wsContext);
  React.useEffect(() => {
    console.log("in table.$id socket effect");
    if (!socket) {
      console.log("no socket in table.$id");
      return;
    }

    socket.on("update game state", (gameState) => {
      console.log("in update game state");
      console.log(gameState);
      setGameState(gameState);
    });

    // socket.on("start game", (msg) => {
    //   console.log("Table ID:", msg.tableId);
    //   console.log("Message Content:", msg.message);
    // });
  }, [socket]);

  React.useEffect(() => {
    console.log(gameState);
  }, [gameState]);

  const joinTable = async () => {
    if (!socket) return;
    socket.emit("join table", { table, user });
  };

  return (
    <div>
      Table {table?.id}
      <div>
        <div>
          <Button type="submit" onClick={() => joinTable()}>
            Sit Down
          </Button>
        </div>
        <div>
          <Button type="submit">Leave Seat</Button>
        </div>
      </div>
      <div>
        {table?.seats.map((seat) => {
          return (
            <div key={seat.id} className="flex">
              {seat.player?.displayName ? (
                <>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>GG</AvatarFallback>
                  </Avatar>
                  <span>{seat.player?.displayName}</span>
                </>
              ) : (
                "Empty"
              )}
            </div>
          );
        })}
      </div>
      <Chat tableId={table?.id || ""} user={user} />
    </div>
  );
}
