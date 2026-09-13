"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Palette, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { accents } from "@/lib/site";
import { useAccent } from "@/components/accent-provider";
import { useMounted } from "@/hooks/use-mounted";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const MODES = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "system", label: "System", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { accent, setAccent } = useAccent();
  const mounted = useMounted();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Theme and accent colour"
              className={cn(
                "text-chrome-foreground hover:bg-chrome-border/60 hover:text-brand",
                className
              )}
            >
              {/* render a stable icon until mounted so SSR and CSR agree */}
              {!mounted ? (
                <Palette />
              ) : resolvedTheme === "dark" ? (
                <Moon />
              ) : (
                <Sun />
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Theme &amp; colour</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        {MODES.map(({ key, label, icon: Icon }) => (
          <DropdownMenuItem key={key} onSelect={() => setTheme(key)}>
            <Icon />
            {label}
            {mounted && theme === key && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Accent colour</DropdownMenuLabel>
        <div className="grid grid-cols-5 gap-1.5 p-2">
          {accents.map((preset) => (
            <button
              key={preset.key}
              type="button"
              aria-label={preset.label}
              aria-pressed={accent === preset.key}
              onClick={() => setAccent(preset.key)}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-md border-2 transition-transform hover:scale-110",
                accent === preset.key ? "border-foreground" : "border-transparent"
              )}
              style={{
                backgroundColor: `oklch(0.728 ${preset.chroma} ${preset.value})`,
              }}
            >
              {accent === preset.key && (
                <Check className="size-4 text-black/80" strokeWidth={3} />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
