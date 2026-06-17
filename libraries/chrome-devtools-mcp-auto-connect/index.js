import { execFile, spawn } from 'node:child_process';

const DEFAULT_TIMEOUT_MS = 60_000;
const LOG_FILE = '/tmp/chrome-devtools-mcp-auto-connect.log';
const MINIMUM_NODE_VERSION = [20, 19, 0];
const REMOTE_DEBUGGING_PROMPT_TITLE = 'Allow remote debugging?';
const AUTO_ALLOW_INTERVAL_MS = 250;
const AUTO_ALLOW_CLICK_COOLDOWN_MS = 1_000;

function hasSupportedNodeVersion() {
  const [major, minor, patch] = process.versions.node
    .split('.')
    .map((part) => Number(part));
  const [minimumMajor, minimumMinor, minimumPatch] = MINIMUM_NODE_VERSION;

  if (major !== minimumMajor) {
    return major > minimumMajor;
  }
  if (minor !== minimumMinor) {
    return minor > minimumMinor;
  }
  return patch >= minimumPatch;
}

if (!hasSupportedNodeVersion()) {
  console.error(
    `Node ${process.versions.node} is too old for chrome-devtools-mcp.`,
  );
  console.error('Use Node 20.19.0 or newer. This example includes .nvmrc.');
  process.exit(1);
}

function getFlagValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  return process.argv[index + 1];
}

const timeoutMs = Number(getFlagValue('--timeout-ms') || DEFAULT_TIMEOUT_MS);
const showPages = process.argv.includes('--show-pages');
const autoAllow = !process.argv.includes('--no-auto-allow');

const server = spawn(
  'npx',
  ['-y', 'chrome-devtools-mcp@latest', '--autoConnect', '--logFile', LOG_FILE],
  {
    stdio: ['pipe', 'pipe', 'pipe'],
  },
);

let nextId = 1;
let stdoutBuffer = '';
let stderrBuffer = '';
const pending = new Map();
let autoAllowTimer;
let autoAllowInFlight = false;
let lastAutoAllowClickAt = 0;

function writeMessage(message) {
  server.stdin.write(`${JSON.stringify(message)}\n`);
}

function send(method, params = {}) {
  const id = nextId;
  nextId += 1;
  writeMessage({ jsonrpc: '2.0', id, method, params });
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, method });
  });
}

function notify(method, params = {}) {
  writeMessage({ jsonrpc: '2.0', method, params });
}

function handleMessage(message) {
  if (!message.id || !pending.has(message.id)) {
    return;
  }
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) {
    reject(new Error(JSON.stringify(message.error)));
    return;
  }
  resolve(message.result);
}

function handleStdout(chunk) {
  stdoutBuffer += chunk.toString();
  let newlineIndex = stdoutBuffer.indexOf('\n');

  while (newlineIndex !== -1) {
    const line = stdoutBuffer.slice(0, newlineIndex).trim();
    stdoutBuffer = stdoutBuffer.slice(newlineIndex + 1);

    if (line) {
      handleMessage(JSON.parse(line));
    }

    newlineIndex = stdoutBuffer.indexOf('\n');
  }
}

function readTextContent(result) {
  return (
    result.content
      ?.map((item) => {
        if (item.type !== 'text') {
          return '';
        }
        return item.text || '';
      })
      .join('\n') || ''
  );
}

function countPages(text) {
  return (text.match(/^\d+:/gm) || []).length;
}

