import { createElement, type ReactNode } from "react";

const ALLOWED_TAGS = new Set(["p", "strong", "b", "i", "em", "br"]);
const VOID_TAGS = new Set(["br"]);
const TAG_PATTERN = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code[0] !== "#") return ENTITIES[code.toLowerCase()] ?? entity;
    const value =
      code[1] === "x" || code[1] === "X"
        ? Number.parseInt(code.slice(2), 16)
        : Number(code.slice(1));
    return Number.isNaN(value) ? entity : String.fromCodePoint(value);
  });
}

type Node = { tag: string; children: ReactNode[] };

export function parseHtml(html: string): ReactNode[] {
  const root: Node = { tag: "", children: [] };
  const stack: Node[] = [root];
  let key = 0;
  let cursor = 0;

  const pushText = (text: string) => {
    if (text) stack[stack.length - 1].children.push(decodeEntities(text));
  };

  const close = () => {
    const node = stack.pop() as Node;
    stack[stack.length - 1].children.push(
      createElement(node.tag, { key: key++ }, ...node.children),
    );
  };

  for (const match of html.matchAll(TAG_PATTERN)) {
    pushText(html.slice(cursor, match.index));
    cursor = match.index + match[0].length;

    const [, slash, rawTag] = match;
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) continue;

    if (VOID_TAGS.has(tag)) {
      if (!slash) stack[stack.length - 1].children.push(<br key={key++} />);
    } else if (!slash) {
      stack.push({ tag, children: [] });
    } else if (stack.some((node) => node.tag === tag)) {
      while (stack[stack.length - 1].tag !== tag) close();
      close();
    }
  }

  pushText(html.slice(cursor));
  while (stack.length > 1) close();

  return root.children;
}

type HtmlContentProps = {
  html: string;
  className?: string;
};

export function HtmlContent({ html, className }: HtmlContentProps) {
  return <div className={className}>{parseHtml(html)}</div>;
}
