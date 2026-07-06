import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "destructive"
  | "outline"
  | "get"
  | "post"
  | "patch"
  | "delete";

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "api-status-badge--default",
  success: "api-status-badge--success",
  warning: "api-status-badge--warning",
  destructive: "api-status-badge--destructive",
  outline: "api-status-badge--outline",
  get: "api-status-badge--get",
  post: "api-status-badge--post",
  patch: "api-status-badge--patch",
  delete: "api-status-badge--delete",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span className={cn("api-status-badge", VARIANT_CLASS[variant], className)} {...props} />
  );
}

/** Map HTTP method to badge variant */
export function methodBadgeVariant(method: string): BadgeVariant {
  switch (method.toUpperCase()) {
    case "GET":
      return "get";
    case "POST":
      return "post";
    case "PATCH":
      return "patch";
    case "DELETE":
      return "delete";
    default:
      return "outline";
  }
}

export { Badge };
