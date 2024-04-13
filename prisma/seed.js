import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // const user1 = await prisma.table.create({
  //     data: {
  //         name: 'Table 1',
  //         smallBlind: 0.25,
  //         bigBlind: 0.5,
  //         status: 'WAITING',
  //         maxPlayers: 6
  //     },
  // });
  //
  // console.log({user1});
  await prisma.table.create({
    data: {
      name: "Table 2",
      smallBlind: 0.25,
      bigBlind: 0.5,
      maxPlayers: 6,
      status: "WAITING",
      // Create the seats as part of the table creation
      seats: {
        create: Array.from({ length: 6 }, (_, index) => ({
          number: index + 1, // Seat numbers start from 1 to maxPlayers
        })),
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    // eslint-disable-next-line no-undef
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
