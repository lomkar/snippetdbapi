import express, { Request, Response } from "express";
const jwt = require("jsonwebtoken");
import * as dotenv from "dotenv";
const bcrypt = require("bcryptjs");
import { Cookies } from "../shared";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
dotenv.config();

import {
  buildTokens,
  clearTokens,
  refreshTokens,
  setTokens,
  verifyRefreshToken,
} from "../utils/token-utils";
import {
  getUserByEmailId,
  getUserById,
  increaseTokenVersion,
} from "../user-service";
import {
  createTeamAfterSignup,
  verifyToken,
  wrapedSendMail,
} from "../helpers/auth.helper";
import ValidationError from "../errors/ValidationError";
import InfoError from "../errors/InfoError";

export const signIn = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;
  if (!email) {
    throw new ValidationError("Email is required field", "email");
  }

  if (!password) {
    throw new ValidationError("Password is required field", "password");
  }
  let user = await getUserByEmailId(email);

  if (!user) {
    throw new InfoError("Email and Password doesnot match");
  }

  if (user && !user.isAccountVerifiedByEmail) {
    throw new InfoError("Email is not verified");
  }

  let checkAuth = await bcrypt.compare(password, user?.password);

  if (!checkAuth) {
    throw new InfoError("Email and Password doesnot match");
  }

  const { accessToken, refreshToken } = buildTokens(user);

  setTokens(res, accessToken, refreshToken);
  // return res.redirect(`${config.clientUrl}/dashboard`);
};

export const signUp = async (req: Request, res: Response) => {
  let { name, email, password } = req.body;

  if (!name) {
    throw new ValidationError("name is required field", "name");
  }

  if (email.length < 2) {
    throw new ValidationError(
      "Email Should be longer than 2 characters",
      "email"
    );
  }

  if (password.length < 6) {
    throw new ValidationError(
      "Password Should be longer than 6 characters",
      "password"
    );
  }
  try {
    email = email.toLowerCase();

    let user = await getUserByEmailId(email);

    if (user && user.isAccountVerifiedByEmail) {
      throw new InfoError("Email Already Exists in Database");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    let newUserCreated;
    if (user) {
      await prisma.user.update({
        data: { password: hashedPassword, name: name },

        where: {
          email: email,
        },
      });
    } else {
      newUserCreated = await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: name,
          tokenVersion: 0,
        },
      });
    }

    let id = "";
    let tokenVersion = 0;
    if (user) {
      id = user.id;
      tokenVersion = user.tokenVersion;
    } else if (newUserCreated) {
      id = newUserCreated.id;
      tokenVersion = newUserCreated.tokenVersion;
    }

    let newUser = {
      email: email,
      name: name,
      id: id,
      tokenVersion: tokenVersion,
    };

    //SENT EMAIL WITH JWT VERIFICATION
    const jwtToken = jwt.sign(
      { email },
      process.env.JWT_EMAIL_VERIFICATION_SECRET,
      { expiresIn: "20m" }
    );

    let mailDetails = {
      from: "snippetDBindia@gmail.com",
      to: email,
      subject: "SnippetDB Account Activation Link",
      html: `
              <h2>Please click on given link to activate your account</h2>
              <p><a href="${process.env.CLIENT_URL}/activate/${jwtToken}">Click Here</a> to activate your account.</p>
            `,
    };

    let mailRes = await wrapedSendMail(mailDetails);

    let message = "Something Went wrong. Please try again later.";

    let status = false;
    if (mailRes) {
      message = `Email Registered Successfully. Check your email ${email} and kindly activate your account.`;
      status = true;
    } else {
      throw new InfoError(message);
    }

    const response = {
      message,
      status,
    };
    return res.status(201).json(response);
  } catch (err: any) {
    console.log("ERROR WHILE siGNUP => ", err);
    throw new InfoError(err);
  }
};

export const activateRegisterUser = async (req: Request, res: Response) => {
  const { jwtToken } = req.body;
  if (jwtToken) {
    let decoded: any;
    try {
      decoded =
        (await verifyToken(
          jwtToken,
          process.env.JWT_EMAIL_VERIFICATION_SECRET!
        )) || {};
    } catch (err) {
      throw new InfoError("Incorrect or Expired Link.");
    }
    const { email } = decoded;
    if (email) {
      let isAccountVerifiedByEmail = 1;
      const user = await prisma.user.findFirst({
        where: { email: email },
        select: {
          email: true,
          isAccountVerifiedByEmail: true,
          id: true,
          tokenVersion: true,
          name: true,
        },
      });

      if (!user) {
        throw new InfoError("User does not exists");
      }

      if (user && user.isAccountVerifiedByEmail) {
        const { accessToken, refreshToken } = buildTokens(user);
        setTokens(res, accessToken, refreshToken);
        return;
      }

      if (user != null) {
        await prisma.user.update({
          data: {
            isAccountVerifiedByEmail: isAccountVerifiedByEmail,
          },
          where: {
            email: email,
          },
        });

        await createTeamAfterSignup(email);

        const { accessToken, refreshToken } = buildTokens(user);

        setTokens(res, accessToken, refreshToken);
      }
    }
  } else {
    throw new InfoError("Token not found.");
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const current = verifyRefreshToken(req.cookies[Cookies.RefreshToken]);
    const user = await getUserById(current.userId);
    if (!user) throw "User not found";

    const { accessToken, refreshToken } = refreshTokens(
      current,
      user.tokenVersion
    );
    setTokens(res, accessToken, refreshToken);
  } catch (error) {
    clearTokens(res);
  }

  res.end();
};

export const logout = async (req: Request, res: Response) => {
  clearTokens(res);
  res.end();
};

export const logoutAll = async (req: Request, res: Response) => {
  await increaseTokenVersion(res.locals.token.userId);

  clearTokens(res);
  res.end();
};

export const me = async (req: Request, res: Response) => {
  const user = await getUserById(res.locals.token.userId);
  res.json(user);
};

export const protectedRoute =  async (req: Request, res: Response) => {
  try {
    let email = res.locals.token.email;
    let user = await prisma.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    if (!user) {
      return res.status(200).json({
        status: false,
        message: "no user found",
        data: {},
      });
    }
    return res.status(200).json({
      status: true,
      message: "Successfull",
      data: user,
    });
  } catch (err) {
    return res.status(200).json({
      status: false,
      message: "failed",
      data: {},
    });
  }
}
