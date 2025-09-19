import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { Container } from "../container";

export const Footer = () => {
  return (
    <Container className="flex justify-between border-t border-neutral-100 px-10 py-3 md:py-3 dark:border-neutral-800">
      <p className="text-xs text-neutral-500">Built with love by Andre Galea</p>
      <div className="flex items-center justify-center gap-4">
        <Link href="https://x.com/mannupaaji">
          <IconBrandX className="size-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200" />
        </Link>
        <Link href="https://linkedin.com/in/manuarora28">
          <IconBrandLinkedin className="size-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200" />
        </Link>
        <Link href="https://github.com/manuarora700">
          <IconBrandGithub className="size-4 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200" />
        </Link>
      </div>
    </Container>
  );
};
