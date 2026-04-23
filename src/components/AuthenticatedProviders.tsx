import { lazy, Suspense, type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";

const Toaster = lazy(() =>
  import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })),
);
const Sonner = lazy(() =>
  import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })),
);

const queryClient = new QueryClient();

interface AuthenticatedProvidersProps {
  children?: ReactNode;
}

/**
 * Wraps routes that require global providers (React Query, Tooltips, Toasts).
 * The landing page ("/") intentionally does NOT use this wrapper to keep its
 * initial bundle small.
 */
const AuthenticatedProviders = ({ children }: AuthenticatedProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {children ?? <Outlet />}
      <Suspense fallback={null}>
        <Toaster />
        <Sonner />
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
);

export default AuthenticatedProviders;