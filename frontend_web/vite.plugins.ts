import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const resultDir = path.join(rootDir, "result");

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function attachResultApi(middlewares: Connect.Server): void {
  middlewares.use(async (req, res, next) => {
    if (!req.url?.startsWith("/api/results") || req.method !== "POST") {
      next();
      return;
    }

    try {
      const raw = await readBody(req);
      const payload = JSON.parse(raw) as { id?: string };
      const id =
        typeof payload.id === "string" && payload.id.trim()
          ? payload.id.trim().replace(/[^\w.-]/g, "_")
          : `swls-${Date.now()}`;

      fs.mkdirSync(resultDir, { recursive: true });
      const filePath = path.join(resultDir, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), "utf8");

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: true, file: `result/${id}.json` }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  });
}

export function saveResultPlugin(): Plugin {
  return {
    name: "scalyn-save-result",
    configureServer(server) {
      attachResultApi(server.middlewares);
    },
    configurePreviewServer(server) {
      attachResultApi(server.middlewares);
    },
  };
}
