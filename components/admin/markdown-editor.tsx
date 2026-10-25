"use client";

import { useMemo, useState } from "react";
import { marked } from "marked";

export function MarkdownEditor({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const preview = useMemo(() => {
    const body = String(marked.parse(value));
    return `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'"><style>body{font:15px/1.7 system-ui;margin:20px;color:#1d1d1f}h1,h2,h3{line-height:1.2}pre{overflow:auto;padding:14px;border-radius:12px;background:#17171a;color:#f5f5f7}blockquote{margin-left:0;padding-left:14px;border-left:3px solid #0071e3;color:#555}img{max-width:100%}</style>${body}`;
  }, [value]);
  return <div className="markdown-editor"><div><label htmlFor="blog-content">Markdown</label><textarea id="blog-content" name="content_md" rows={18} value={value} onChange={(event) => setValue(event.target.value)} /></div><div><span>Live preview</span><iframe title="Markdown preview" sandbox="" srcDoc={preview} /></div></div>;
}
