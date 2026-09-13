import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Entrance animations, done in CSS.
 *
 * These used to be `motion/react` components with `initial={{opacity: 0}}` and
 * `whileInView`. That meant the server-rendered HTML shipped with everything at
 * opacity 0 and the page stayed BLANK until the JavaScript bundle had
 * downloaded, hydrated and an IntersectionObserver had fired — which on a cold
 * dev build is several seconds. A 24-card grid then staggered in on top of that.
 *
 * A CSS animation starts on the very first paint instead: no JS, no hydration,
 * no observer. The markup is also plain HTML now, so these no longer drag
 * `motion` into the client bundle of every page that shows a product.
 */

type Direction = "up" | "down" | "left" | "right" | "none";

const OFFSETS: Record<Direction, { x: string; y: string }> = {
  up: { x: "0px", y: "18px" },
  down: { x: "0px", y: "-18px" },
  left: { x: "18px", y: "0px" },
  right: { x: "-18px", y: "0px" },
  none: { x: "0px", y: "0px" },
};

type RevealVars = React.CSSProperties &
  Record<"--reveal-x" | "--reveal-y" | "--reveal-delay" | "--reveal-duration", string>;

function vars(direction: Direction, delay: number, duration: number): RevealVars {
  const offset = OFFSETS[direction];
  return {
    "--reveal-x": offset.x,
    "--reveal-y": offset.y,
    "--reveal-delay": `${delay}s`,
    "--reveal-duration": `${duration}s`,
  };
}

/** Fades a block in on first paint. */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  duration?: number;
  /** Kept for compatibility with the old motion API — CSS only runs once. */
  once?: boolean;
}) {
  return (
    <div className={cn("reveal", className)} style={vars(direction, delay, duration)}>
      {children}
    </div>
  );
}

/** Wrap a grid; each <RevealItem> child fades in just after the previous one. */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function RevealItem({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  /** Position in the grid — drives a short, capped stagger. */
  index?: number;
}) {
  // Cap the cascade: card 30 must not wait a second and a half to show up.
  const delay = Math.min(index, 7) * 0.04;
  return (
    <div className={cn("reveal", className)} style={vars("up", delay, 0.45)}>
      {children}
    </div>
  );
}
