<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/400fc1e0-bdbc-4625-a2db-bfe1ae3727ef

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   - Chat and smart tools use `gemini-3.8-flash` by default. Override it with `GEMINI_MODEL` if your key uses a different available model.
   - Speech uses `gemini-3.8-flash-tts` by default. Override it with `GEMINI_TTS_MODEL` if needed.
3. Run the app:
   `npm run dev`

The development server uses port `3000` by default, or the port set in `PORT`.
If that port is already in use, set `PORT` to a free port before starting the
app (in PowerShell, for example: `$env:PORT=3001; npm run dev`). The server exits
instead of silently switching ports, which could send API requests to a
different process.

The frontend chat and tools require the Node.js API server in `server.ts`. Deploy
the app with a Node.js host that runs this server; a static-only host cannot serve
the `/api/*` endpoints.
