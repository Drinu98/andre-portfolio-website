"use client";
import React, { useState } from "react";
import { toast } from "sonner";

export const ContactForm = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handle submit clicked");

    const { name, email, message } = formData;

    if (!name || !email || !message) {
      toast.error("Please fill all the fields");
      return;
    }

    // call your API here to submit the form.
    // here's a mock API call for you.

    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve("API call successful");
      }, 1000);
    });

    if (response) {
      toast.success("Form submitted successfully");
    } else {
      toast.error("Something went wrong");
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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
            type="text"
            placeholder="tyler@projectmayhem.com"
            className="focus:ring-primary rounded-md px-2 py-2 text-sm shadow-[var(--shadow-aceternity)] focus:ring-2 focus:outline-none"
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
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-neutral-200 bg-neutral-100 px-4 py-1.5 text-sm text-neutral-700 shadow-[0px_4px_8px_0px_var(--color-neutral-200)_inset] transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:shadow-[0px_4px_8px_0px_var(--color-neutral-700)_inset]"
        >
          Send message
        </button>
      </div>
    </form>
  );
};
