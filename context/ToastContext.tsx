// @ts-nocheck
import { createContext, ReactNode, useCallback, useContext, useRef, useState } from "react";
import { ToastOverlay } from "../components/ui/Toast";

export type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextValue {
  show: (opts: { message: string; kind?: ToastKind; duration?: number }) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // No provider mounted — silent no-op so screens don't crash.
    return {
      show: () => {},
      dismiss: () => {},
    };
  }
  return ctx;
}

const DEFAULT_DURATION = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({
      message,
      kind = "info",
      duration = DEFAULT_DURATION,
    }: {
      message: string;
      kind?: ToastKind;
      duration?: number;
    }) => {
      const id = nextId.current++;
      setToasts((list) => [...list, { id, message, kind }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      <ToastOverlay toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
