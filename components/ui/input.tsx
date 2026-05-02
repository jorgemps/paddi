import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-10 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 text-sm outline-none transition focus:border-paddi-teal focus:ring-4 focus:ring-teal-500/10", className)} {...props} />;
}
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 text-sm outline-none transition focus:border-paddi-teal focus:ring-4 focus:ring-teal-500/10", className)} {...props} />;
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("min-h-28 w-full rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm outline-none transition focus:border-paddi-teal focus:ring-4 focus:ring-teal-500/10", className)} {...props} />;
}
