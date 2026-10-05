import React from "react";
import { ContactForm } from "../contact-form";
import { SectionHead } from "../section-head";

export const Contact = () => {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="col">
          <SectionHead station="contact" title="Get in touch">
            Have a website, web app or mobile app in mind? Tell me what you’re
            building. I take on projects for clients in Malta and worldwide,
            and I’d love to hear from you.
          </SectionHead>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};
