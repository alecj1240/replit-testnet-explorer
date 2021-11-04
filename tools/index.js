const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const express = require("express");
const { createServer } = require("vite");
const reactRefresh = require("@vitejs/plugin-react-refresh").default;
const ReplitDB = require("@replit/database");

const db = new ReplitDB();

async function init(output) {
  const app = express();
  const server = http.createServer(app);

  const vite = await createServer({
    plugins: [reactRefresh()],
    server: {
      middlewareMode: "ssr",
      hmr: {
        clientPort: 443,
        server: server,
      },
    },
    configFile: false,
  });

  app.get("/", async (req, res) => {
    const url = req.originalUrl;
    const template = await vite.transformIndexHtml(
      req.originalUrl,
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>dApp</title>
					<link rel="preconnect" href="https://fonts.googleapis.com">
					<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
					<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">
        </head>
        <body>
          <div id="root">Loading...</div>
          <script type="module" src="/tools/ui.jsx"></script>
        </body>
      </html>
    `
    );

    res.end(template);
  });

  app.use(vite.middlewares);
  server.listen(3000, () => console.log("Ready"));
}

init();
console.log("Done!");
