export interface Node {
  level: number; title: string; content: string; children: Node[];
}

export function parseTree(md: string): Node[] {
  const root: Node = { level: 0, title: '', content: '', children: [] };
  const stack: Node[] = [root];
  let buffer: string[] = [];
  const flush = () => {
    const top = stack[stack.length - 1];
    if (top) top.content = buffer.join('\n').trim();
    buffer = [];
  };
  for (const line of md.split('\n')) {
    const m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (m) {
      flush();
      const level = m[1]!.length;
      const title = m[2]!.trim();
      const node: Node = { level, title, content: '', children: [] };
      while (stack.length > 1 && stack[stack.length - 1]!.level >= level) stack.pop();
      stack[stack.length - 1]!.children.push(node);
      stack.push(node);
    } else buffer.push(line);
  }
  flush();
  return root.children;
}

export function directChildren(node: Node): Node[] {
  return node.children.filter((c) => c.level === node.level + 1);
}

export function indexByTitle(nodes: Node[]): Record<string, Node> {
  const out: Record<string, Node> = {};
  for (const n of nodes) out[n.title] = n;
  return out;
}

export function listItems(content: string): string[] {
  return content.split('\n').filter((l) => /^\s*-\s+\S/.test(l))
    .map((l) => l.replace(/^\s*-\s+/, '').trim());
}

export function inlineCode(content: string): string[] {
  const out: string[] = [];
  for (const m of content.matchAll(/`([^`\n]+)`/g)) out.push(m[1]!.trim());
  return out;
}

export function codeBlock(content: string): string | undefined {
  const m = /```(?:[a-zA-Z]*)\n([\s\S]*?)```/.exec(content);
  return m ? m[1]!.trim() : undefined;
}

export function metadata(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const m = /^\*\*([^:*]+):\*\*\s*(.*?)\s*$/.exec(line);
    if (m) out[m[1]!.trim().toLowerCase()] = m[2]!.trim();
  }
  return out;
}

export function flowSteps(block: string): string[] {
  return block.split('\n').map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^[↓|]+$/.test(l));
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`[parse-content] ${msg}`);
}
