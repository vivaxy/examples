/**
 * @since 2025-07-17 16:34
 * @author vivaxy
 */
import {
  run,
  // @ts-expect-error benchmark
} from 'https://unpkg.com/@vivaxy/framework/utils/benchmark.js';

function blob(str) {
  return new Blob([str]).size;
}

function textEncoder(str) {
  return new TextEncoder().encode(str).length;
}

function textEncoderEncodeInto(str) {
  const u8array = new Uint8Array(str.length * 4);
  return new TextEncoder().encodeInto(str, u8array).written;
}

async function main(str) {
  if (
    blob(str) !== textEncoder(str) ||
    textEncoder(str) !== textEncoderEncodeInto(str)
  ) {
    console.log(
      'error',
      blob(str),
      textEncoder(str),
      textEncoderEncodeInto(str),
    );
  }

  const blobCost = await run(function () {
    blob(str);
  });

  const textEncoderCost = await run(function () {
    textEncoder(str);
  });

  const textEncoderEncodeIntoCost = await run(function () {
    textEncoderEncodeInto(str);
  });

  console.log(
    `Blob cost ${blobCost}; TextEncoder cost ${textEncoderCost}; TextEncoder.encodeInto cost ${textEncoderEncodeIntoCost}`,
  );
}

await main('1中👏');
await main(
  'abc123你好世界🌍🚀✨💡的一是在不了有和人这中大为上个国我以要他😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😌😍😘'.repeat(
    100000,
  ),
);
