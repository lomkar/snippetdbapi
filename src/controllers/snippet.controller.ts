import { Request, Response } from "express";
import {
  AddSnippetType,
  AddTeamBody,
  addSnippet,
  addTeam,
  createNewCategoryHelper,
  deleteCategoryHelper,
  getSnippetDetailsHelper,
  getSnippetListWithCategoryHelper,
  getTeamAndCategoryOfUserHelper,
  deleteSnippetHelper,
} from "../helpers/helpers";

export const createNewTeam = async (req: Request, res: Response) => {
  let email = res.locals.token.email;
  let currentUser = {
    email: email,
    isAdmin: 1,
  };
  let newCategory = {
    categoryName: "Default Snippet Category",
  };

  try {
    let { teamName, teamMembers, categories } = req.body;
    teamMembers.push(currentUser);

    const newBody: AddTeamBody = {
      teamName: teamName,
      teamMembers: teamMembers,
      categories: categories,
    };

    const newTeam = await addTeam(newBody);

    const newTeamObj = {
      id: newTeam.id,
      teamName: newTeam.teamName,
      teamMembers: newTeam.users.map((user) => {
        return {
          email: user.user.email,
          id: user.user.id,
          isAdmin: user.isAdmin,
        };
      }),
      categories: newTeam.categories.map((cat) => {
        return {
          id: cat.id,
          categoryName: cat.categoryName,
        };
      }),
    };
    return res.json({
      status: true,
      message: "Team Created Successfully",
      data: newTeamObj,
    });
  } catch (err) {
    console.log("Error in createNewTeam API => ", err);
    return res.json({
      status: false,
      message: "Error while creating Team",
      data: {},
      error: err,
    });
  }
};

export const getTeamAndCategoryOfUser = async (req: Request, res: Response) => {
  try {
    let userid = res.locals.token.userId;
    const teams = await getTeamAndCategoryOfUserHelper(userid);

    return res.json({
      status: true,
      message: "Successfully received the Team",
      data: teams,
      error: "",
    });
  } catch (err) {
    console.log("Error in getTeamAndCategoryOfUser API => ", err);
    return res.json({
      status: false,
      message: "Error while retrieving Team",
      data: {},
      error: err,
    });
  }
};

export const createSnippet = async (req: Request, res: Response) => {
  try {
    let userId = res.locals.token.userId;
    let { title, description, codeSnippet, categoryid } = req.body;
    let body: AddSnippetType = {
      title: title,
      description: description,
      codeSnippet: codeSnippet,
      categoryid: categoryid,
      userId: userId,
    };
    const snippet = await addSnippet(body);
    const snippetObj = {
      snippetId: snippet.id,
      categoryid: snippet.categoryid,
    };
    return res.status(201).json({
      status: true,
      message: "Successfully added snippet",
      err: {},
      data: snippetObj,
    });
  } catch (err) {
    console.log("Error in createSnippet API => ", err);
    return res.json({
      status: false,
      message: "Error while creating snippet",
      data: {},
      error: err,
    });
  }
};

export const getSnippetListWithCategory = async (
  req: Request,
  res: Response
) => {
  try {
    const categorid = req.params.categoryid;
    let snippetList = await getSnippetListWithCategoryHelper(categorid);

    return res.json({
      status: true,
      message: "Successfully received snippets",
      err: {},
      data: snippetList,
    });
  } catch (err) {
    console.log("Error while getSnippetListWithCategory api", err);
    return res.json({
      status: false,
      message: "Error while getSnippetListWithCategory api",
      data: {},
      error: err,
    });
  }
};

export const getSnippetDetails = async (req: Request, res: Response) => {
  const snippetid = req.params.snippetid;
  try {
    const snippetDetails = await getSnippetDetailsHelper(snippetid);
    if (snippetDetails) {
      return res.json({
        status: true,
        message: "Successfully received snippet details",
        err: {},
        data: snippetDetails,
      });
    }
  } catch (err) {
    console.log("Error while getSnippetDetails api", err);
    return res.json({
      status: false,
      message: "Error while getSnippetDetails api",
      data: {},
      error: err,
    });
  }
  res.json({ status: true, data: {}, err: {}, message: "No data found." });
};

export const createNewCategory = async (req: Request, res: Response) => {
  const snippetid = req.params.teamid;
  const categoryName = req.body.categoryName;
  try {
    const newCategory = await createNewCategoryHelper(snippetid, categoryName);

    let categoryObj = {
      newCategory: {
        categoryName: newCategory.categoryName,
        id: newCategory.id,
      },
      teamId: newCategory.team.id,
    };

    return res.json({
      status: true,
      message: "Successfully added category",
      err: {},
      data: categoryObj,
    });
  } catch (err) {
    console.log("Error while createNewCategory api", err);
    return res.json({
      status: false,
      message: "Error while createNewCategory api",
      data: {},
      error: err,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  let userid = res.locals.token.userId;
  const { id } = req.body;
  try {
    const category = await deleteCategoryHelper(id, userid);
    return res.json({
      status: true,
      data: category,
      message: `Successfully deleted the catgory ${id}`,
    });
  } catch (err) {
    console.log("Failed to deleted category", err);
    return res.json({
      status: false,
      message: "Error while deleting category",
      error: err,
      data: {},
    });
  }
};

export const deleteSnippet = async (req: Request, res: Response) => {
  let userid = res.locals.token.userId;
  const { id } = req.body;
  try {
    const snippet = await deleteSnippetHelper(id, userid);

    return res.json({
      status: true,
      data: {
        id: snippet?.id,
        title: snippet?.title,
      },
      message: `Successfully deleted snippet ${snippet?.title}`,
    });
  } catch (err) {
    console.log("Failed to deleted snippet", err);
    return res.json({
      status: false,
      message: "Error while deleting snippet",
      error: err,
      data: {},
    });
  }
};
