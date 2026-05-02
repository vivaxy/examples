/**
 * @since 2026-05-02
 * @author vivaxy
 */
import 'dotenv/config';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import OpenAI from 'openai';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';

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
        'Search the web via DuckDuckGo and return the top results (title, URL, snippet).',
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
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: 'https://duckduckgo.com/',
  };
  let html: string;
  try {
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers,
      body: `q=${encodeURIComponent(query)}&b=&kl=us-en`,
      redirect: 'follow',
    });
    if (!res.ok) return `web_search failed: HTTP ${res.status}`;
    html = await res.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const cause = (err as { cause?: { message?: string } })?.cause?.message;
    return `web_search network error: ${msg}${cause ? ` (${cause})` : ''}`;
  }
  const stripped = (s: string) =>
    s
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();
  const resolveUrl = (raw: string) => {
    let u = raw.startsWith('//') ? 'https:' + raw : raw;
    if (u.includes('duckduckgo.com/l/')) {
      try {
        const parsed = new URL(u);
        return parsed.searchParams.get('uddg') ?? u;
      } catch {
        return u;
      }
    }
    return u;
  };
  const results: { title: string; url: string; snippet: string }[] = [];
  const blockRe =
    /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = blockRe.exec(html)) && results.length < 5) {
    results.push({
      url: resolveUrl(match[1]),
      title: stripped(match[2]),
      snippet: stripped(match[3]),
    });
  }
  if (!results.length) {
    const anchorRe =
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = anchorRe.exec(html)) && results.length < 5) {
      results.push({
        url: resolveUrl(m[1]),
        title: stripped(m[2]),
        snippet: '',
      });
    }
  }
  if (!results.length) {
    const blocked = /anomaly|unusual traffic|bot|captcha/i.test(html)
      ? ' (blocked?)'
      : '';
    return `No results${blocked}.`;
  }
  return results
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet}`)
    .join('\n');
}

function log(tag: string, msg: string) {
  const t = new Date().toISOString().slice(11, 23);
  console.error(`[${t}] [${tag}] ${msg}`);
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

async function runTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  try {
    if (name === 'web_search') return await webSearch(String(args.query));
    if (name === 'read_file') return await readFile(String(args.path));
    if (name === 'write_file')
      return await writeFile(String(args.path), String(args.content));
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
        'You are a helpful assistant with access to tools: web_search, read_file, write_file, ask_questions. Use them when needed. Keep responses concise.',
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
