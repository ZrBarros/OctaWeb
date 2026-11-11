"use client";

import { createPortal } from "react-dom";
import type { ReactNode } from "react";

export function AdminDialogPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(<div className="admin-dialog-portal">{children}</div>, document.body);
}
