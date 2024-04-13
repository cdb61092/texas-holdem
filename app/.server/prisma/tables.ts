import { prisma } from "./prisma";
import invariant from "tiny-invariant";
import { User } from "../../../types";

type TableArgs = {
  tableName: string;
  smallBlind: number;
  bigBlind: number;
  maxPlayers: number;
};

export async function createTable({
  tableName,
  smallBlind,
  bigBlind,
  maxPlayers,
}: TableArgs) {
  console.log("in createTable");
  const table = await prisma.table.create({
    data: {
      name: tableName,
      smallBlind: smallBlind,
      bigBlind: bigBlind,
      maxPlayers: maxPlayers,
      status: "WAITING",
      // Create the seats as part of the table creation
      seats: {
        create: Array.from({ length: maxPlayers }, (_, index) => ({
          number: index + 1, // Seat numbers start from 1 to maxPlayers
        })),
      },
    },
  });

  console.log(table);
  return table;
}

export async function seatPlayer(tableId: string, userId: string) {
  console.log("in seatPlayer");
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: { seats: true },
  });
  console.log("table in seatPlayer");
  // console.log(table);
  invariant(table, "Table not found");

  console.log("tableId in seatPlayer: ", tableId);

  const openSeat = table.seats.find((seat) => !seat.occupied);
  invariant(openSeat, "No open seats");

  return prisma.table.update({
    where: { id: tableId },
    data: {
      seats: {
        update: {
          where: { id: openSeat.id },
          data: {
            occupied: true,
            player: {
              connect: { id: userId },
            },
          },
        },
      },
    },
  });
}

export async function leaveSeat(user: User) {
  console.log("in leaveSeat");
  invariant(user, "User not found");

  console.log("user in leaveSeat: ", user);

  // const table = await prisma.table.findUnique({
  //   where: { id: user },
  //   include: { seats: true },
  // });
  // invariant(table, "Table not found");
  //
  // const seat
  //
  // const occupiedSeat = table.seats.find((seat) => seat.player.id === userId);
  // invariant(occupiedSeat, "User not seated");

  // Use a transaction to update both the seat and the user
  const [updatedSeat, updatedUser] = await prisma.$transaction([
    // Update the seat to be unoccupied
    prisma.seat.update({
      where: { id: user.currentSeatId },
      data: {
        occupied: false,
        player: {
          disconnect: true,
        },
      },
    }),
    // Update the user to remove their currentTableId and currentSeatId
    prisma.user.update({
      where: { id: user.id },
      data: {
        currentTableId: null,
        currentSeatId: null,
      },
    }),
  ]);

  return { updatedSeat, updatedUser };
}
