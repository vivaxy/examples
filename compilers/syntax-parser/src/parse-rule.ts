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
enum NodeType {
  RegExp,
  String,
  Rule,
  Start,
  End,
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
  currentPath: Node[];

  constructor(rules: string) {
    this.startNode = new Node(NodeType.Start);
    this.currentPath = [];
    this.parse(rules);
  }

  parse(rules: string) {
    for (const rule of rules.split(';').filter(Boolean)) {
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
            n = new Node(NodeType.RegExp, new RegExp(optionNode.slice(1, -1)));
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
      this.startNode.nextNodes.push(ruleNode);
    }
  }
}

export default function parseRule(rule: string): Rule {
  return new Rule(rule);
}
