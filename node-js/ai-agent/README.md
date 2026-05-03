# AI Agent

A minimal, single-file TypeScript AI agent that runs as a Node.js CLI. Talks to a free [OpenRouter](https://openrouter.ai/) model using the OpenAI-compatible Chat Completions API and demonstrates the tool-calling loop end-to-end without any agent framework.

## Tools

The agent exposes five tools the model can call:

- `web_search` — query the [Brave Search API](https://api-dashboard.search.brave.com/) and return the top 5 results.
- `read_file` — read a UTF-8 file from the local filesystem.
- `write_file` — write UTF-8 content to a local file.
- `bash` — run a shell command in the agent process cwd; returns exit code, stdout, and stderr. 30s timeout.
- `ask_questions` — ask the human user a follow-up question via stdin and return their answer.

## Prerequisites

- Node.js >= 20 (uses native `fetch` and `node:readline/promises`).
- An [OpenRouter API key](https://openrouter.ai/keys) (free tier works).
- A [Brave Search API key](https://api-dashboard.search.brave.com/app/keys) (free tier: 2,000 queries/month).

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and fill in `OPENROUTER_API_KEY` and `BRAVE_API_KEY`. Optionally override `OPENROUTER_MODEL`. If `BRAVE_API_KEY` is missing, `web_search` returns an error string and the rest of the agent still runs.

## Proxy

Set `PROXY` in `.env` or the shell environment to route all outbound HTTP through a proxy. The OpenRouter API client, `web_search`, and any other native `fetch` calls all honor it via undici's `ProxyAgent`.

```
PROXY=http://127.0.0.1:7890
```

When `PROXY` is set at startup, the agent prints `[proxy] using <url>` once.

## Run

```bash
npm start
```

Type a message at the `you>` prompt. Type `exit` to quit.

## Default model

Default: `meta-llama/llama-3.3-70b-instruct:free`. Fallback: `mistralai/mistral-small-3.1-24b-instruct:free`. Free models on OpenRouter rotate availability — if the default is throttled or removed, set `OPENROUTER_MODEL` in `.env` to any other free model that supports tool calling.

## Sample transcripts

### `web_search`

```
you> search the web for the latest Node.js LTS version
[14:02:11.083] [api →] POST chat/completions model=meta-llama/llama-3.3-70b-instruct:free messages=2 chars=180 tools=5
[14:02:12.391] [api ←] 1308ms finish=tool_calls tool_calls=1 tokens=312+24=336
[14:02:12.391] [tool →] web_search args={"query":"latest Node.js LTS version"}
[confirm] run web_search {"query":"latest Node.js LTS version"} [Y/n] y
[14:02:13.022] [tool ←] web_search 631ms result=1. Download Node.js®   https://nodejs.org/en/download   …
[14:02:13.022] [api →] POST chat/completions model=meta-llama/llama-3.3-70b-instruct:free messages=4 chars=1180 tools=5
[14:02:13.998] [api ←] 976ms finish=stop tool_calls=0 tokens=520+22=542
[14:02:13.998] [api ←] content: The latest Node.js LTS is 22.x ("Jod"), per nodejs.org.

assistant> The latest Node.js LTS is 22.x ("Jod"), per nodejs.org.
```

### `read_file`

```
you> read package.json and tell me the dependencies
[14:05:02.117] [api →] POST chat/completions model=… messages=2 chars=185 tools=5
[14:05:03.044] [api ←] 927ms finish=tool_calls tool_calls=1 tokens=305+18=323
[14:05:03.044] [tool →] read_file args={"path":"package.json"}
[confirm] run read_file {"path":"package.json"} [Y/n] y
[14:05:03.046] [fs] read /…/ai-agent/package.json (308 bytes)
[14:05:03.046] [tool ←] read_file 2ms result={ "name": "ai-agent", "version": "1.0.0", … }
[14:05:03.046] [api →] POST chat/completions … messages=4 …
[14:05:04.221] [api ←] 1175ms finish=stop tool_calls=0 …

assistant> Dependencies: openai ^4.77.0, dotenv ^16.4.5. Dev: tsx ^4.19.0, @types/node ^22.10.0.
```

### `write_file`

```
you> write "hello" to /tmp/agent-demo.txt
[14:06:31.402] [api →] POST chat/completions … messages=2 …
[14:06:32.310] [api ←] 908ms finish=tool_calls tool_calls=1 …
[14:06:32.310] [tool →] write_file args={"path":"/tmp/agent-demo.txt","content":"hello"}
[confirm] run write_file {"path":"/tmp/agent-demo.txt","content":"hello"} [Y/n] y
[14:06:32.312] [fs] wrote /tmp/agent-demo.txt (5 bytes)
[14:06:32.312] [tool ←] write_file 2ms result=Wrote 5 bytes to /tmp/agent-demo.txt
[14:06:32.312] [api →] POST chat/completions … messages=4 …
[14:06:33.005] [api ←] 693ms finish=stop tool_calls=0 …

assistant> Done. Wrote "hello" to /tmp/agent-demo.txt.
```

### `bash`

```
you> how many .ts files are in this directory
[14:07:01.044] [api →] POST chat/completions … messages=2 chars=190 tools=5
[14:07:01.812] [api ←] 768ms finish=tool_calls tool_calls=1 …
[14:07:01.812] [tool →] bash args={"command":"ls *.ts | wc -l"}
[confirm] run bash {"command":"ls *.ts | wc -l"} [Y/n] y
[14:07:02.840] [bash] exit=0 (3B stdout, 0B stderr)
[14:07:02.840] [tool ←] bash 1028ms result=exit=0 stdout: 1
[14:07:02.840] [api →] POST chat/completions … messages=4 …
[14:07:03.611] [api ←] 771ms finish=stop tool_calls=0 …

assistant> 1 .ts file (index.ts).
```

### `ask_questions`

```
you> recommend a paint color, but ask me what room it's for first
[14:08:12.044] [api →] POST chat/completions … messages=2 …
[14:08:12.961] [api ←] 917ms finish=tool_calls tool_calls=1 …
[14:08:12.961] [tool →] ask_questions args={"question":"What room is the paint for?"}
[confirm] run ask_questions {"question":"What room is the paint for?"} [Y/n] y

[agent asks] What room is the paint for?
> kitchen
[14:08:18.302] [tool ←] ask_questions 5341ms result=kitchen
[14:08:18.302] [api →] POST chat/completions … messages=4 …
[14:08:19.110] [api ←] 808ms finish=stop tool_calls=0 …

assistant> For a kitchen, try a warm off-white like Benjamin Moore "White Dove" — bright, easy to clean, pairs with most cabinetry.
```

## How it works

1. The OpenAI SDK is pointed at `https://openrouter.ai/api/v1`.
2. Tool schemas (JSONSchema) are sent with each chat request.
3. When the model returns `tool_calls`, the agent runs each tool locally and appends the result as a `role: "tool"` message.
4. The loop repeats until the model returns a normal text response.

### Tool call confirmation

Before running any tool, the agent prints a `[confirm] run <name> <args> [Y/n]` prompt and waits on stdin. Press Enter or type `y` to accept (Enter is the default); type `n` to decline. On decline the model receives the literal string `User declined to run this tool.` as the tool result, and the loop continues normally.

The whole loop is one `while` in `index.ts` — no abstractions hide it.

## Out of scope

Streaming, persistent history, path sandboxing for read/write, rate-limit handling, multi-agent orchestration, embeddings/RAG, paid models. Per-tool allowlists / "always allow" memory are also intentionally not implemented — every tool call asks. `bash` runs through `/bin/sh` and inherits `process.env`, so commands like `printenv` will see `OPENROUTER_API_KEY` and `BRAVE_API_KEY`; gating is the `[confirm]` prompt only. This is a learning artifact, not production code.
