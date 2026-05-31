"use client";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import React from "react";

type AlertType = "error"|"success"|"warning"|"info";

const cfg: Record<AlertType,{ bg:string; icon:React.ReactNode }> = {
  error:   { bg:"bg-red-50 border-red-200 text-red-800",      icon:<AlertCircle   className="w-4 h-4 text-red-600 shrink-0" /> },
  success: { bg:"bg-green-50 border-green-200 text-green-800", icon:<CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> },
  warning: { bg:"bg-yellow-50 border-yellow-200 text-yellow-800", icon:<AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" /> },
  info:    { bg:"bg-blue-50 border-blue-200 text-blue-800",    icon:<Info         className="w-4 h-4 text-blue-600 shrink-0" /> },
};

export function Alert({ type="info", message, className }: { type?:AlertType; message:string; className?:string }) {
  const { bg, icon } = cfg[type];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border p-3 text-sm", bg, className)}>
      {icon}
      <span>{message}</span>
    </div>
  );
}
