"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { contactFormSchema } from "@/lib/contact-schema";
import { PULSE_EVENT } from "./scene/scene-layer";

export const ContactForm = () => {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const clientParsed = contactFormSchema.safeParse({
      ...formData,
      turnstileToken,
    });

    if (!clientParsed.success) {
      toast.error(clientParsed.error.issues[0]?.message ?? "Invalid form data");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(clientParsed.data),
      });

      const json = (await res.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error?: string }
        | null;

      const errorMessage =
        json && "ok" in json && json.ok === false ? json.error : undefined;

      if (!res.ok || !json || (json && "ok" in json && json.ok !== true)) {
        toast.error(errorMessage ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success("Message sent. Thanks!");
      window.dispatchEvent(new Event(PULSE_EVENT));
      setFormData({ name: "", email: "", message: "" });
      setTurnstileToken("");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
      setTurnstileToken("");
      turnstileRef.current?.reset();
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form" data-reveal>
      <div className="field">
        <label htmlFor="name" className="mono">
          01 / Full name
        </label>
        <input
          id="name"
          name="name"
          onChange={handleChange}
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={formData.name}
        />
      </div>
      <div className="field">
        <label htmlFor="email" className="mono">
          02 / Email address
        </label>
        <input
          id="email"
          name="email"
          onChange={handleChange}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={formData.email}
        />
      </div>
      <div className="field">
        <label htmlFor="message" className="mono">
          03 / Message
        </label>
        <textarea
          rows={5}
          id="message"
          name="message"
          onChange={handleChange}
          placeholder="What are you building?"
          value={formData.message}
        />
      </div>
      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
        onSuccess={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken("")}
        onError={() => setTurnstileToken("")}
        options={{ theme: "auto" }}
      />
      <div className="contact-form__foot">
        <button type="submit" disabled={isSubmitting} className="button">
          {isSubmitting ? "Sending..." : "Send message"}
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </form>
  );
};
