import express, { Request, Response } from "express";
const router = express.Router();
import {
  refresh,
  logout,
  logoutAll,
  signUp,
  signIn,
  me,
  activateRegisterUser,
  protectedRoute,
} from "../controllers/auth.controller";
import { authMiddleware } from "../auth-middleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

router.post("/signUp", signUp);
router.post("/activateRegisterUser", activateRegisterUser);
router.post("/signIn", signIn);

router.post("/refresh", refresh);

router.get("/protected", authMiddleware, protectedRoute);

router.post("/logout", authMiddleware, logout);

router.post("/logout-all", authMiddleware, logoutAll);

router.get("/me", authMiddleware, me);

export default router;
