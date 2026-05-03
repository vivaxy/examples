/**
 * @since 2026-05-02
 * @author vivaxy
 */
import 'dotenv/config';
import { exec } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promisify } from 'node:util';
import OpenAI from 'openai';
import { ProxyAgent, setGlobalDispatcher } from 'undici';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

const proxy = process.env.PROXY;
if (proxy) {
  setGlobalDispatcher(new ProxyAgent(proxy));
  console.error(`[proxy] using ${proxy}`);
}

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
  console.error(
    'OPENROUTER_API_KEY is not set. Copy .env.example to .env and fill it in.',
  );
  process.exit(1);
}

const model =
  process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free';

const client = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
});

const rl = readline.createInterface({ input, output });

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description:
        'Search the web via Brave Search and return the top results (title, URL, snippet).',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The search query.' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Read a UTF-8 text file from the local filesystem.',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read.' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'write_file',
      description: 'Write UTF-8 text content to a local file (overwrites).',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to write.' },
          content: { type: 'string', description: 'Content to write.' },
        },
        required: ['path', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'bash',
      description:
        'Run a shell command in the agent process cwd and return exit code, stdout, and stderr. Times out at 30s.',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Shell command to run.' },
        },
        required: ['command'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'ask_questions',
      description:
        'Ask the human user a clarifying question via stdin and return their answer.',
      parameters: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: 'The question to ask the user.',
          },
        },
        required: ['question'],
      },
    },
  },
];

async function webSearch(query: string): Promise<string> {
  const braveApiKey = process.env.BRAVE_API_KEY;
  if (!braveApiKey) {
    return 'web_search failed: BRAVE_API_KEY is not set in .env';
  }
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', '5');
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': braveApiKey,
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause = (err as { cause?: { message?: string } })?.cause?.message;
    return `web_search network error: ${msg}${cause ? ` (${cause})` : ''}`;
  }
  if (!res.ok) {
    const body = await res.text();
    return `web_search failed: HTTP ${res.status} ${preview(body)}`;
  }
  const data = (await res.json()) as {
    web?: {
      results?: { title?: string; url?: string; description?: string }[];
    };
  };
  const results = data.web?.results ?? [];
  if (!results.length) return 'No results.';
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, '');
  return results
    .slice(0, 5)
    .map(
      (r, i) =>
        `${i + 1}. ${stripTags(r.title ?? '')}\n   ${
          r.url ?? ''
        }\n   ${stripTags(r.description ?? '')}`,
    )
    .join('\n');
}

function localTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

function log(tag: string, msg: string) {
  console.error(`[${localTime()}] [${tag}] ${msg}`);
}

function preview(s: string, n = 200) {
  const oneLine = s.replace(/\s+/g, ' ').trim();
  return oneLine.length > n ? oneLine.slice(0, n) + '…' : oneLine;
}

async function readFile(filePath: string): Promise<string> {
  const resolved = path.resolve(process.cwd(), filePath);
  const content = await fs.readFile(resolved, 'utf8');
  log('fs', `read ${resolved} (${Buffer.byteLength(content, 'utf8')} bytes)`);
  return content.length > 8000
    ? content.slice(0, 8000) + '\n... [truncated]'
    : content;
}

async function writeFile(filePath: string, content: string): Promise<string> {
  const resolved = path.resolve(process.cwd(), filePath);
  await fs.writeFile(resolved, content, 'utf8');
  const bytes = Buffer.byteLength(content, 'utf8');
  log('fs', `wrote ${resolved} (${bytes} bytes)`);
  return `Wrote ${bytes} bytes to ${resolved}`;
}

async function askQuestions(question: string): Promise<string> {
  const answer = await rl.question(`\n[agent asks] ${question}\n> `);
  return answer;
}

const execAsync = promisify(exec);

