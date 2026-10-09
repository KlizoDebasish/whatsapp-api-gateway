"use client";

import React from "react";

interface WhatsAppTextProps {
  text: string;
  className?: string;
}

/**
 * WhatsAppText parses and renders WhatsApp formatted text:
 * - Bold: *text* (or **text**) -> <strong>text</strong> with asterisks stripped cleanly
 * - Italic: _text_ -> <em>text</em> with underscores stripped
 * - Strikethrough: ~text~ -> <del>text</del> with tildes stripped
 * - Code block: ```code``` -> <pre><code>code</code></pre>
 * - Inline code: `code` -> <code>code</code>
 * - Links: https://... -> <a> link
 */
export function WhatsAppText({ text, className }: WhatsAppTextProps) {
  if (!text) return null;

  // Regex matches:
  // 1) Multi-line code block: ```...```
  // 2) Inline code: `...`
  // 3) Bold: *...* or **...** (cannot start or end with whitespace)
  // 4) Strikethrough: ~...~ (cannot start or end with whitespace)
  // 5) Italics: _..._ bounded by start/space/( and end/space/punct/)
  // 6) URL: http:// or https://
  const pattern = /(```[\s\S]*?```|`[^`\n]+?`|\*{1,}(?!\s)[^*\n]+?(?<!\s)\*{1,}|~(?!\s)[^~\n]+?(?<!\s)~|(?:^|(?<=[\s(]))_(?!\s)[^_\n]+?(?<!\s)_(?=[\s).,!?;:]|$)|https?:\/\/[^\s]+)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token.length}`;

    if (token.startsWith("```") && token.endsWith("```")) {
      const code = token.slice(3, -3).replace(/^\n+|\n+$/g, "");
      elements.push(
        <pre
          key={key}
          className="font-mono text-[11px] bg-black/10 dark:bg-white/10 p-2 rounded my-1 overflow-x-auto whitespace-pre"
        >
          {code}
        </pre>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const code = token.slice(1, -1);
      elements.push(
        <code
          key={key}
          className="font-mono text-[11px] bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded"
        >
          {code}
        </code>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      // Bold: strip all asterisks cleanly so the user sees clean plain bold text
      const content = token.replace(/^\*+|\*+$/g, "");
      elements.push(
        <strong key={key} className="font-bold text-inherit">
          {content}
        </strong>
      );
    } else if (token.startsWith("~") && token.endsWith("~")) {
      const content = token.slice(1, -1);
      elements.push(
        <del key={key} className="line-through opacity-80">
          {content}
        </del>
      );
    } else if (token.startsWith("_") && token.endsWith("_")) {
      const content = token.slice(1, -1);
      elements.push(
        <em key={key} className="italic">
          {content}
        </em>
      );
    } else if (token.startsWith("http://") || token.startsWith("https://")) {
      elements.push(
        <a
          key={key}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 break-all text-blue-600 dark:text-blue-400"
        >
          {token}
        </a>
      );
    } else {
      elements.push(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return <span className={className}>{elements}</span>;
}

export default WhatsAppText;
