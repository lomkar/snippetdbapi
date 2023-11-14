import cookieParser from "cookie-parser";

import express, { Request, Response } from "express";
require("express-async-errors");

const app = express();
import authRoute from "./src/routes/auth.route";
import snippetRoute from "./src/routes/snippet.route";
import globalErrorHandler from "./src/middlewares/globalErrorHandlers";
import * as dotenv from "dotenv";
dotenv.config();

import cors from "cors";
const corsOrigin = {
  origin: process.env.CLIENT_URL, //or whatever port your frontend is using
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOrigin));
app.use(express.json());

app.use(cookieParser());
app.get("/api", (req: Request, res: Response) => {
  res.json({
    status: true,
    messate: "API is working",
  });
});
app.use("/api/auth", authRoute);
app.use("/api/snippet", snippetRoute);

app.use("*", globalErrorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
