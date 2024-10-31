# Swarm.js

Run [OpenAI/Swarm](https://github.com/openai/swarm) in browser.

## Install

```bash
npm install
```

## Usage

1. Set up environment variables

   ```bash
   cp .env.example .env
   ```

   - For OpenAI official api and gpt-4o model, set `VITE_OPENAI_API_KEY`. For other models, use `VITE_DEFAULT_MODEL`.

   - For OpenAI compatible api, set `VITE_OPENAI_BASE_URL` and `VITE_OPENAI_API_KEY` for the client, and `VITE_DEFAULT_MODEL` for other models like `qwen-max`.

   ```
   VITE_OPENAI_BASE_URL=   # OpenAI base url
   VITE_OPENAI_API_KEY=    # OpenAI api key
   VITE_DEFAULT_MODEL=     # Default Model, gpt-4o if no set
   ```

2. Run vite server

   ```bash
   npm run dev
   ```

3. Open the link shown in your terminal.
4. Press F12 to open Chrome DevTools and switch to the `Console` tab. If everything works, you'll see:
   ```
   Starting Swarm.js 🐝
   ```
5. A browser prompt will ask for User input. Try typing `refund`.

## API Key Security

This project loads the API Key in the browser for personal use cases. Do not use it in production.
