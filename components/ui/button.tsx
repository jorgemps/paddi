import * as React from "react";
import { cn } from "@/lib/utils";
type Variant = "default"|"outline"|"ghost"|"danger"|"success"|"teal";
type Size = "default"|"sm"|"lg"|"icon";
export function Button({ className, variant="default", size="default", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition active:scale-[.99] disabled:opacity-50 disabled:pointer-events-none",
    size==="default" && "h-10 px-4 text-sm",
    size==="sm" && "h-8 px-3 text-xs",
    size==="lg" && "h-12 px-6 text-base",
    size==="icon" && "h-10 w-10",
    variant==="default" && "bg-paddi-navy text-white hover:bg-slate-800 shadow-soft",
    variant==="teal" && "bg-paddi-teal text-white hover:bg-teal-600 shadow-lift",
    variant==="outline" && "border border-slate-200 bg-white/80 hover:bg-white",
    variant==="ghost" && "hover:bg-slate-100",
    variant==="danger" && "bg-rose-600 text-white hover:bg-rose-700",
    variant==="success" && "bg-emerald-600 text-white hover:bg-emerald-700",
    className
  )} {...props} />;
}
