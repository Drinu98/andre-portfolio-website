import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactFormSchema } from "@/lib/contact-schema";

type TurnstileVerifyResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
};

async function verifyTurnstileToken(args: {
  token: string;
  ip?: string | null;
}) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing TURNSTILE_SECRET_KEY");
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", args.token);
  if (args.ip) form.set("remoteip", args.ip);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    },
  );

  if (!res.ok) {
    throw new Error(`Turnstile verify failed: ${res.status}`);
  }

  const json = (await res.json()) as TurnstileVerifyResponse;
  return json;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form data", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;

    const turnstile = await verifyTurnstileToken({
      token: parsed.data.turnstileToken,
      ip,
    });

    if (!turnstile.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Spam check failed",
          codes: turnstile["error-codes"] ?? [],
        },
        { status: 400 },
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    if (!resendKey) throw new Error("Missing RESEND_API_KEY");
    if (!to) throw new Error("Missing CONTACT_TO_EMAIL");
    if (!from) throw new Error("Missing CONTACT_FROM_EMAIL");

    const resend = new Resend(resendKey);
    const { name, email, message } = parsed.data;

    const subject = `Portfolio contact from ${name}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      message,
      "",
      `IP: ${ip ?? "unknown"}`,
    ].join("\n");

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;">
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space: pre-wrap; line-height: 1.4;">${escapeHtml(
          message,
        )}</pre>
        <hr />
        <p style="color: #666; font-size: 12px;">IP: ${escapeHtml(
          ip ?? "unknown",
        )}</p>
      </div>
    `.trim();

    const result = await resend.emails.send({
      from,
      to,
      subject,
      replyTo: email,
      text,
      html,
    });

    if (result.error) {
      return NextResponse.json(
        { ok: false, error: "Email send failed", details: result.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

