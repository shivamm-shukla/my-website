"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { Icon } from "@/components/ui/icon";

const initialState: ContactState = { status: "idle", message: "", errors: {} };

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initialState);
  return <form className="contact-form" action={action} noValidate>
    <div className="form-field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" autoComplete="name" required aria-describedby={state.errors.name ? "name-error" : undefined} />{state.errors.name && <span id="name-error" className="field-error">{state.errors.name}</span>}</div>
    <div className="form-field"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" autoComplete="email" required aria-describedby={state.errors.email ? "email-error" : undefined} />{state.errors.email && <span id="email-error" className="field-error">{state.errors.email}</span>}</div>
    <div className="form-field form-field-wide"><label htmlFor="contact-message">What do you have in mind?</label><textarea id="contact-message" name="message" rows={6} required aria-describedby={state.errors.message ? "message-error" : undefined} />{state.errors.message && <span id="message-error" className="field-error">{state.errors.message}</span>}</div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="contact-company">Company website</label><input id="contact-company" name="company" tabIndex={-1} autoComplete="off" /></div>
    <div className="form-submit"><button className="button" type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}<Icon name="send" size={17} /></button><p className={`form-status form-status-${state.status}`} aria-live="polite">{state.message}</p></div>
  </form>;
}
