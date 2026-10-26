"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { drawShareCard, SHARE_FORMATS, SHARE_TEMPLATES, type ShareFormat, type ShareItem, type ShareTemplate } from "@/lib/share-card.mjs";

type ShareRequest = ShareItem & { url?: string; fileName?: string };

const templateOrder: ShareTemplate[] = ["aurora", "sunrise", "ocean", "paper"];

function shareCaption(item: ShareRequest) {
  const url = item.url || `${window.location.origin}${item.path || ""}`;
  return `${item.title}\n\n${item.description || ""}\n\n${url}`;
}

function slugFileName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "shivam-shukla";
}

export function ShareDesigner({ defaultTemplate = "aurora" }: { defaultTemplate?: ShareTemplate }) {
  const [item, setItem] = useState<ShareRequest | null>(null);
  const [format, setFormat] = useState<ShareFormat>("story");
  const [template, setTemplate] = useState<ShareTemplate>(defaultTemplate);
  const [safeArea, setSafeArea] = useState(true);
  const [message, setMessage] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const close = useCallback(() => { setItem(null); setMessage(""); }, []);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<ShareRequest>).detail;
      if (!detail || typeof detail.title !== "string") return;
      setItem({ ...detail, author: detail.author || "Shivam Shukla", site: detail.site || "shivamshukla.site" });
      setFormat("story");
      setTemplate(defaultTemplate);
      setSafeArea(true);
      setMessage("");
    };
    window.addEventListener("share:open", onOpen);
    return () => window.removeEventListener("share:open", onOpen);
  }, [defaultTemplate]);

  useEffect(() => {
    if (!item) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = SHARE_FORMATS[format];
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (context) drawShareCard(context, item, format, template);
  }, [item, format, template]);

  const getBlob = () => new Promise<Blob | null>((resolve) => canvasRef.current?.toBlob(resolve, "image/png"));
  const fileName = item ? `${slugFileName(item.title)}-${format}.png` : `share-${format}.png`;

  const saveImage = async () => {
    const blob = await getBlob();
    if (!blob) { setMessage("Could not create the image. Try again."); return; }
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    setMessage("Image saved. You can share it anywhere.");
  };

  const shareImage = async () => {
    if (!item) return;
    const blob = await getBlob();
    if (blob) {
      const file = new File([blob], fileName, { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: item.title, text: shareCaption(item) });
          return;
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    if (navigator.share) {
      try { await navigator.share({ title: item.title, text: shareCaption(item), url: item.url || window.location.href }); return; }
      catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
    }
    setMessage("Press and hold the preview image to save it, then choose Instagram, WhatsApp or Snapchat.");
  };

  const copy = async (text: string, success: string) => {
    try { await navigator.clipboard.writeText(text); setMessage(success); }
    catch { setMessage("Clipboard access is unavailable in this browser."); }
  };

  const selectedFormat = SHARE_FORMATS[format];
  return <Dialog open={Boolean(item)} onClose={close} title="Customise and share" className="share-designer-dialog">
    {item && <div className="share-designer">
      <div className="share-format-tabs" role="tablist" aria-label="Share format">{(Object.keys(SHARE_FORMATS) as ShareFormat[]).map((key) => <button key={key} type="button" role="tab" aria-selected={format === key} onClick={() => { setFormat(key); setMessage(""); }}>{SHARE_FORMATS[key].name}<span>{SHARE_FORMATS[key].width} × {SHARE_FORMATS[key].height}</span></button>)}</div>
      <div className={`share-preview-area share-preview-${format}`}>
        <div className="share-canvas-wrap">
          <canvas ref={canvasRef} aria-label={`${selectedFormat.name} image preview for ${item.title}`}/>
          {format === "story" && safeArea && <><span className="share-safe-band share-safe-top"/><span className="share-safe-band share-safe-bottom"/></>}
        </div>
        {format === "link" && <div className="share-platform-mocks" aria-label="How the link card looks in messaging and social apps"><article><span>WhatsApp</span><strong>{item.title}</strong><small>{item.site}</small></article><article><span>LinkedIn</span><strong>{item.title}</strong><small>{item.site}</small></article><article><span>X</span><strong>{item.title}</strong><small>{item.site}</small></article></div>}
      </div>
      <div className="share-designer-options">
        <fieldset><legend>Choose a look</legend><div className="share-template-swatches">{templateOrder.map((key) => <button key={key} type="button" aria-pressed={template === key} onClick={() => setTemplate(key)} style={{ background: `linear-gradient(135deg, ${SHARE_TEMPLATES[key].blobs[0]}, ${SHARE_TEMPLATES[key].blobs[1]}, ${SHARE_TEMPLATES[key].blobs[2]})` }}><span>{SHARE_TEMPLATES[key].name}</span></button>)}</div></fieldset>
        {format === "story" && <label className="share-safe-toggle"><input type="checkbox" checked={safeArea} onChange={(event) => setSafeArea(event.target.checked)}/>Show Instagram safe area</label>}
      </div>
      <div className="share-designer-actions"><button type="button" className="button" onClick={shareImage}><Icon name="share" size={17}/>Share</button><button type="button" className="button button-secondary" onClick={saveImage}>Save image</button><button type="button" className="button button-secondary" onClick={() => copy(shareCaption(item), "Caption copied.")}>Copy caption</button><button type="button" className="button button-secondary" onClick={() => copy(item.url || window.location.href, "Link copied.")}>Copy link</button></div>
      <p className="share-designer-note" aria-live="polite">{message || (format === "story" ? "Tap Share and choose Instagram, WhatsApp or Snapchat. Striped bands preview where app controls may cover the image." : format === "post" ? "A square image for your feed." : "A landscape preview for links shared in chat or on social platforms.")}</p>
    </div>}
  </Dialog>;
}

export function ShareButton({ item, className = "button button-secondary" }: { item: ShareRequest; className?: string }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent("share:open", { detail: item }))}><Icon name="share" size={17}/>Share to story</button>;
}

export function SharePreviewCard({ item, template = "aurora" }: { item: ShareRequest; template?: ShareTemplate }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    canvas.width = SHARE_FORMATS.link.width;
    canvas.height = SHARE_FORMATS.link.height;
    drawShareCard(context, item, "link", template);
  }, [item, template]);
  return <section className="share-preview-card"><div><span className="page-kicker">Share preview</span><h2>Ready to pass along.</h2><p>See how this looks when someone shares the link.</p><ShareButton item={item}/></div><canvas ref={canvasRef} aria-label={`Link preview image for ${item.title}`}/></section>;
}
