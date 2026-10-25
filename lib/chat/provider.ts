export type ChatMessage = { role: "user" | "assistant"; content: string };

type Provider = "openai" | "anthropic" | "gemini";
const encoder = new TextEncoder();

async function* parseSse(response: Response, extract: (event: Record<string, unknown>) => string | undefined) {
  if (!response.ok || !response.body) throw new Error(`Provider request failed (${response.status}).`);
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split("\n\n"); buffer = blocks.pop() || "";
    for (const block of blocks) for (const line of block.split("\n")) if (line.startsWith("data:")) {
      const data = line.slice(5).trim(); if (!data || data === "[DONE]") continue;
      try { const delta = extract(JSON.parse(data) as Record<string, unknown>); if (delta) yield encoder.encode(delta); } catch {}
    }
  }
}

export async function streamProvider(messages: ChatMessage[], instructions: string): Promise<ReadableStream<Uint8Array>> {
  const provider = (process.env.CHAT_PROVIDER || "openai") as Provider;
  const model = process.env.CHAT_MODEL || "";
  const key = process.env.CHAT_API_KEY || "";
  if (!key || !model) throw new Error("Chat provider is not configured.");
  let iterator: AsyncGenerator<Uint8Array>;
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify({ model, max_tokens: 350, system: instructions, messages, stream: true }), signal: AbortSignal.timeout(20_000) });
    iterator = parseSse(response, (event) => event.type === "content_block_delta" ? String((event.delta as Record<string, unknown>)?.text || "") : undefined);
  } else if (provider === "gemini") {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(key)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: instructions }] }, contents: messages.map((message) => ({ role: message.role === "assistant" ? "model" : "user", parts: [{ text: message.content }] })), generationConfig: { maxOutputTokens: 350 } }), signal: AbortSignal.timeout(20_000) });
    iterator = parseSse(response, (event) => String((((event.candidates as Array<Record<string, unknown>>)?.[0]?.content as Record<string, unknown>)?.parts as Array<Record<string, unknown>>)?.[0]?.text || ""));
  } else {
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${key}` }, body: JSON.stringify({ model, store: false, stream: true, input: [{ role: "developer", content: instructions }, ...messages] }), signal: AbortSignal.timeout(20_000) });
    iterator = parseSse(response, (event) => event.type === "response.output_text.delta" ? String(event.delta || "") : undefined);
  }
  return new ReadableStream({ async start(controller) { try { for await (const chunk of iterator) controller.enqueue(chunk); controller.close(); } catch (error) { controller.error(error); } } });
}
