"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";
import { uploadBlogImage } from "@/app/admin/actions";

type EditorMode = "write" | "split" | "preview";

export function MarkdownEditor({ initial = "", draftKey = "new" }: { initial?: string; draftKey?: string }) {
  const [value, setValue] = useState(initial);
  const [mode, setMode] = useState<EditorMode>("split");
  const [status, setStatus] = useState("Saved");
  const [uploadMessage, setUploadMessage] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const storageKey = `shivam-blog-draft:${draftKey}`;
  const preview = useMemo(() => {
    const body = String(marked.parse(value));
    return `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'"><style>body{font:15px/1.7 system-ui;margin:20px;color:CanvasText;background:Canvas}h1,h2,h3{line-height:1.2}pre{overflow:auto;padding:14px;border-radius:12px;background:ButtonFace;color:ButtonText}blockquote{margin-left:0;padding-left:14px;border-left:3px solid Highlight;color:GrayText}img{max-width:100%}</style>${body}`;
  }, [value]);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 220));

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && saved !== initial) { setValue(saved); setStatus("Draft restored from this browser"); }
    } catch { /* local drafts are an optional convenience */ }
  }, [initial, storageKey]);

  useEffect(() => {
    if (value === initial) return;
    setStatus("Unsaved changes");
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(storageKey, value); setStatus("Draft saved in this browser"); }
      catch { setStatus("Unsaved changes"); }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [initial, storageKey, value]);

  useEffect(() => {
    const form = textarea.current?.form;
    if (!form) return;
    const onSubmit = () => { try { localStorage.removeItem(storageKey); } catch { /* storage may be unavailable */ } };
    form.addEventListener("submit", onSubmit);
    const onBeforeUnload = (event: BeforeUnloadEvent) => { if (value !== initial) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => { form.removeEventListener("submit", onSubmit); window.removeEventListener("beforeunload", onBeforeUnload); };
  }, [initial, storageKey, value]);

  const insert = (before: string, after = "", prefixLine = false, direct = false) => {
    const input = textarea.current;
    if (!input) return;
    const start = input.selectionStart; const end = input.selectionEnd;
    const selected = value.slice(start, end);
    const replacement = direct ? before : prefixLine ? `${before}${selected || "Heading"}` : `${before}${selected || "text"}${after}`;
    const next = value.slice(0, start) + replacement + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + replacement.length, start + replacement.length); });
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    const alt = window.prompt("Describe this image for screen readers");
    if (!alt?.trim()) { setUploadMessage("Add a short image description to continue."); return; }
    setUploadMessage("Uploading image…");
    const form = new FormData(); form.set("content_image_file", file);
    const result = await uploadBlogImage(form);
    if (!result.url) { setUploadMessage(result.error || "Upload failed."); return; }
    insert(`![${alt.trim().replace(/[\]\n]/g, " ")}](${result.url})`, "", false, true);
    setUploadMessage("Image added to the article.");
    if (fileInput.current) fileInput.current.value = "";
  };

  return <div className={`markdown-editor markdown-editor-${mode}`}>
    <div className="markdown-editor-toolbar" role="toolbar" aria-label="Markdown formatting">
      <button type="button" onClick={() => insert("## ", "", true)}>H2</button><button type="button" onClick={() => insert("**", "**")}>Bold</button><button type="button" onClick={() => insert("*", "*")}>Italic</button><button type="button" onClick={() => insert("> ", "", true)}>Quote</button><button type="button" onClick={() => insert("- ", "", true)}>List</button><button type="button" onClick={() => insert("```text\n", "\n```")}>Code</button><button type="button" onClick={() => insert("[", "](https://)")}>Link</button><button type="button" onClick={() => fileInput.current?.click()}>Image upload</button>
      <input ref={fileInput} className="markdown-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/avif" onChange={(event) => void uploadImage(event.target.files?.[0])}/>
    </div>
    <div className="markdown-editor-status"><span aria-live="polite">{status}</span><span>{words} words · {readingTime} min read</span>{uploadMessage && <span aria-live="polite">{uploadMessage}</span>}</div>
    <div className="markdown-editor-modes" role="tablist" aria-label="Editor view">{(["write", "split", "preview"] as EditorMode[]).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => setMode(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    <div className="markdown-editor-panes">
      {mode !== "preview" && <div><label htmlFor={`blog-content-${draftKey}`}>Markdown</label><textarea ref={textarea} id={`blog-content-${draftKey}`} name="content_md" rows={18} value={value} onChange={(event) => setValue(event.target.value)} /></div>}
      {mode !== "write" && <div><span>Live preview</span><iframe title="Markdown preview" sandbox="" srcDoc={preview} /></div>}
    </div>
  </div>;
}
