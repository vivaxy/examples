/**
 * @since 20180918 13:40
 * @author vivaxy
 */
function buildCharsAndFreqs(input) {
  let chars = [];
  let freqs = [];
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const index = chars.indexOf(char);
    if (index !== -1) {
      freqs[index]++;
      continue;
    }

    chars.push(char);
    freqs.push(1);
  }
  return { chars, freqs };
}

function buildHuffmanTree(chars, freqs) {
  const PriorityQueue = require('../../priority-queue/implements/index.js');
  const { treeNode } = require('../../tree/implements/index.js');

  const priorityQueue = new PriorityQueue();
  for (let i = 0; i < chars.length; i++) {
    const node = treeNode({ char: chars[i], freq: freqs[i] });
    priorityQueue.add(node, node.freq);
  }

  for (let i = 0; i < chars.length - 1; i++) {
    const left = priorityQueue.poll();
    const right = priorityQueue.poll();
    const node = treeNode({ freq: left.val.freq + right.val.freq });
    node.left = left;
    node.right = right;
    priorityQueue.add(node, node.freq);
  }

  return priorityQueue.poll();
}

function buildCodeMap(chars, huffmanTree) {
  const map = {};
  traverse(huffmanTree, '', handleCode);
  return map;

  function traverse(node, code, handleCode) {
    if (node.val.char) {
      return handleCode(node.val.char, code);
    }
    if (node.left) {
      traverse(node.left, code + '0', handleCode);
    }
    if (node.right) {
      traverse(node.right, code + '1', handleCode);
    }
  }

  function handleCode(char, code) {
    map[char] = code;
  }
}

function compress(input) {
  const { chars, freqs } = buildCharsAndFreqs(input);
  const huffmanTree = buildHuffmanTree(chars, freqs);
  const codeMap = buildCodeMap(chars, huffmanTree);

  let compressed = '';
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    compressed += codeMap[char];
  }

  return { compressed, huffmanTree };
}

function decompress(input, huffmanTree) {
  let decompressed = '';
  let currentNode = huffmanTree;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === '0') {
      currentNode = currentNode.left;
    } else if (input[i] === '1') {
      currentNode = currentNode.right;
    }
    if (currentNode.val.char) {
      decompressed += currentNode.val.char;
      currentNode = huffmanTree;
    }
  }
  return decompressed;
}

exports.compress = compress;
exports.decompress = decompress;
