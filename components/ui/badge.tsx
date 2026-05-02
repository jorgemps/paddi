import { cn } from "@/lib/utils";
const tones = {
  default:"bg-slate-100 text-slate-700 border-slate-200",
  success:"bg-emerald-50 text-emerald-700 border-emerald-200",
  warning:"bg-amber-50 text-amber-700 border-amber-200",
  danger:"bg-rose-50 text-rose-700 border-rose-200",
  info:"bg-sky-50 text-sky-700 border-sky-200",
  teal:"bg-teal-50 text-teal-700 border-teal-200",
  dark:"bg-paddi-navy text-white border-paddi-navy"
};
export type Tone = keyof typeof tones;
export function Badge({ tone="default", className, children }:{ tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}
