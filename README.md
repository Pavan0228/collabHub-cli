# CollabHub CLI

A simple CLI to run your local dev server and expose it to the internet using localtunnel.

## Install

```bash
npm install -g collabhub
```

## Usage

Run in your project directory. The CLI auto-detects your project's port from `.env` (PORT=xxxx) or your `package.json` dev script. You can override with `--port`.

```bash
collabhub dev            # auto-detects port or defaults to 3000
collabhub dev --port 5173
```

## Requirements

-   Node.js 18+

## Development

Clone and link locally for development:

```bash
npm install
npm link
collabhub dev
```

## License

MIT