async function runBash(command: string): Promise<string> {
  const truncate = (s: string, n: number) =>
    s.length > n ? s.slice(0, n) + '\n... [truncated]' : s;
  const format = (code: number | string, stdout: string, stderr: string) =>
    `exit=${code}\nstdout:\n${truncate(stdout, 8000)}${
      stderr ? `\nstderr:\n${truncate(stderr, 2000)}` : ''
    }`;
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 30000,
      maxBuffer: 8 * 1024 * 1024,
    });
    log(
      'bash',
      `exit=0 (${Buffer.byteLength(stdout)}B stdout, ${Buffer.byteLength(
        stderr,
      )}B stderr)`,
    );
    return format(0, stdout, stderr);
  } catch (err) {
    const e = err as {
      code?: number | string;
      signal?: string;
      killed?: boolean;
      stdout?: string;
      stderr?: string;
      message?: string;
    };
    const timedOut = e.killed && e.signal === 'SIGTERM';
    const code = timedOut
      ? `timeout after 30s (SIGTERM)`
      : e.code ?? e.signal ?? 'error';
    log('bash', `exit=${code}`);
    return format(code, e.stdout ?? '', e.stderr ?? e.message ?? '');
  }
}

async function confirmTool(
  name: string,
  args: Record<string, unknown>,
): Promise<boolean> {
  const argsPreview = preview(JSON.stringify(args));
  const answer = await rl.question(
    `[confirm] run ${name} ${argsPreview} [Y/n] `,
  );
  return !answer.trim().toLowerCase().startsWith('n');
}

async function runTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  if (!(await confirmTool(name, args))) {
    return 'User declined to run this tool.';
  }
  try {
    if (name === 'web_search') return await webSearch(String(args.query));
    if (name === 'read_file') return await readFile(String(args.path));
    if (name === 'write_file')
      return await writeFile(String(args.path), String(args.content));
    if (name === 'bash') return await runBash(String(args.command));
    if (name === 'ask_questions')
      return await askQuestions(String(args.question));
    return `Unknown tool: ${name}`;
  } catch (err) {
    return `Error in ${name}: ${
      err instanceof Error ? err.message : String(err)
    }`;
  }
}

async function step(messages: ChatCompletionMessageParam[]): Promise<string> {
  while (true) {
    const totalChars = messages.reduce(
      (n, m) => n + (typeof m.content === 'string' ? m.content.length : 0),
      0,
    );
    log(
      'api →',
      `POST chat/completions model=${model} messages=${messages.length} chars=${totalChars} tools=${tools.length}`,
    );
    const t0 = Date.now();
    const completion = await client.chat.completions.create({
      model,
      messages,
      tools,
    });
    const dt = Date.now() - t0;
    const choice = completion.choices[0];
    const message = choice.message;
    const usage = completion.usage;
    log(
      'api ←',
      `${dt}ms finish=${choice.finish_reason} tool_calls=${
        message.tool_calls?.length ?? 0
      }` +
        (usage
          ? ` tokens=${usage.prompt_tokens}+${usage.completion_tokens}=${usage.total_tokens}`
          : ''),
    );
    if (message.content) log('api ←', `content: ${preview(message.content)}`);
    messages.push(message);
    if (!message.tool_calls?.length) {
      return message.content ?? '';
    }
    for (const call of message.tool_calls) {
      if (call.type !== 'function') continue;
      log(
        'tool →',
        `${call.function.name} args=${preview(call.function.arguments)}`,
      );
      let result: string;
      const ts = Date.now();
      try {
        const args = JSON.parse(call.function.arguments || '{}');
        result = await runTool(call.function.name, args);
      } catch (err) {
        result = `Invalid arguments: ${
          err instanceof Error ? err.message : String(err)
        }`;
      }
      log(
        'tool ←',
        `${call.function.name} ${Date.now() - ts}ms result=${preview(result)}`,
      );
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: result,
      });
    }
  }
}

async function main() {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'You are a helpful assistant with access to tools: web_search, read_file, write_file, bash, ask_questions. Use them when needed. Keep responses concise.',
    },
  ];

  console.log(`AI Agent (model: ${model})`);
  console.log('Type your message. Type "exit" to quit.\n');

  rl.on('close', () => process.exit(0));

  while (true) {
    let userInput: string;
    try {
      userInput = await rl.question('you> ');
    } catch {
      break;
    }
    const trimmed = userInput.trim();
    if (!trimmed) continue;
    if (trimmed === 'exit') break;
    messages.push({ role: 'user', content: trimmed });
    try {
      const reply = await step(messages);
      console.log(`\nassistant> ${reply}\n`);
    } catch (err) {
      console.error(
        `Error: ${err instanceof Error ? err.message : String(err)}\n`,
      );
    }
  }
  rl.close();
}

main();
