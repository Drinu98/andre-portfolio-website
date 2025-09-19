import React from "react";
import Marquee from "react-fast-marquee";
import { SectionHeading } from "./section-heading";

export const Testimonials = () => {
  const data = [
    {
      quote: `Andre built my website from scratch, he did a fantastic job and had a deep appreciation of my requirements, good communication. Highly recommend`,
      name: "FPL Focal",
      avatar:
        "/images/logos/focal.webp",
    },
    {
      quote: `Working with Manu was a game-changer for our startup. His technical expertise and problem-solving skills are unmatched.`,
      name: "Mark Zuckerberg",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=3744&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: `Manu delivered our project ahead of schedule and exceeded all expectations. His attention to detail is remarkable.`,
      name: "Sundar Pichai",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=5184&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: `The quality of Manu's code is exceptional. He built a scalable solution that has been critical to our business growth.`,
      name: "Jeff Bezos",
      avatar:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=5360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      quote: `Manu's innovative approach to our complex requirements saved us months of development time. Truly a 10x engineer.`,
      name: "Satya Nadella",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  return (
    <div className="my-4 px-4 py-4">
      <SectionHeading className="mb-4" delay={0.8}>
        People love my work
      </SectionHeading>
      <div className="flex [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
        <Marquee speed={20} pauseOnHover className="py-4">
          {data.map((item, idx) => (
            <TestimonialCard key={`testimonial-${idx}`} {...item} />
          ))}
        </Marquee>
      </div>
    </div>
  );
};

const TestimonialCard = ({
  quote,
  name,
  avatar,
}: {
  quote: string;
  name: string;
  avatar: string;
}) => {
  return (
    <div className="mx-4 flex h-50 w-full max-w-60 flex-col justify-between gap-4 rounded-xl p-4 shadow-[var(--shadow-aceternity)] transition duration-300 hover:shadow-md">
      <p className="text-sm text-neutral-700 dark:text-neutral-200">{quote}</p>
      <div className="flex items-center gap-2">
        <img
          src={avatar}
          alt={name}
          className="size-4 rounded-full object-cover"
        />
        <p className="text-sm text-neutral-500 dark:text-neutral-300">{name}</p>
      </div>
    </div>
  );
};
