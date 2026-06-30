import type { Express, RequestHandler } from "express";
import * as localAuth from "./localAuth";
import * as replitAuth from "./replitAuth";

export const isLocalDev = !process.env.REPL_ID;

export async function setupAuth(app: Express) {
  if (isLocalDev) {
    await localAuth.setupAuth(app);
  } else {
    await replitAuth.setupAuth(app);
  }
}

export const isAuthenticated: RequestHandler = isLocalDev
  ? localAuth.isAuthenticated
  : replitAuth.isAuthenticated;