function execFileText(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function findRemoteDebuggingAllowButton() {
  const script = `
tell application "Google Chrome" to activate
delay 0.1

tell application "System Events"
  if not (exists process "Google Chrome") then return ""

  tell process "Google Chrome"
    set frontmost to true

    repeat with targetWindow in windows
      try
        repeat with candidateElement in UI elements of targetWindow
          try
            if role of candidateElement is "AXSheet" and name of candidateElement is "${REMOTE_DEBUGGING_PROMPT_TITLE}" then
              set buttonGroup to UI element 2 of UI element 2 of UI element 1 of UI element 1 of UI element 1 of candidateElement
              set targetButton to button 3 of buttonGroup
              if description of targetButton is "Allow" then
                set buttonPosition to position of targetButton
                set buttonSize to size of targetButton
                return (item 1 of buttonPosition as text) & "," & (item 2 of buttonPosition as text) & "," & (item 1 of buttonSize as text) & "," & (item 2 of buttonSize as text)
              end if
            end if
          end try
        end repeat
      end try
    end repeat
  end tell
end tell

return ""
`;

  const output = await execFileText('osascript', ['-e', script]);
  if (!output) {
    return undefined;
  }

  const [x, y, width, height] = output
    .split(',')
    .map((part) => Number(part.trim()));

  if ([x, y, width, height].some((value) => Number.isNaN(value))) {
    return undefined;
  }

  return {
    x: x + width / 2,
    y: y + height / 2,
  };
}

async function clickAtPosition({ x, y }) {
  const script = `
ObjC.import('CoreGraphics');

const point = $.CGPointMake(${x}, ${y});
const down = $.CGEventCreateMouseEvent(
  null,
  $.kCGEventLeftMouseDown,
  point,
  $.kCGMouseButtonLeft,
);
const up = $.CGEventCreateMouseEvent(
  null,
  $.kCGEventLeftMouseUp,
  point,
  $.kCGMouseButtonLeft,
);

$.CGEventPost($.kCGHIDEventTap, down);
delay(0.08);
$.CGEventPost($.kCGHIDEventTap, up);
`;

  await execFileText('osascript', ['-l', 'JavaScript', '-e', script]);
}

function startAutoAllowRemoteDebugging() {
  if (!autoAllow || process.platform !== 'darwin') {
    return;
  }

  autoAllowTimer = setInterval(async () => {
    if (autoAllowInFlight) {
      return;
    }
    if (Date.now() - lastAutoAllowClickAt < AUTO_ALLOW_CLICK_COOLDOWN_MS) {
      return;
    }

    autoAllowInFlight = true;
    try {
      const position = await findRemoteDebuggingAllowButton();
      if (position) {
        await clickAtPosition(position);
        lastAutoAllowClickAt = Date.now();
        console.log(
          `Clicked Chrome "${REMOTE_DEBUGGING_PROMPT_TITLE}" prompt.`,
        );
      }
    } catch {
      // The prompt is absent during most polling intervals.
    } finally {
      autoAllowInFlight = false;
    }
  }, AUTO_ALLOW_INTERVAL_MS);
}

function cleanup() {
  if (autoAllowTimer) {
    clearInterval(autoAllowTimer);
  }
  if (!server.killed) {
    server.kill('SIGTERM');
  }
}

function fail(error) {
  cleanup();
  console.error('Chrome DevTools MCP auto-connect failed.');
  console.error(error.message);
  console.error(`Log file: ${LOG_FILE}`);
  if (stderrBuffer.trim()) {
    console.error(stderrBuffer.trim());
  }
  process.exitCode = 1;
}

server.stdout.on('data', handleStdout);

server.stderr.on('data', (chunk) => {
  stderrBuffer += chunk.toString();
});

server.on('exit', (code, signal) => {
  for (const { reject, method } of pending.values()) {
    reject(
      new Error(
        `MCP server exited during ${method}: code=${code} signal=${signal}`,
      ),
    );
  }
  pending.clear();
});

startAutoAllowRemoteDebugging();

const timeout = setTimeout(() => {
  fail(
    new Error(
      [
        `Timed out after ${timeoutMs}ms.`,
        autoAllow
          ? `The script did not find a Chrome "${REMOTE_DEBUGGING_PROMPT_TITLE}" prompt to allow.`
          : `If Chrome shows "${REMOTE_DEBUGGING_PROMPT_TITLE}", click Allow and run again.`,
      ].join(' '),
    ),
  );
}, timeoutMs);

try {
  const initialize = await send('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: {
      name: 'chrome-devtools-mcp-auto-connect-example',
      version: '1.0.0',
    },
  });

  notify('notifications/initialized');

  const tools = await send('tools/list');
  const toolNames = tools.tools.map((tool) => tool.name);
  const listPages = await send('tools/call', {
    name: 'list_pages',
    arguments: {},
  });
  const pagesText = readTextContent(listPages);

  clearTimeout(timeout);

  console.log('Chrome DevTools MCP auto-connect succeeded.');
  console.log(`Server: ${initialize.serverInfo.title}`);
  console.log(`Version: ${initialize.serverInfo.version}`);
  console.log(`Tools: ${toolNames.length}`);
  console.log(`Pages: ${countPages(pagesText)}`);
  console.log(`Log file: ${LOG_FILE}`);

  if (showPages) {
    console.log('');
    console.log(pagesText);
  }

  cleanup();
} catch (error) {
  clearTimeout(timeout);
  fail(error);
}
