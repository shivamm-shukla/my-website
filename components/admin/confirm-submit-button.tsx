"use client";

export function ConfirmSubmitButton({ children, prompt, className }: { children: React.ReactNode; prompt: string; className?: string }) {
  return <button className={className} type="submit" onClick={(event) => { if (!window.confirm(prompt)) event.preventDefault(); }}>{children}</button>;
}
