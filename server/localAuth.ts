import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import type { Express, RequestHandler } from "express";
import { storage } from "./storageFactory";

const MemoryStore = MemoryStoreFactory(session);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  return session({
    secret: process.env.SESSION_SECRET || "local-dev-secret-change-me",
    store: new MemoryStore({ checkPeriod: sessionTtl }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, _password, done) => {
        try {
          const userId = `local-${email.toLowerCase()}`;
          const firstName = email.split("@")[0] || "User";
          await storage.upsertUser({
            id: userId,
            email,
            firstName,
            lastName: "User",
          });

          const bootstrapEmail = process.env.BOOTSTRAP_OWNER_EMAIL?.trim().toLowerCase();
          if (bootstrapEmail && email.toLowerCase() === bootstrapEmail) {
            await storage.updateUserRole(userId, "owner");
          }

          done(null, {
            claims: { sub: userId, email, first_name: firstName, last_name: "User" },
            expires_at: Math.floor(Date.now() / 1000) + 86400 * 7,
          });
        } catch (error) {
          done(error);
        }
      },
    ),
  );

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/auth/config", (_req, res) => {
    res.json({ provider: "local" });
  });

  app.post("/api/local/login", (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        res.json({ success: true });
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
