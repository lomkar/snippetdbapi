import { PrismaClient } from "@prisma/client";
import InfoError from "./errors/InfoError";

const prisma = new PrismaClient();

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const user = {
      name,
      tokenVersion: 0,
      email: email,
      password: password,
    };

    return await prisma.user.create({ data: user });
  } catch (err) {
    console.log("ERROR in createUser ", err);
    throw new InfoError("Error in createUser method");
  }
}

export async function increaseTokenVersion(email: string) {
  const user = await prisma.user.findFirst({
    where: { email: email },
  });

  if (user) {
    const newTokenVersion = user.tokenVersion + 1;
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        tokenVersion: newTokenVersion,
      },
    });

    if (updatedUser) {
      return updatedUser;
    }
  }

  throw new InfoError("Something went wrong");
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { id: id },
    });
    if (user) {
      return user;
    }
  } catch (err) {
    throw new InfoError("Error in getUserById method ");
  }
}

export async function getUserByEmailId(email: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { email: email },
    });
    if (user) {
      return user;
    }
    return null;
  } catch (err) {
    console.log("ERROR is thee => ", err);
    throw new InfoError("Error in getUserByEmailId method ");
  }
}
