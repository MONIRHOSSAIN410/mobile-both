"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/lib/utils";

/**
 * Moves its children against the scroll direction.
 * `speed` is how far (in px) the layer travels across the whole section.
 */
export function ParallaxLayer({
  children,
  className,
  speed = 80,
  axis = "y",
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  axis?: "x" | "y";
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  const distance = reduced ? 0 : speed;
  const move = useTransform(smooth, [0, 1], [distance, -distance]);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      style={axis === "y" ? { y: move } : { x: move }}
    >
      {children}
    </motion.div>
  );
}

/** A full-bleed band whose background drifts as you scroll past it. */
export function ParallaxSection({
  children,
  className,
  innerClassName,
  strength = 120,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  strength?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [-strength, strength]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1, 1.12]);

  return (
    <section
      ref={ref}
      className={cn("relative isolate overflow-hidden", className)}
    >
      <motion.div
        aria-hidden
        style={{ y, scale }}
        className="pointer-events-none absolute inset-[-20%] -z-10"
      >
        <div className="absolute inset-0 bg-chrome" />
        <div className="absolute inset-0 opacity-70 [background:radial-gradient(60%_60%_at_20%_20%,color-mix(in_oklab,var(--brand)_45%,transparent),transparent_70%),radial-gradient(50%_50%_at_85%_75%,color-mix(in_oklab,var(--brand-soft)_35%,transparent),transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:52px_52px]" />
      </motion.div>
      <div className={cn("container-page relative", innerClassName)}>{children}</div>
    </section>
  );
}

/** Thin gold progress bar pinned under the header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="bg-brand fixed inset-x-0 top-0 z-[60] h-0.5 origin-left"
    />
  );
}
