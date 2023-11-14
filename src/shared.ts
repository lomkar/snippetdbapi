export enum Cookies {
    AccessToken = "access",
    RefreshToken = "refresh",
  }
  
  export interface UserDocument {
    id: string;
    name: string;
    email: string;
    tokenVersion: number;
  }
  
  export interface AccessTokenPayload {
    userId: string;
    email:string;
  }
  
  export interface AccessToken extends AccessTokenPayload {
    exp: number;
  }
  
  export interface RefreshTokenPayload {
    userId: string;
    version: number;
    email:string;
  }
  
  export interface RefreshToken extends RefreshTokenPayload {
    exp: number;
  }
  