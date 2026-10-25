"use server";

export type ContactState = {
  status: "idle" | "error" | "unavailable" | "success";
  message: string;
  errors: Partial<Record<"name" | "email" | "message", string>>;
};

export async function submitContact(_: ContactState, formData: FormData): Promise<ContactState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const company = String(formData.get("company") || "").trim();
  if (company) return { status: "success", message: "Thanks — your message is in.", errors: {} };

  const errors: ContactState["errors"] = {};
  if (name.length < 2 || name.length > 80) errors.name = "Please enter a name between 2 and 80 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) errors.email = "Please enter a valid email address.";
  if (message.length < 20 || message.length > 3000) errors.message = "Please write between 20 and 3,000 characters.";
  if (Object.keys(errors).length) return { status: "error", message: "Please check the highlighted fields.", errors };

  return {
    status: "unavailable",
    message: "The private inbox is being connected. Your message was not stored yet — please use a social contact when its owner-supplied link appears here.",
    errors: {},
  };
}
