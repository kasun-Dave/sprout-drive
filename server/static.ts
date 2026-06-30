import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function resolvePublicDir(): string | null {
  const candidates = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "public"),
    path.join(process.cwd(), "dist", "public"),
  ];
  return candidates.find((p) => fs.existsSync(path.join(p, "index.html"))) ?? null;
}

export function serveStatic(app: Express) {
  const distPath = resolvePublicDir();

  if (!distPath) {
    console.error(
      "Static build not found. Expected dist/public/index.html — run npm run build",
    );
    app.get("/", (_req, res) => {
      res
        .status(503)
        .type("text/plain")
        .send("SproutDrive: build missing. Run npm run build on the server.");
    });
    return;
  }

  console.log(`Serving static files from ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback — serve index.html for client routes
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}
