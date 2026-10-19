import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import dotenv from "dotenv";
import app from "./src/server/app";

dotenv.config({ path: [".env.local", ".env"] });

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app
    .listen(PORT, "0.0.0.0", () => {
      console.log(`DARBS AI (Grok) Server running on http://0.0.0.0:${PORT}`);
    })
    .on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please terminate existing processes or select another port.`
        );
        process.exit(1);
      }
      console.error("Failed to start server:", error);
      process.exit(1);
    });
}

// Start standalone server when running locally or in container, but skip during Vercel serverless execution
if (!process.env.VERCEL) {
  startServer();
}

export default app;