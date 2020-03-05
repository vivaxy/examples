/**
 * @since 2020-03-04 10:08
 * @author vivaxy
 * Rule is a graph with start and end
 * start ------> (node1 + node2 + node3) -----> end
 * start -------> (node6) ------------------> end
 * node3: node5 + node6
 * node2: node4 | node4 + node2
 *
 * Node can be same
 * Node can be recursed
 */
import { Token } from './tokenize';

enum NodeType {
  RegExp = 'RegExp',
  String = 'String',
  Rule = 'Rule',
  Start = 'Start',
  End = 'End',
}

type NodeValue = RegExp | String | null;

export class Node {
  type: NodeType;
  value: NodeValue;
  nextNodes: Node[];

  constructor(type: NodeType, value: NodeValue = null) {
    this.type = type;
    this.value = value;
    this.nextNodes = [];
  }
}

function trim(v: string) {
  return v.trim();
}

export class Rule {
  startNode: Node;
  paths: Node[][];

  constructor(ruleText: string) {
    this.startNode = new Node(NodeType.Start);
    const startNodes = this.parse(ruleText);
    this.startNode.nextNodes = [...startNodes];
    this.paths = this.startNode.nextNodes.map(function(node) {
      return [node];
    });
  }

  parse(rules: string) {
    // TODO: support ; | ::= within quotes
    const startNodes: Node[] = [];
    for (const rule of rules
      .split(';')
      .map(trim)
      .filter(Boolean)) {
      const [name, detail] = rule.split('::=').map(trim);
      const ruleNode = new Node(NodeType.Rule, name);
      for (const optionPath of detail.split('|')) {
        let rootNode: Node | null = null;
        let currentNode: Node | null = null;
        const option = optionPath.trim();
        for (const optionNode of option
          .split(' ')
          .map(trim)
          .filter(Boolean)) {
          let n: Node;
          if (
            (optionNode.startsWith("'") && optionNode.endsWith("'")) ||
            (optionNode.startsWith('"') && optionNode.endsWith('"'))
          ) {
            n = new Node(NodeType.String, optionNode.slice(1, -1));
          } else if (optionNode.startsWith('/') && optionNode.endsWith('/')) {
            n = new Node(
              NodeType.RegExp,
              new RegExp(`^(${optionNode.slice(1, -1)})`),
            );
          } else {
            n = new Node(NodeType.Rule, optionNode);
          }
          if (currentNode) {
            currentNode.nextNodes.push(n);
          } else {
            rootNode = n;
          }
          currentNode = n;
        }

        if (rootNode) {
          ruleNode.nextNodes.push(rootNode);
        }
      }
      startNodes.push(ruleNode);
    }
    return startNodes;
  }

  getRules() {
    const rules: Record<string, Node[]> = {};
    this.startNode.nextNodes.forEach(function(node) {
      rules[node.value as string] = node.nextNodes;
    });
    return rules;
  }

  match(node: Node, token: Token): boolean {
    if (node.type === NodeType.Rule) {
      const matchedNodes = node.nextNodes.filter((nextNode) => {
        return this.match(nextNode, token);
      });
      return matchedNodes.length > 0;
    } else if (node.type === NodeType.String) {
      return node.value === token.value;
    } else if (node.type === NodeType.RegExp) {
      return (node.value as RegExp).test(token.value);
    }
    throw new Error(
      'Unexpected node: type: ' + node.type + ', value: ' + node.value,
    );
  }

  takeToken(token: Token): boolean {
    let pathIndex = 0;
    while (pathIndex < this.paths.length) {
      const path = this.paths[pathIndex];
      const lastNode = path[path.length - 1];
      const matchedNextNodes: Node[] = [];
      for (const nextNode of lastNode.nextNodes) {
        if (this.match(nextNode, token)) {
          matchedNextNodes.push(nextNode);
        }
      }
      const newPaths: Node[][] = matchedNextNodes.map(function(
        matchedNextNode,
      ) {
        return [...path, matchedNextNode];
      });
      this.paths.splice(pathIndex, 1, ...newPaths);
      pathIndex += newPaths.length;
    }
    return this.paths.length > 0;
  }
}

export default function parseRule(rule: string): Rule {
  return new Rule(rule);
}
