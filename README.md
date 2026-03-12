# Browser Live View — Sample App

A minimal React app demonstrating the `BrowserLiveView` component from the [Bedrock AgentCore SDK](https://github.com/anthropics/bedrock-agentcore-sdk-typescript).

## Prerequisites

- Node.js 18+
- An active AgentCore browser session (browser ID + session ID)
- AWS credentials with `bedrock-agentcore` access

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Edit `src/constants.ts` with your values:

   ```ts
   export const REGION = 'us-west-2'
   export const BROWSER_ID = '<your-browser-id>'
   export const SESSION_ID = '<your-session-id>'
   export const ACCESS_KEY_ID = '<your-access-key>'
   export const SECRET_ACCESS_KEY = '<your-secret-key>'
   export const SESSION_TOKEN = '<your-session-token>'
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` and click **Connect**.

## Vite Configuration

The DCV Web Client SDK is bundled with the AgentCore package and must be aliased and copied to the public directory. See `vite.config.ts` for the required `resolve.alias`, `resolve.dedupe`, and `viteStaticCopy` configuration.

