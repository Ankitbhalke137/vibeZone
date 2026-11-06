"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Client boundary for framer-motion inside server components.
 * Next.js 16 / React 19 cannot render `motion.*` directly from a server page,
 * so server pages import these wrappers instead.
 */
export function MotionDiv(props: HTMLMotionProps<"div">) {
  return <motion.div {...props} />;
}

export function MotionSection(props: HTMLMotionProps<"section">) {
  return <motion.section {...props} />;
}
