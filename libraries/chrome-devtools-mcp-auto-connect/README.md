# Chrome DevTools MCP Auto Connect

This example verifies the Chrome DevTools MCP `--autoConnect` path against the
currently running default Chrome profile.

## Prerequisites

- Chrome 144 or newer.
- `chrome://inspect/#remote-debugging` has **Allow remote debugging for this
  browser instance** enabled.
- Node.js 20.19.0 or newer and npm are available.

The script automatically clicks Chrome's **Allow remote debugging?** prompt on
macOS. The terminal app that runs this script must have Accessibility permission
for UI scripting.

## Run

```bash
zsh run.sh
```

The script starts:

```bash
npx -y chrome-devtools-mcp@latest --autoConnect
```

Then it initializes the MCP session, lists available tools, and calls
`list_pages`. By default it prints only a summary:

```text
Chrome DevTools MCP auto-connect succeeded.
Server: Chrome DevTools MCP server
Version: 1.2.0
Tools: 29
Pages: 14
```

To print the page list, run:

```bash
zsh run.sh --show-pages
```

To keep the Chrome authorization prompt manual:

```bash
zsh run.sh --no-auto-allow
```

To wait longer for the Chrome authorization prompt:

```bash
zsh run.sh --timeout-ms 120000
```

The npm script runs the same shell script:

```bash
npm run test:auto-connect
```
