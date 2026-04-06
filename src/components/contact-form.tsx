"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { contactFormSchema } from "@/lib/contact-schema";

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
    <form
      onSubmit={handleSubmit}
      className="shadow-section-inset dark:shadow-section-inset-dark my-6 border-y border-neutral-100 px-4 py-12 dark:border-neutral-800"
    >
      <div className="flex max-w-lg flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="name"
            className="text-sm font-medium tracking-tight text-neutral-600"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            onChange={handleChange}
            type="text"
            placeholder="Tyler Durden"
            className="focus:ring-primary rounded-md px-2 py-2 text-sm shadow-[var(--shadow-aceternity)] focus:ring-2 focus:outline-none"
            value={formData.name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium tracking-tight text-neutral-600"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            onChange={handleChange}
            type="email"
            placeholder="tyler@projectmayhem.com"
            className="focus:ring-primary rounded-md px-2 py-2 text-sm shadow-[var(--shadow-aceternity)] focus:ring-2 focus:outline-none"
            value={formData.email}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="message"
            className="text-sm font-medium tracking-tight text-neutral-600"
          >
            Message
          </label>
          <textarea
            rows={5}
            id="message"
            name="message"
            onChange={handleChange}
            placeholder="You're crazy good, never change."
            className="focus:ring-primary resize-none rounded-md px-2 py-1 text-sm shadow-[var(--shadow-aceternity)] focus:ring-2 focus:outline-none"
            value={formData.message}
          />
        </div>
        <div className="pt-1">
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
            onError={() => setTurnstileToken("")}
            options={{ theme: "auto" }}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700 shadow-[0px_4px_8px_0px_var(--color-neutral-200)_inset] transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0px_4px_8px_0px_var(--color-neutral-700)_inset]"
        >
          {isSubmitting ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
};
