import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// async function main() {
//   await prisma.users.create({
//     data: {
//       email: "myemail@mail.com",
//       name: "whatever",
//       password: "whateverw",
//     },
//   });
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
