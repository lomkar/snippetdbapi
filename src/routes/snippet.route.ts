import express from "express";
const router = express.Router();
import {
  createNewTeam,
  getTeamAndCategoryOfUser,
  createSnippet,
  getSnippetListWithCategory,
  getSnippetDetails,
  createNewCategory,
  deleteCategory,
  deleteSnippet,
} from "../controllers/snippet.controller";
import { authMiddleware } from "../auth-middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
router.post("/createNewTeam", authMiddleware, createNewTeam);
router.get(
  "/getTeamAndCategoryOfUser",
  authMiddleware,
  getTeamAndCategoryOfUser
);

router.post("/createSnippet", authMiddleware, createSnippet);
router.get(
  "/getSnippetListWithCategory/:categoryid",
  authMiddleware,
  getSnippetListWithCategory
);

router.get("/getSnippetDetails/:snippetid", authMiddleware, getSnippetDetails);

router.post("/createNewCategory/:teamid", authMiddleware, createNewCategory);
router.post("/deleteCateogry", authMiddleware, deleteCategory);
router.post("/deleteSnippet", authMiddleware, deleteSnippet);

export default router;
