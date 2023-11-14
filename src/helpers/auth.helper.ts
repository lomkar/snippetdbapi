import * as dotenv from "dotenv";
import { AddTeamBody, addTeam } from "./helpers";
import InfoError from "../errors/InfoError";
dotenv.config();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

export async function wrapedSendMail(mailOptions: any) {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        console.log("error is " + error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

export async function verifyToken(token: string, key: string) {
  return new Promise((resolve, reject) =>
    jwt.verify(token, key, (err: any, decoded: any) => {
      if (err) {
        reject({});
      } else {
        resolve(decoded);
      }
    })
  );
}

export async function createTeamAfterSignup(email: string) {
  let currentUser = {
    email: email,
    isAdmin: 1,
  };
  let newCategory = {
    categoryName: "Default Snippet Category",
  };

  try {
    let teamName = "Developer";

    let teamMembers = [];
    teamMembers.push(currentUser);
    let categories = [];
    categories.push(newCategory);

    const newBody: AddTeamBody = {
      teamName: teamName,
      teamMembers: teamMembers,
      categories: categories,
    };

    const newTeam = await addTeam(newBody);
  } catch (err) {
    console.log("Error in createTeamAfterSignup method", err);
    throw new InfoError("Error in createTeamAfterSignup method");
  }
}
