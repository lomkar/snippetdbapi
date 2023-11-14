import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  isProduction: process.env.NODE_ENV! === "production",
  clientUrl: process.env.CLIENT_URL!,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
};
