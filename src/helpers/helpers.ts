import { PrismaClient } from "@prisma/client";
import InfoError from "../errors/InfoError";

const prisma = new PrismaClient();

export type TeamMemberType = {
  email: string;
  isAdmin: Number;
};

export type CategoryType = {
  categoryName: string;
};

export type AddTeamBody = {
  teamName: string;
  teamMembers: TeamMemberType[];
  categories: CategoryType[];
};

export const addTeam = async (body: AddTeamBody) => {
  const { teamName, teamMembers, categories } = body;

  const connectOrCreateUser = teamMembers.map((member) => {
    return {
      isAdmin: 1,
      user: {
        connectOrCreate: {
          where: {
            email: member.email.toLocaleLowerCase(),
          },
          create: {
            email: member.email.toLocaleLowerCase(),
            password: "",
            tokenVersion: 0,
            isAccountVerifiedByEmail: 0,
            name: "",
          },
        },
      },
    };
  });

  const team = await prisma.team.create({
    data: {
      teamName: teamName,
      categories: {
        create: categories,
      },
      users: {
        create: connectOrCreateUser,
      },
    },
    include: {
      categories: true,
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  return team;
};

export const getTeamAndCategoryOfUserHelper = async (id: string) => {
  try {
    const teamAndCategory = await prisma.team.findMany({
      where: {
        isDeleted: 0,
        users: {
          some: {
            userid: id,
          },
        },
      },
      include: {
        categories: {
          where: {
            isDeleted: 0,
          },
          select: {
            categoryName: true,
            createdAt: true,
            id: true,
          },
        },
        users: {
          include: {
            user: {
              select: {
                email: true,
                id: true,
                name: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    let teamAndCategoryList = teamAndCategory.map((teamAndCategory) => {
      return {
        teamName: teamAndCategory.teamName,
        id: teamAndCategory.id,
        categories: teamAndCategory.categories.map((category) => {
          return {
            categoryName: category.categoryName,
            id: category.id,
          };
        }),
        teamMembers: teamAndCategory.users.map((member) => {
          return {
            isAdmin: member.isAdmin,
            email: member.user.email,
            id: member.user.id,
          };
        }),
      };
    });

    return teamAndCategoryList;
  } catch (err) {
    console.log("Error while getTeamAndCategoryOfUserHelper method", err);
    throw new InfoError("Error while getTeamAndCategoryOfUserHelper method");
  }
};

export type AddSnippetType = {
  title: string;
  description: string;
  codeSnippet: string;
  categoryid: string;
  userId: string;
};

export const addSnippet = async (body: AddSnippetType) => {
  try {
    const snippet = await prisma.snippet.create({
      data: body,
    });

    return snippet;
  } catch (err) {
    console.log("Error in addSnippet Helper Method", err);
    throw new InfoError("Error in addSnippet Helper Method");
  }
};

export const getSnippetListWithCategoryHelper = async (categoryid: string) => {
  try {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryid,
        isDeleted: 0,
      },
      include: {
        snippets: {
          where: {
            isDeleted: 0,
          },
          select: {
            title: true,
            description: true,
            codeSnippet: true,
            createdAt: true,
            id: true,
          },
        },
        team: {
          select: {
            teamName: true,
            users: {
              select: {
                teamid: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    let snippetList = {
      categoryName: category?.categoryName,
      categoryid: category?.id,
      teamid: category?.teamid,
      teamName: category?.team.teamName,
      snippets: category?.snippets,
      createdAt: category?.createdAt,
      teamsMembers: category?.team.users.map((user) => {
        return {
          id: user.user.id,
          name: user.user.name,
          email: user.user.email,
        };
      }),
    };

    return snippetList;
  } catch (err) {
    console.log("Error in getSnippetListWithCategory Helper Method", err);
    throw new InfoError("Error in getSnippetListWithCategory Helper Method");
  }
};

export const getSnippetDetailsHelper = async (snippetid: string) => {
  try {
    const snippet = await prisma.snippet.findFirst({
      where: {
        id: snippetid,
        isDeleted: 0,
      },
      include: {
        category: {
          include: {
            team: {
              select: {
                teamName: true,
                id: true,
              },
            },
          },
        },
        creatorOfSnippet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (snippet) {
      let snippetDetails = {
        id: snippet?.id,
        title: snippet?.title,
        description: snippet?.description,
        codeSnippet: snippet?.codeSnippet,
        categoryName: snippet?.category.categoryName,
        categoryid: snippet?.category.id,
        teamName: snippet?.category.team.teamName,
        teamid: snippet?.category.team.id,
        createdAt: snippet?.createdAt,
        fullName: snippet?.creatorOfSnippet?.name,
      };

      return snippetDetails;
    }
  } catch (err) {
    console.log("Error in getSnippetDetailsHelper Helper Method", err);
    throw new InfoError("Error in getSnippetDetailsHelper Helper Method");
  }
  return null;
};

export const createNewCategoryHelper = async (
  teamid: string,
  categoryName: string
) => {
  try {
    const newCategory = await prisma.category.create({
      data: {
        categoryName: categoryName,
        teamid: teamid,
      },
      include: {
        team: true,
      },
    });
    return newCategory;
  } catch (err) {
    console.log("Error in createNewCategoryHelper Helper Method", err);
    throw new InfoError("Error in createNewCategoryHelper Helper Method");
  }
};

export const deleteCategoryHelper = async (id: string, userid: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: id,
      },
      select: {
        team: {
          select: {
            users: {
              select: {
                isAdmin: true,
                userid: true,
              },
            },
          },
        },
      },
    });

    const foundUser = category?.team.users.find(
      (user) => user.userid === userid && user.isAdmin === 1
    );

    // Check if a user was found and perform an action
    if (!foundUser) {
      console.log("Error in deleteCategoryHelper Helper Method");
      throw new InfoError("Error in deleteCategoryHelper Helper Method");
      // Perform your desired action here
    }

    let categoryDelete;
    if (foundUser && foundUser.userid === userid) {
      categoryDelete = await prisma.category.update({
        where: {
          id: id,
        },
        data: {
          isDeleted: 1,
        },
      });
    }

    return {
      id: categoryDelete?.id,
      categoryName: categoryDelete?.categoryName,
    };
  } catch (err) {
    console.log("Error in deleteCategoryHelper Helper Method", err);
    throw new InfoError("Error in deleteCategoryHelper Helper Method");
  }
};

export const deleteSnippetHelper = async (id: string, userid: string) => {
  try {
    const snippet = await prisma.snippet.findFirst({
      where: {
        id: id,
      },
      select: {
        category: {
          select: {
            team: {
              select: {
                users: {
                  select: {
                    userid: true,
                    isAdmin: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const foundUser = snippet?.category.team.users.find(
      (user) => user.userid === userid && user.isAdmin === 1
    );

    if (!foundUser) {
      console.log("Error in deleteCategoryHelper Helper Method");
      throw new InfoError("Error in deleteCategoryHelper Helper Method");
    }

    let snippetDelete;
    if (foundUser && foundUser.userid === userid) {
      snippetDelete = await prisma.snippet.update({
        where: { id: id },
        data: {
          isDeleted: 1,
        },
      });
    }

    return snippetDelete;
  } catch (err) {
    console.log("Error in deleteSnippetHelper Helper Method", err);
    throw new InfoError("Error in deleteSnippetHelper Helper Method");
  }
};
