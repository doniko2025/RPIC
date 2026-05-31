import { cn } from "@/lib/utils";

export function Spinner({ size="md", className }: { size?:"sm"|"md"|"lg"; className?: string }) {
  const s = { sm:"w-4 h-4 border-2", md:"w-6 h-6 border-2", lg:"w-8 h-8 border-[3px]" };
  return (
    <div className={cn("rounded-full border-brand-300 border-t-brand-700 animate-spin",s[size],className)} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );
}
