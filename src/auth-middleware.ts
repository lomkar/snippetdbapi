import { NextFunction, Request, Response } from "express";

import { Cookies } from "./shared";

import { verifyAccessToken } from "./utils/token-utils";
import AuthTokenError from "./errors/AuthTokenError";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = verifyAccessToken(req.cookies[Cookies.AccessToken]);

  if (!token) {
    throw new AuthTokenError("Not signed in");
  }

  res.locals.token = token;

  next();
}
