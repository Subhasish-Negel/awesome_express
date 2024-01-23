import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

async function main() {
  await prisma.users.create({
    data: {
      text: "Hi, this is my first text",
      email: "myemail@mail.com",
      password: "whatever",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
