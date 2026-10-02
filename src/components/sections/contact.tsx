import React from "react";
import { ContactForm } from "../contact-form";
import { SectionHead } from "../section-head";

export const Contact = () => {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap">
        <div className="col">
          <SectionHead station="contact" title="Get in touch">
            I’m currently looking for new opportunities. Whether you have a
            question or want to say hi, I’d love to hear from you.
          </SectionHead>
          <ContactForm />
        </div>
      </div>
    </section>
  );
};
