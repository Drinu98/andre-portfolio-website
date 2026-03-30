import { z } from "zod";

const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(MAX_NAME, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(MAX_MESSAGE, "Message is too long"),
  turnstileToken: z
    .string()
    .trim()
    .min(1, "Spam check failed. Please try again."),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

